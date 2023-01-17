import { uidMatcher } from "../utils";

const sdWrapParams = async (defaultService: any, opts: any, ctx: { uid: string, action: string }) => {
  const { uid, action } = ctx
  const wrappedParams = await defaultService.wrapParams(opts, ctx)
  if (!uidMatcher(uid)) {
    return wrappedParams;
  }
  console.log('wrapParams', {wrappedParams, ctx});

  return {
    ...wrappedParams,
    filters: {
      $and: [
        {
          ...wrappedParams.filters
        },
        {
          softDeletedAt: {
            $null: true
          }
        }
      ]
    },
  };
}

export default ({ strapi }: { strapi: any }) => {
  return strapi.entityService.decorate((defaultService) => ({
    delete: async (uid: string, id: number, opts: any) => {
      if (!uidMatcher(uid)) {
        return await defaultService.delete(uid, id, opts);
      }
      console.log('delete', {uid, id, opts});

      const wrappedParams = await defaultService.wrapParams(opts, { uid, action: 'delete' })

      return await defaultService.update(uid, id, {
        ...wrappedParams,
        data: {
          ...wrappedParams.data,
          softDeletedAt: new Date().getTime(),
        },
      });
    },
    deleteMany: async (uid: string, opts: any) => {
      if (!uidMatcher(uid)) {
        return await defaultService.deleteMany(uid, opts);
      }
      console.log('deleteMany', {uid, opts});

      const wrappedParams = await defaultService.wrapParams(opts, { uid, action: 'deleteMany' })

      const entitiesToDelete = await defaultService.findMany(uid, wrappedParams)
      const deletedEntities = []
      for (let entityToDelete of entitiesToDelete) {
        const deletedEntity = await defaultService.update(uid, entityToDelete.id, {
          data: {
            softDeletedAt: new Date().getTime(),
          },
        })
        if (deletedEntity) {
          deletedEntities.push(deletedEntity)
        }
      }

      return deletedEntities
    },
    findOne: async (uid: string, id: number, opts: any) => {
      if (!uidMatcher(uid)) {
        return await defaultService.findOne(uid, id, opts);
      }
      console.log('findOne', {uid, id, opts});

      const wrappedParams = await defaultService.wrapParams(opts, { uid, action: 'findOne' })

      const entities = await defaultService.findMany(uid, {
        ...wrappedParams,
        filters: {
          id,
          softDeletedAt: {
            $null: true
          }
        }
      });

      if (entities.length === 0) {
        return null;
      }
      return entities[0];
    },
    wrapParams: async (opts: any, ctx: { uid: string, action: string }) => {
      return await sdWrapParams(defaultService, opts, ctx)
    },
  }));
};
