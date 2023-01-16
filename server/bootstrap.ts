import { uidMatcher } from "../utils/utils";

export default ({ strapi }: { strapi: any }) => {
  return strapi.entityService.decorate((defaultService) => ({
    delete: async (uid: string, id: number, params: any) => {
      if (uidMatcher(uid)) {
        console.log('delete', {uid, id, params});

        return await defaultService.update(uid, id, {
          data: {
            softDeleted: true,
          },
        });
      } else {
        return await defaultService.delete(uid, id, params);
      }
    },
    update: async (uid: string, id: number, params: any) => {
      if (uidMatcher(uid)) {
        console.log('update', {uid, id, params});
      }

      return await defaultService.update(uid, id, params)
    },
    create: async (uid: string, params: any) => {
      if (uidMatcher(uid)) {
        console.log('create', {uid, params});
      }

      return await defaultService.create(uid, params)
    },
    findMany: async (uid: string, params: any) => {
      if (uidMatcher(uid)) {
        console.log('findMany', {uid, params});

        return await defaultService.findMany(uid, {
          ...params,
          filters: {
            ...params.filters,
            softDeleted: false,
          },
        });
      } else {
        return await defaultService.findMany(uid, params);
      }
    },
    findOne: async (uid: string, id: number, params: any) => {
      if (uidMatcher(uid)) {
        console.log('findOne', {uid, id, params});

        const entity = await defaultService.findOne(uid, id, params); // TODO: Check if we can filter with findOne
        if (entity?.softDeleted) {
          return null;
        }
        return entity;
      } else {
        return await defaultService.findOne(uid, id, params);
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
