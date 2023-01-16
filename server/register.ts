import { uidMatcher } from "../utils/utils";

export default async ({ strapi }: { strapi: any }) => {
  for (let object of []
    .concat(Object.entries(strapi.contentTypes))
    .concat(Object.entries(strapi.components))) {
    const [uid, type] = object as [uid: string, type: any];
    if (uidMatcher(uid)) {
      // console.log({uid, type});
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
