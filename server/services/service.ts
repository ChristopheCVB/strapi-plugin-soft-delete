import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  findMany(ctx) {
    return strapi.query(ctx.params.uid).findMany(ctx)
  },

  // TODO: findOne, delete, deleteMany, update, updateMany
});
