import { apiComponentMatcher } from "../utils/utils";

export default async ({ strapi }: { strapi: any }) => {
  return strapi.entityService.decorate((defaultService) => ({
    delete: async (type, id, ctx) => {
      if (apiComponentMatcher(type)) {
        return await defaultService.update(type, id, {
          data: {
            softDeleted: true,
          },
        });
      } else {
        return await defaultService.delete(type, id, ctx);
      }
    },
    findMany: async (type, ctx) => {
      if (apiComponentMatcher(type)) {
        console.log("I am getting triggered");
        return await defaultService.findMany(type, {
          ...ctx,
          filters: {
            ...ctx.filters,
            softDeleted: false,
          },
        });
      } else {
        return await defaultService.findMany(type, ctx);
      }
    },
    // findOne: async (type, id, ctx) => {
    //   console.log("h");
    //   if (apiComponentMatcher(type)) {
    //     return await defaultService.findOne(type, id, {
    //       ...ctx,
    //       filters: {
    //         ...ctx.filters,
    //         softDeleted: false,
    //       },
    //     });
    //   } else {
    //     return await defaultService.findOne(type, id, ctx);
    //   }
    // },
  }));
};
