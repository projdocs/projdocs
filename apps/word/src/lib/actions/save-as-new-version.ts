export const saveAsNewVersion: Action = async (event) => {
  console.log("✅ saveAsNewVersion() was called");
  try {
  } catch (e) {
    console.error("saveAsNewVersion error:", e);
  } finally {
    event.completed();
  }
};