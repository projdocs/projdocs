import { Step } from "@workspace/web/app/setup/types";
import { Building } from "lucide-react";
import { P } from "@workspace/ui/components/text";
import { Input } from "@workspace/ui/components/input";
import { DisplayDomain } from "@workspace/supabase/domains";
import { useState } from "react";
import ImageCropper from "@workspace/web/components/image-cropper";
import { createClient } from "@workspace/supabase/client";
import { decode } from "base64-arraybuffer";



const component: Step["component"] = (store) => {

  const [ nameTouched, setNameTouched ] = useState<boolean>(false);

  return (
    <div className={"w-full flex flex-col gap-4"}>

      <div>
        <P className={"font-bold"}>{"Name"}</P>
        <Input
          onBlur={() => setNameTouched(true)}
          value={store.state.company.name}
          onChange={(e) => store.set("company", "name", e.target.value)}
          placeholder={"A Random Company, Inc."}
          aria-invalid={nameTouched && !DisplayDomain.test(store.state.company.name)}
        />
      </div>

      <div className={"w-full flex flex-col items-center"}>
        <P className={"font-bold w-full"}>{"Logo"}</P>
        <ImageCropper
          title={"No Logo Uploaded"}
          description={"Upload a company logo to enhance brand recognition and identity."}
          file={store.state.company.logoFile}
          setFile={(file) => store.set("company", "logoFile", file)}
          croppedImage={store.state.company.logoImage}
          setCroppedImage={(image) => store.set("company", "logoImage", image)}
        />
      </div>

    </div>
  );

};

export const SetupCompany: Step = {
  title: "Company",
  component: component,
  icon: Building,
  beforeNext: async (store) => {
    if (!DisplayDomain.test(store.state.company.name)) return {
      canContinue: false,
      error: "Company name must start with a letter or number, followed by a letter, number, period (.), ampersand (&), or hyphen (-), and end with a letter, number, or period (.)."
    };

    const supabase = createClient();

    // upload the image
    let logoURL: string | null = null;
    if (store.state.company.logoImage !== null) {

      if (!store.state.company.logoImage.startsWith("data:image/png;base64,")) return {
        canContinue: false,
        error: "Cropped image is unexpectedly not a png file."
      };

      const bucket = "company-public";
      const filename = "logo.png";
      const res = await supabase.storage.from(bucket).upload(filename, decode(store.state.company.logoImage.split("base64,")[1]!), {
        upsert: true,
        contentType: "image/png",
      });
      if (res.error) return {
        canContinue: false,
        error: `failed to upload logo: ${res.error.message}`,
      };

      const base = ((window as Window).env!.SUPABASE_PUBLIC_URL).replace(/\/$/, "");
      logoURL = `${base}/storage/v1/object/public/${bucket}/${filename}`;
    }

    // update the company object
    const { error } = await supabase.from("company").update({
      logo_url: logoURL,
      name: store.state.company.name,
    }).eq("id", true).single();

    if (error) return {
      canContinue: false,
      error: `failed to update company: ${error.message}`
    };

    return {
      canContinue: true,
    };
  }
};