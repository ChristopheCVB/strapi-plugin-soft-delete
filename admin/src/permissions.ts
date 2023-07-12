import { pluginId } from "../../utils/plugin";

const permissions = {
  main: [{ action: `plugin::${pluginId}.read`, subject: null }],
  settings: [{ action: 'admin::project-settings.update', subject: null }], // FIXME: IDK if this is correct or if I should create a new permission
};
export default permissions;
