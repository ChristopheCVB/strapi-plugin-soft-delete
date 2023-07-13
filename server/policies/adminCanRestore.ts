import { plugin } from "../../utils";

export default (policyContext, config, { strapi }) => {
  const { userAbility } = policyContext.state
  return userAbility.can(`plugin::${plugin.pluginId}.explorer.restore`, policyContext.params.uid)
};
