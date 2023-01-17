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
      type.attributes.softDeletedAt = {
        type: "datetime",
        default: null,
        // configurable: false,
        // writable: false,
        // visible: false,
        // useJoinTable: false,
        private: true,
      };
      type.__schema__.attributes.softDeletedAt = {
        type: "datetime",
        default: null,
        // configurable: false,
        // writable: false,
        // visible: false,
        // useJoinTable: false,
        private: true,
      };
    }
  }
};
