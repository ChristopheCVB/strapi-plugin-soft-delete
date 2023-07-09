import { uidMatcher } from "../utils";

export default ({ strapi }: { strapi: any }) => {
  for (
    let object of []
    .concat(Object.entries(strapi.contentTypes))
    // .concat(Object.entries(strapi.components)) // FIXME: Deleting a compoment doesn't use the entityService
  ) {
    const [uid, type] = object as [uid: string, type: any];
    if (uidMatcher(uid)) {
      console.log({uid, type});
      const softDeletedAt = {
        type: "datetime",
        configurable: false,
        writable: false,
        visible: false,
        private: true,
      };
      type.attributes.softDeletedAt = softDeletedAt;
      type.__schema__.attributes.softDeletedAt = softDeletedAt;
      const softDeletedBy = {
        type: "relation",
        relation: "oneToMany",
        target: "admin::user",
        configurable: false,
        writable: false,
        visible: false,
        private: true,
      };
      type.attributes.softDeletedBy = softDeletedBy;
      type.__schema__.attributes.softDeletedBy = softDeletedBy;
    }
  }
};
