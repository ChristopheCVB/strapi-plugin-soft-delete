import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  async findOne(ctx) {
    const service = strapi.plugin('soft-delete').service('service');

    return await service.findOne(ctx);
  },

  async findMany(ctx) {
    const service = strapi.plugin('soft-delete').service('service');

    return await service.findMany(ctx);
  },

  async delete(ctx) {
    const service = strapi.plugin('soft-delete').service('service');

    return await service.delete(ctx);
  },

  async restore(ctx) {
    const service = strapi.plugin('soft-delete').service('service');

    return await service.restore(ctx);
  },

  async deleteMany(ctx) {
    const service = strapi.plugin('soft-delete').service('service');

    return await service.deleteMany(ctx);
  },

  async restoreMany(ctx) {
    const service = strapi.plugin('soft-delete').service('service');

    return await service.restoreMany(ctx);
  },
});
