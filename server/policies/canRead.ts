export default (policyContext, config, { strapi }) => {
  const { userAbility } = policyContext.state
  return userAbility.can('plugin::soft-delete.read')
};
