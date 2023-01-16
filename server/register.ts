import { apiComponentMatcher } from "../utils/utils";
export default async ({ strapi }: { strapi: any }) => {
  for (let object of []
    .concat(Object.entries(strapi.contentTypes))
    .concat(Object.entries(strapi.components))) {
    const [type, contentType] = object as any;
    if (apiComponentMatcher(type)) {
      // console.log(key);
      contentType.attributes.softDeleted = {
        type: "boolean",
        default: false,
        private: true,
        // visible: false,
      };
      contentType.__schema__.attributes.softDeleted = {
        type: "boolean",
        default: false,
        private: true,
        // visible: false,
      };
    }
  }
};
