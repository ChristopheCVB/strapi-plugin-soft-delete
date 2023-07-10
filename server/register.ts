import { Strapi } from '@strapi/strapi';
import { uidMatcher } from "../utils";

export default ({ strapi }: { strapi: Strapi }) => {
  for (
    let contentTypeRecord of Object.entries(strapi.contentTypes)
    // .concat(Object.entries(strapi.components)) // TODO: Deleting a compoment doesn't use the entityService.delete or entityService.deleteMany
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

      const softDeletedBy = { // FIXME: softDeletedById
        type: "relation",
        relation: "oneToMany",
        target: "admin::user",
        configurable: false,
        writable: false,
        visible: false,
        private: true,
      };
      contentType.attributes.softDeletedBy = softDeletedBy;
      contentType.__schema__.attributes.softDeletedBy = softDeletedBy;

      // FIXME: softDeletedByType
    }
  }
};
