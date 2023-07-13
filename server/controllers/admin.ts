import { Strapi } from '@strapi/strapi';
import { getService } from '../utils';

export default ({ strapi }: { strapi: Strapi }) => ({
  async findOne(ctx) {
    const service = getService('admin');

    return await service.findOne(ctx);
  },

  async findMany(ctx) {
    const service = getService('admin');

    return await service.findMany(ctx);
  },

  async delete(ctx) {
    const service = getService('admin');

    return await service.delete(ctx);
  },

  async restore(ctx) {
    const service = getService('admin');

    return await service.restore(ctx);
  },

  async deleteMany(ctx) {
    const service = getService('admin');

    return await service.deleteMany(ctx);
  },

  async restoreMany(ctx) {
    const service = getService('admin');

    return await service.restoreMany(ctx);
  },

  async getSettings(ctx) {
    const service = getService('admin');

    return await service.getSettings(ctx);
  },

  async setSettings(ctx) {
    const service = getService('admin');

    return await service.setSettings(ctx.request.body);
  },
});
