import { describe, expect, it } from "vitest";
import { GoogleDriveStorageProvider } from "@packages/shared/utilities/storage/impl-google-drive";
import * as fs from "node:fs";

const testKeyPath = "/Users/nrb/Downloads/projdocs-api-connection-4d13d579f595.json";
const key = fs.readFileSync(testKeyPath, "utf8");
const drive = new GoogleDriveStorageProvider(JSON.parse(key), "0AJb1l5urdas7Uk9PVA");

describe("mkdir", () => {
  it("attempts to make a directory", async () => {
        const { data, error } = await drive.mkdir("/Bar")
        expect(error).toBeNull();
        expect(data).toBeDefined();
  })

  it("attempts to make a nested directory", async () => {
    const { data, error } = await drive.mkdir("/bee/boop");
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
})

// describe("ls", () => {
//   it("returns files and folders at root level ()", async () => {
//     const { data, error } = await drive.ls();
//
//     expect(error).toBeNull();
//     expect(data).toBeDefined();
//   });
//
//   it("returns files and folders at root level ('')", async () => {
//     const { data, error } = await drive.ls("");
//     expect(error).toBeNull();
//     expect(data).toBeDefined();
//   });
//
//   it("returns files and folders at root level ('/')", async () => {
//     const { data, error } = await drive.ls("/");
//     expect(error).toBeNull();
//     expect(data).toBeDefined();
//   });
// });