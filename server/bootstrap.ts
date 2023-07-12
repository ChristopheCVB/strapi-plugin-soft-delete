import { Strapi } from '@strapi/strapi';
import { uidMatcher } from "../utils";
import { pluginId } from "../utils/plugin";
import { getSoftDeletedBy } from "./utils";

const sdWrapParams = async (defaultService: any, opts: any, ctx: { uid: string, action: string }) => {
  const { uid, action } = ctx
  const wrappedParams = await defaultService.wrapParams(opts, ctx)
  if (!uidMatcher(uid)) {
    return wrappedParams;
  }

  return {
    ...wrappedParams,
    filters: {
      $and: [
        {
          ...wrappedParams.filters
        },
        {
          _softDeletedAt: {
            $null: true
          }
        }
      ]
    },
  };
}

export default async ({ strapi }: { strapi: Strapi & { admin: any } }) => {
  // Setup Plugin Settings
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'plugin',
    name: pluginId,
  });
  const pluginStoreSettings = await pluginStore.get({ key: 'settings' });
  if (!pluginStoreSettings) {
    const defaultSettings = {
      singleTypesResorationBehavior: 'soft-delete'
    };
    await pluginStore.set({ key: 'settings', value: defaultSettings });
  }

  // Setup Permissions
  strapi.admin.services.permission.actionProvider.get('plugin::content-manager.explorer.delete').displayName = 'Soft Delete';

  const contentTypeUids = Object.keys(strapi.contentTypes).filter(uidMatcher);
  strapi.admin.services.permission.actionProvider.register({
    uid: 'read',
    displayName: 'Read',
    pluginName: pluginId,
    section: 'plugins',
  });

  strapi.admin.services.permission.actionProvider.register({
    uid: 'settings',
    displayName: 'Settings',
    pluginName: pluginId,
    section: 'plugins',
  });

  strapi.admin.services.permission.actionProvider.register({
    uid: 'explorer.read',
    options: { applyToProperties: [ 'locales' ] },
    section: 'contentTypes',
    displayName: 'Deleted Read',
    pluginName: pluginId,
    subjects: contentTypeUids,
  });

  strapi.admin.services.permission.actionProvider.register({
    uid: 'explorer.restore',
    options: { applyToProperties: [ 'locales' ] },
    section: 'contentTypes',
    displayName: 'Deleted Restore',
    pluginName: pluginId,
    subjects: contentTypeUids,
  });

  strapi.admin.services.permission.actionProvider.register({
    uid: 'explorer.delete-permanently',
    options: { applyToProperties: [ 'locales' ] },
    section: 'contentTypes',
    displayName: 'Delete Permanently',
    pluginName: pluginId,
    subjects: contentTypeUids,
  });

  // Decorate Entity Services
  strapi.entityService.decorate((defaultService) => ({
    delete: async (uid: string, id: number, opts: any) => {
      if (!uidMatcher(uid)) {
        return await defaultService.delete(uid, id, opts);
      }

      const wrappedParams = await defaultService.wrapParams(opts, { uid, action: 'delete' })

      const ctx = strapi.requestContext.get()
      const { authId, authStrategy } = getSoftDeletedBy(ctx)

      return await defaultService.update(uid, id, {
        ...wrappedParams,
        data: {
          ...wrappedParams.data,
          _softDeletedAt: Date.now(),
          _softDeletedById: authId,
          _softDeletedByType: authStrategy,
        },
      });
    },

    deleteMany: async (uid: string, opts: any) => {
      if (!uidMatcher(uid)) {
        return await defaultService.deleteMany(uid, opts);
      }

      const wrappedParams = await defaultService.wrapParams(opts, { uid, action: 'deleteMany' })

      const ctx = strapi.requestContext.get()
      const { authId, authStrategy } = getSoftDeletedBy(ctx)

      const entitiesToDelete = await defaultService.findMany(uid, wrappedParams)
      const deletedEntities: any[] = []
      for (let entityToDelete of entitiesToDelete) {
        const deletedEntity = await defaultService.update(uid, entityToDelete.id, {
          data: {
            _softDeletedAt: Date.now(),
            _softDeletedById: authId,
            _softDeletedByType: authStrategy,
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

      const wrappedParams = await defaultService.wrapParams(opts, { uid, action: 'findOne' })

      const entities = await defaultService.findMany(uid, {
        ...wrappedParams,
        filters: {
          id,
          _softDeletedAt: {
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
