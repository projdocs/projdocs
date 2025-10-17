export const setButtons = async (map: Record<string, Omit<Office.Control, "id">>) =>
  await Office.ribbon.requestUpdate({
    tabs: [
      {
        id: "TabHome",
        groups: [
          {
            id: "CommandsGroup",
            controls: Object.entries(map).map(([ id, control ]) => ({
              id,
              enabled: control.enabled,
            }) as Office.Control),
          },
        ],
      },
    ],
  });