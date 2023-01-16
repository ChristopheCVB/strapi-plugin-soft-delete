import { uidMatcher } from "../utils/utils";

export default ({ strapi }: { strapi: any }) => {
  return strapi.entityService.decorate((defaultService) => ({
    delete: async (uid: string, id: number, ctx: any) => {
      if (uidMatcher(uid)) {
        console.log('delete', {uid, id, ctx});

        return await defaultService.update(uid, id, {
          data: {
            softDeleted: true,
          },
        });
      } else {
        return await defaultService.delete(uid, id, ctx);
      }
    },
    update: async (uid: string, id: number, ctx: any) => {
      if (uidMatcher(uid)) {
        console.log('update', {uid, id, ctx});
      }

      return await defaultService.update(uid, id, ctx)
    },
    create: async (uid: string, ctx: any) => {
      if (uidMatcher(uid)) {
        console.log('create', {uid, ctx});
      }

      return await defaultService.create(uid, ctx)
    },
    findMany: async (uid: string, ctx: any) => {
      if (uidMatcher(uid)) {
        console.log('findMany', {uid, ctx});

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
    findOne: async (uid: string, id: number, ctx: any) => {
      if (uidMatcher(uid)) {
        console.log('findOne', {uid, id, ctx});

        const entity = await defaultService.findOne(uid, id, ctx);
        if (entity?.softDeleted) {
          return null;
        }
        return entity;
      } else {
        return await defaultService.findOne(uid, id, ctx);
      }
    },
    wrapParams: (params: any, { uid, action }: { uid: string, action: string }) => {
      if (uidMatcher(uid)) {
        console.log('wrapParams', {params, uid, action});

        return {
          ...params,
          filters: {
            ...params.filters,
            softDeleted: false,
          },
        };
      } else {
        return params;
      }
    },
  }));
};
