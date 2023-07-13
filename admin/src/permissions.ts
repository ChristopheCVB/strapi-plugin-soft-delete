import { plugin } from "../../utils";

const permissions = {
  main: [{ action: `plugin::${plugin.pluginId}.read`, subject: null }],
  settings: [{ action: `plugin::${plugin.pluginId}.settings`, subject: null }],
};
export default permissions;
