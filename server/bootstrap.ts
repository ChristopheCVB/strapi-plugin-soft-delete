import { uidMatcher } from "../utils/utils";

export default ({ strapi }: { strapi: any }) => {
  return strapi.entityService.decorate((defaultService) => ({
    delete: async (uid, id, ctx) => {
      // console.log('delete', {uid, id, ctx});

      if (uidMatcher(uid)) {
        return await defaultService.update(uid, id, {
          data: {
            softDeleted: true,
          },
        });
      } else {
        return await defaultService.delete(uid, id, ctx);
      }
    },
    findMany: async (uid, ctx) => {
      // console.log('findMany', {uid, ctx});

      if (uidMatcher(uid)) {
        return await defaultService.findMany(uid, {
          ...ctx,
          filters: {
            ...ctx.filters,
            softDeleted: false,
          },
        });
      } else {
        return await defaultService.findMany(uid, ctx);
      }
    },
    findOne: async (uid, id, ctx) => {
      // console.log('findOne', {uid, id, ctx});

      if (uidMatcher(uid)) {
        const entity = await defaultService.findOne(uid, id, ctx);
        if (entity?.softDeleted) {
          return null;
        }
        return entity;
      } else {
        return await defaultService.findOne(uid, id, ctx);
      }
    },
    wrapParams: (ctx, { uid, action }) => {
      // console.log('wrapParams', {ctx, uid, action});

      if (uidMatcher(uid)) {
        return {
          ...ctx,
          filters: {
            ...ctx.filters,
            softDeleted: false,
          },
        };
      } else {
        return ctx;
      }
    },
  }));
};
