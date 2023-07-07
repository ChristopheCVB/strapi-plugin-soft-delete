import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  findMany(ctx) {
    const service = strapi.plugin('soft-delete').service('service');

    return service.findMany(ctx);
  },
});
