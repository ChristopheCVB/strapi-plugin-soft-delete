import { Strapi } from '@strapi/strapi';
import { plugin } from "../utils";

export default ({ strapi }: { strapi: Strapi }) => {
  for (
    let contentTypeRecord of Object.entries(strapi.contentTypes)
    // .concat(Object.entries(strapi.components)) // TODO: Deleting a compoment doesn't use the entityService.delete nor entityService.deleteMany
  ) {
    const [uid, contentType] = contentTypeRecord as [uid: string, type: any];
    if (plugin.supportsContentType(uid)) {
      const _softDeletedAt = {
        type: "datetime",
        configurable: false,
        writable: false,
        visible: false,
        private: true,
      };
      contentType.attributes._softDeletedAt = _softDeletedAt;
      contentType.__schema__.attributes._softDeletedAt = _softDeletedAt;

      const _softDeletedById = {
        type: "integer",
        configurable: false,
        writable: false,
        visible: false,
        private: true,
      };
      contentType.attributes._softDeletedById = _softDeletedById;
      contentType.__schema__.attributes._softDeletedById = _softDeletedById;

      const _softDeletedByType = {
        type: "string",
        configurable: false,
        writable: false,
        visible: false,
        private: true,
      };
      contentType.attributes._softDeletedByType = _softDeletedByType;
      contentType.__schema__.attributes._softDeletedByType = _softDeletedByType;
    }
  }
};
