import { pluginId } from "../../utils/plugin";

const permissions = {
  main: [{ action: `plugin::${pluginId}.read`, subject: null }],
  settings: [{ action: `plugin::${pluginId}.settings`, subject: null }],
};
export default permissions;
