export const uidMatcher = (uid: string) => {
  // Content Type (Collection or Single) || Component
  return uid.match(/^api::/)// || !uid.match(/^\w+::/); // FIXME: Deleting a compoment doesn't use the entityService
};
