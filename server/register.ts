import { uidMatcher } from "../utils/utils";

export default ({ strapi }: { strapi: any }) => {
  for (
    let object of []
    .concat(Object.entries(strapi.contentTypes))
    // .concat(Object.entries(strapi.components)) // FIXME: Deleting a compoment doesn't use the entityService
  ) {
    const [uid, type] = object as [uid: string, type: any];
    if (uidMatcher(uid)) {
      console.log({uid, type});
      type.attributes.softDeleted = {
        type: "boolean",
        default: false,
        // configurable: false,
        // writable: false,
        // visible: false,
        // useJoinTable: false,
        private: true,
      };
      type.__schema__.attributes.softDeleted = {
        type: "boolean",
        default: false,
        // configurable: false,
        // writable: false,
        // visible: false,
        // useJoinTable: false,
        private: true,
      };
    }
  }
};
