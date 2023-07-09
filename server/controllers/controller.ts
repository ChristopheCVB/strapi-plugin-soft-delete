import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  findOne(ctx) {
    const service = strapi.plugin('soft-delete').service('service');

    return service.findOne(ctx);
  },

  findMany(ctx) {
    const service = strapi.plugin('soft-delete').service('service');

    return service.findMany(ctx);
  },

  delete(ctx) {
    const service = strapi.plugin('soft-delete').service('service');

    return service.delete(ctx);
  },

  restore(ctx) {
    const service = strapi.plugin('soft-delete').service('service');

    return service.restore(ctx);
  },

  deleteMany(ctx) {
    const service = strapi.plugin('soft-delete').service('service');

    return service.deleteMany(ctx);
  },

  restoreMany(ctx) {
    const service = strapi.plugin('soft-delete').service('service');

    return service.restoreMany(ctx);
  },
});
