import { Strapi } from '@strapi/strapi';
import { uidMatcher } from "../utils";

export default ({ strapi }: { strapi: Strapi }) => {
  for (
    let contentTypeRecord of Object.entries(strapi.contentTypes)
    // .concat(Object.entries(strapi.components)) // TODO: Deleting a compoment doesn't use the entityService.delete nor entityService.deleteMany
  ) {
    const [uid, contentType] = contentTypeRecord as [uid: string, type: any];
    if (uidMatcher(uid)) {
      const softDeletedAt = {
        type: "datetime",
        configurable: false,
        writable: false,
        visible: false,
        private: true,
      };
      contentType.attributes.softDeletedAt = softDeletedAt;
      contentType.__schema__.attributes.softDeletedAt = softDeletedAt;

      const softDeletedById = {
        type: "integer",
        configurable: false,
        writable: false,
        visible: false,
        private: true,
      };
      contentType.attributes.softDeletedById = softDeletedById;
      contentType.__schema__.attributes.softDeletedById = softDeletedById;

      const softDeletedByType = {
        type: "string",
        configurable: false,
        writable: false,
        visible: false,
        private: true,
      };
      contentType.attributes.softDeletedByType = softDeletedByType;
      contentType.__schema__.attributes.softDeletedByType = softDeletedByType;
    }
  }
};
