import keytar from "keytar";
import { getTrayWindow } from "@workspace/desktop/electron/src/tray";
import { SERVICE_ID } from "@workspace/desktop/electron/src/secrets/consts";
import { Events } from "@workspace/desktop/electron/src/ipc/types";
import { HttpServer } from "@workspace/desktop/electron/src/http";



const ACCOUNT_ID = "00000000-0000-0000-0000-000000000000";

const set = async (secret: string) => {
  await keytar.setPassword(SERVICE_ID, ACCOUNT_ID, secret);
  HttpServer.auth.set(secret.trim().length > 0 ? JSON.parse(secret) : null);
  getTrayWindow()?.webContents.send(Events.AUTH_UPDATE); // broadcast an update event
};

const get = async () =>
  await keytar.getPassword(SERVICE_ID, ACCOUNT_ID);

const remove = async () => {
  await keytar.deletePassword(SERVICE_ID, ACCOUNT_ID);
  getTrayWindow()?.webContents.send(Events.AUTH_UPDATE); // broadcast an update event
};

const list = async () =>
  await keytar.findCredentials(SERVICE_ID);

export const Secrets = { get, set, remove, list };



