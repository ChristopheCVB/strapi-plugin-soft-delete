export const apiComponentMatcher = (serviceName: string) => {
  return serviceName.match(/^api::/) || !serviceName.match(/^\w+::/);
};
