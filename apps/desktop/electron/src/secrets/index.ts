import keytar from "keytar";
import { getTrayWindow } from "@workspace/desktop/electron/src/tray";
import { AUTH_UPDATE_EVENT, SERVICE_ID } from "@workspace/desktop/electron/src/secrets/consts";



const ACCOUNT_ID = "00000000-0000-0000-0000-000000000000";

const set = async (secret: string) => {
  await keytar.setPassword(SERVICE_ID, ACCOUNT_ID, secret);
  getTrayWindow()?.webContents.send(AUTH_UPDATE_EVENT); // broadcast an update event
};

const get = async () =>
  await keytar.getPassword(SERVICE_ID, ACCOUNT_ID);

const remove = async () => {
  await keytar.deletePassword(SERVICE_ID, ACCOUNT_ID);
  getTrayWindow()?.webContents.send(AUTH_UPDATE_EVENT); // broadcast an update event
};

const list = async () =>
  await keytar.findCredentials(SERVICE_ID);

export const Secrets = { get, set, remove, list };



