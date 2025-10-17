import keytar from "keytar";
import { getTrayWindow } from "@workspace/desktop/electron/tray";



const ACCOUNT_ID = "00000000-0000-0000-0000-000000000000";
export const SERVICE_ID = "com.projdocs.desktop";

export const set = async (secret: string) => {
  await keytar.setPassword(SERVICE_ID, ACCOUNT_ID, secret);
  getTrayWindow()?.webContents.send("auth:update"); // broadcast an update event
};

export const get = async () =>
  await keytar.getPassword(SERVICE_ID, ACCOUNT_ID);

export const remove = async () => {
  await keytar.deletePassword(SERVICE_ID, ACCOUNT_ID);
  getTrayWindow()?.webContents.send("auth:update"); // broadcast an update event
}

export const list = async () =>
  await keytar.findCredentials(SERVICE_ID);



