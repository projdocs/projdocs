import { handle, withAuth } from "@workspace/web/lib/api";
import { createClient } from "@workspace/web/lib/supabase/server";
import { json2xml, xml2json } from "xml-js";
import { CONSTANTS } from "@workspace/word/src/lib/consts";
import JSZip from "jszip";
import { uploadFile } from "@workspace/web/lib/supabase/upload-file";
import { JSONSchemaType } from "ajv";
import { Tables } from "@workspace/supabase/types";
import { DetailedError } from "tus-js-client";



type RequestBody = {
  file: {
    name: string;
    base64: string;
  }
  directory: Pick<Tables<"directories">, "id">;
}

const schema: JSONSchemaType<RequestBody> = ({
  type: "object",
  required: [ "file", "directory" ],
  properties: {
    file: {
      type: "object",
      required: [ "name", "base64" ],
      properties: {
        name: { type: "string", pattern: "^[^\\\\/:*?\"<>|]+\\.docx$" },
        base64: { type: "string" }
      }
    },
    directory: {
      type: "object",
      required: [ "id" ],
      properties: {
        id: {
          type: "string",
          format: "uuid"
        }
      }
    },
  },
});


export const POST: RouteHandler = withAuth(handle<RequestBody>(schema, async (data) => {

  // validate the file
  const { ok, reason } = await validateWordBase64(data.file.base64);
  if (!ok) return Response.json({
    error: `invalid file: ${reason}`,
  }, { status: 400 });

  const supabase = await createClient();
  const zip = await JSZip.loadAsync(Buffer.from(data.file.base64, "base64"));

  // load directory
  const directory = await supabase.from("directories").select().eq("id", data.directory.id).maybeSingle();
  if (directory.error !== null) return Response.json({
    error: `unable to load directory (id=${data.directory.id}): ${directory.error}`,
  });
  if (directory.data === null) return Response.json({
    error: `unable to load directory (id=${data.directory.id}): not found`,
  }, { status: 400 });

  // load the file
  const settings = await getWebExtensionFiles(zip);
  for (const f of settings) {
    const contents = JSON.parse(xml2json(f.xml));
    if (
      contents.elements.length === 1 &&
      contents.elements[0].name === "we:webextension" &&
      undefined !== contents.elements[0].elements.find((e: any) => e.name === "we:reference" && e.attributes.id.toLowerCase() === CONSTANTS.META.GUID.toLowerCase())
    ) {

      const iProps: number = contents.elements[0].elements.findIndex((e: any) => e.name === "we:properties");


      // create doc
      const existingDocID = contents.elements[0].elements[iProps].elements.find((e: any) => e.name === "we:property" && e.attributes.name === CONSTANTS.SETTINGS.FILE_REF)?.attributes?.value;
      if (existingDocID !== null && existingDocID !== undefined) return Response.json({
        error: `document already exists: ${existingDocID}`,
        hint: "use PUT to create a new version"
      }, { status: 400 });
      const doc = await supabase
        .from("files")
        .insert({
          project_id: directory.data.project_id
        })
        .select()
        .single();
      if (doc.error) return Response.json({
        error: "unable to create file object-row",
        detail: doc.error
      }, { status: 500 });
      contents.elements[0].elements[iProps].elements.push({
        type: "element",
        name: "we:property",
        attributes: { name: CONSTANTS.SETTINGS.FILE_REF, value: `${doc.data.number}` }
      });

      // create version
      const verID = contents.elements[0].elements[iProps].elements.find((e: any) => e.name === "we:property" && e.attributes.name === CONSTANTS.SETTINGS.VERSION_REF)?.attributes?.value;
      if (verID !== null && verID !== undefined) return Response.json({
        error: `document does not exist, but has a version ID: ${verID}`,
      }, { status: 400 });
      contents.elements[0].elements[iProps].elements.push({
        type: "element",
        name: "we:property",
        attributes: { name: CONSTANTS.SETTINGS.VERSION_REF, value: "1" } // will be the first version
      });

      // upload file
      zip.file(f.path, json2xml(JSON.stringify(contents)));
      const newFile = await zip.generateAsync({
        type: "nodebuffer"
      });

      const uploaded = await new Promise<null | Error | DetailedError>((res) => uploadFile(supabase, {
        retry: false,
        directory: data.directory,
        bucket: directory.data!.project_id,
        file: {
          type: "buffer",
          data: newFile,
          name: data.file.name,
          object: { id: doc.data.id }, // new file
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        },
        onSuccess: () => res(null),
        onError: err => res(err)
      }));
      if (uploaded !== null) {
        console.error(uploaded);
        return Response.json({
          error: "unable to upload file",
        }, { status: 400 });
      }

      return Response.json(doc.data);

    }
  }


  return Response.json({}, { status: 201 });

}));


/**
 * Safely validates whether a Base64 string represents a Word (.docx) file.
 * - Protects against ZIP bombs (limits entry count, size, and paths)
 * - Detects required DOCX internal structure
 * - Never fully extracts files to memory
 */
export async function validateWordBase64(base64: string): Promise<{
  ok: boolean;
  reason?: string;
}> {
  try {
    // ---- Step 1: Base64 sanity ----
    if (!/^[A-Za-z0-9+/=]+$/.test(base64)) {
      return { ok: false, reason: "Invalid Base64 characters" };
    }

    const buf = Buffer.from(base64, "base64");
    if (buf.length > 25 * 1024 * 1024) {
      return { ok: false, reason: "Encoded file too large (>25MB)" };
    }

    // ---- Step 2: ZIP signature check ----
    if (buf.readUInt32LE(0) !== 0x04034b50) {
      return { ok: false, reason: "Missing ZIP header (not PK\\x03\\x04)" };
    }

    // ---- Step 3: Parse entries (JSZip)
    const zip = await JSZip.loadAsync(buf);
    const required = new Set([
      "[Content_Types].xml",
      "_rels/.rels",
      "word/document.xml",
    ]);

    const entries = Object.values(zip.files);
    const MAX_ENTRIES = 2000;
    const MAX_TOTAL_PATH_LENGTH = 100_000; // crude sanity fallback for size

    if (entries.length > MAX_ENTRIES) {
      return { ok: false, reason: "Too many entries (potential ZIP bomb)" };
    }

    let totalPathChars = 0;

    for (const entry of entries) {
      const name = entry.name;

      // Path traversal and sanity checks
      if (name.includes("..") || name.startsWith("/")) {
        return { ok: false, reason: "Path traversal attempt detected" };
      }

      totalPathChars += name.length;
      if (totalPathChars > MAX_TOTAL_PATH_LENGTH) {
        return { ok: false, reason: "Path metadata too large (possible bomb)" };
      }

      if (required.has(name)) {
        required.delete(name);
      }
    }

    if (required.size > 0) {
      return { ok: false, reason: "Missing required DOCX internal files" };
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, reason: err.message || "Invalid ZIP structure" };
  }
}

async function getWebExtensionFiles(zip: JSZip) {
  const entries = zip.file(/^word\/webextensions\/webextension\d+\.xml$/);

  const webExtensions: { path: string; xml: string }[] = [];
  for (const entry of entries) {
    const xml = await entry.async("text");
    webExtensions.push({ path: entry.name, xml });
  }
  return webExtensions;
}