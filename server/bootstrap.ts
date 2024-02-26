import { Strapi } from '@strapi/strapi';
import { plugin } from "../utils";
import { getSoftDeletedByAuth, eventHubEmit } from "./utils";
import { supportsContentType } from '../utils/plugin';

const sdWrapParams = async (defaultService: any, opts: any, ctx: { uid: string, action: string }) => {
  const { uid, action } = ctx;
  const wrappedParams = await defaultService.wrapParams(opts, ctx);
  if (!plugin.supportsContentType(uid)) {
    return wrappedParams;
  }

  // Prevent users to set values for _softDeletedAt, _softDeletedById, and _softDeletedByType
  if (wrappedParams.data) {
    delete wrappedParams.data._softDeletedAt;
    delete wrappedParams.data._softDeletedById;
    delete wrappedParams.data._softDeletedByType;
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
          },
        },
      ],
    },
  };
}

export default async ({ strapi }: { strapi: Strapi & { admin: any } }) => {
  // Setup Plugin Settings
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'plugin',
    name: plugin.pluginId,
  });
  const pluginStoreSettings = await pluginStore.get({ key: 'settings' });
  if (!pluginStoreSettings || !pluginStoreSettings.singleTypesRestorationBehavior || !pluginStoreSettings.draftPublishRestorationBehavior) {
    const defaultSettings = {
      singleTypesRestorationBehavior: pluginStoreSettings?.singleTypesRestorationBehavior || 'soft-delete',
      draftPublishRestorationBehavior: pluginStoreSettings?.draftPublishRestorationBehavior || 'unchanged',
    };
    await pluginStore.set({ key: 'settings', value: defaultSettings });
  }

  // Setup Permissions
  strapi.admin.services.permission.actionProvider.get('plugin::content-manager.explorer.delete').displayName = 'Soft Delete';

  const contentTypeUids = Object.keys(strapi.contentTypes).filter(plugin.supportsContentType);
  strapi.admin.services.permission.actionProvider.register({
    uid: 'read',
    displayName: 'Read',
    pluginName: plugin.pluginId,
    section: 'plugins',
  });

  strapi.admin.services.permission.actionProvider.register({
    uid: 'settings',
    displayName: 'Settings',
    pluginName: plugin.pluginId,
    section: 'plugins',
  });

  strapi.admin.services.permission.actionProvider.register({
    uid: 'explorer.read',
    options: { applyToProperties: [ 'locales' ] },
    section: 'contentTypes',
    displayName: 'Deleted Read',
    pluginName: plugin.pluginId,
    subjects: contentTypeUids,
  });

  strapi.admin.services.permission.actionProvider.register({
    uid: 'explorer.restore',
    options: { applyToProperties: [ 'locales' ] },
    section: 'contentTypes',
    displayName: 'Deleted Restore',
    pluginName: plugin.pluginId,
    subjects: contentTypeUids,
  });

  strapi.admin.services.permission.actionProvider.register({
    uid: 'explorer.delete-permanently',
    options: { applyToProperties: [ 'locales' ] },
    section: 'contentTypes',
    displayName: 'Delete Permanently',
    pluginName: plugin.pluginId,
    subjects: contentTypeUids,
  });


  // 'Decorate' Strapi's EventHub to prevent firing 'entry.update' events from soft-delete plugin
  const defaultEventHubEmit = strapi.eventHub.emit;
  strapi.eventHub.emit = async (event: string, ...args) => {
    const data = args[0];
    if (supportsContentType(data.uid) && event === 'entry.update' && data.plugin?.id !== plugin.pluginId) {
      const entry = await strapi.query(data.uid).findOne({
        select: 'id', // Just select the id, we just need to know if it exists
        where: {
          id: data.entry.id,
          _softDeletedAt: null
        }
      });
      if (!entry) {
        return;
      }
    }
    await defaultEventHubEmit(event, ...args);
  };

  // Decorate Entity Services
  strapi.entityService.decorate((defaultService) => ({
    delete: async (uid: string, id: number, opts: any) => {
      if (!plugin.supportsContentType(uid)) {
        return await defaultService.delete(uid, id, opts);
      }

      const wrappedParams = await defaultService.wrapParams(opts, { uid, action: 'delete' });

      const ctx = strapi.requestContext.get();
      const { id: authId, strategy: authStrategy } = getSoftDeletedByAuth(ctx.state.auth);

      const entity = await defaultService.update(uid, id, {
        ...wrappedParams,
        data: {
          ...wrappedParams.data,
          _softDeletedAt: Date.now(),
          _softDeletedById: authId,
          _softDeletedByType: authStrategy,
        },
      });

      eventHubEmit({
        uid,
        event: 'entry.delete', // FIXME: Should this be entry.update?
        action: 'soft-delete',
        entity: entity,
      });

      return entity;
    },

    deleteMany: async (uid: string, opts: any) => {
      if (!plugin.supportsContentType(uid)) {
        return await defaultService.deleteMany(uid, opts);
      }

      const wrappedParams = await defaultService.wrapParams(opts, { uid, action: 'deleteMany' });

      const ctx = strapi.requestContext.get();
      const { id: authId, strategy: authStrategy } = getSoftDeletedByAuth(ctx.state.auth);

      // TODO: Optimize decoratedService.deleteMany to use a single query?
      const entitiesToDelete: any[] = await defaultService.findMany(uid, wrappedParams);
      const deletedEntities: any[] = [];
      for (let entityToDelete of entitiesToDelete) {
        const deletedEntity = await defaultService.update(uid, entityToDelete.id, {
          data: {
            _softDeletedAt: Date.now(),
            _softDeletedById: authId,
            _softDeletedByType: authStrategy,
          },
        });
        if (deletedEntity) {
          deletedEntities.push(deletedEntity);
        }
        eventHubEmit({
          uid,
          event: 'entry.delete', // FIXME: Should this be entry.update?
          action: 'soft-delete',
          entity: deletedEntity,
        });
      }

      return deletedEntities;
    },

    findOne: async (uid: string, id: number, opts: any) => {
      if (!plugin.supportsContentType(uid)) {
        return await defaultService.findOne(uid, id, opts);
      }

      // Because of other plugins, like i18n, we need to use the findMany method to ignore upstream filters
      const entities = await strapi.query(uid).findMany({
        where: {
          id,
          _softDeletedAt: {
            $null: true,
          },
        },
      });

      if (entities.length === 0) {
        return null;
      }
      // And then use the defaultService findOne method to apply the upstream filters and not break the decorate pattern chain
      return defaultService.findOne(uid, id, opts);
    },

    wrapParams: async (opts: any, ctx: { uid: string, action: string }) => {
      return await sdWrapParams(defaultService, opts, ctx);
    },
  }));
};
