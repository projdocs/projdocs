import { CONSTANTS } from "@workspace/word/lib/consts";
import Group = Office.Group;


// @ts-expect-error meta.env.MODE
export const isDev = import.meta.env.MODE === "development";
export const baseUrl = isDev
  ? "https://localhost:8000"
  : "https://word.projdocs.com";


export function saveSettings(): Promise<void> {
  return new Promise((resolve, reject) => {
    Office.context.document.settings.saveAsync((res) => {
      if (res.status === Office.AsyncResultStatus.Succeeded) resolve();
      else reject(res.error);
    });
  });
}

export const setButtons = async (map: Array<[ string, Array<Office.Control> ]>) =>
  await Office.ribbon.requestUpdate({
    tabs: [
      {
        id: CONSTANTS.WORD.TAB.ID,
        groups: map.map(([ item, record ]) => (
            {
              id: item,
              controls: record,
            } satisfies Group
          )
        ),
      },
    ],
  });