import { describe, expect, it } from "vitest";
import { S3StorageProvider } from "@packages/shared/utilities/storage/impl-s3";
import { v4 } from "uuid";

const s3 = () =>
  new S3StorageProvider({
    url: "http://127.0.0.1:54321/storage/v1/s3",
    region: "local",
    bucket: "projdocs",
    keys: {
      access: "625729a08b95bf1b7ff351a663f3a23c",
      secret:
        "850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907",
    },
  });

describe("mkdir", () => {
  it("creates a nexted directory (leading and trailing /)", async () => {
    const { data, error } = await s3().mkdir(`/${v4()}/${v4()}`);
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("creates a directory (leading and trailing /)", async () => {
    const { data, error } = await s3().mkdir(`/${v4()}/`);
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("creates a directory (leading /)", async () => {
    const { data, error } = await s3().mkdir(`/${v4()}`);
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("creates a directory (trailing /)", async () => {
    const { data, error } = await s3().mkdir(`${v4()}/`);
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("creates a directory (no /)", async () => {
    const { data, error } = await s3().mkdir(v4());
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});

describe("ls", () => {
  it("returns files and folders at root level ()", async () => {
    const { data, error } = await s3().ls();
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("returns files and folders at root level ('')", async () => {
    const { data, error } = await s3().ls("");
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("returns files and folders at root level ('/')", async () => {
    const { data, error } = await s3().ls("/");
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
