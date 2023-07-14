import { sanitize } from '@strapi/utils'
import { plugin } from "../../utils";

declare var strapi; // global strapi variable

export const getSoftDeletedByAuth = (auth: any) => {
  const id: number | null = auth.credentials?.id || null;
  const strategy: 'admin' | 'users-permissions' | 'api-token' | 'transfer-token' | string = auth.strategy.name;

  return { id, strategy };
};

export const getService = (name: string) => {
  return strapi.plugin(plugin.pluginId).service(name);
};

export const eventHubEmit = async (event: 'entry.delete' | 'entry.update' | 'entry.unpublish', action: 'soft-delete' | 'restore' | 'delete-permanently', uid: string, entity: any) => {
  const modelDef = strapi.getModel(uid);
  const sanitizedEntity = await sanitize.sanitizers.defaultSanitizeOutput(
    modelDef,
    entity
  );
  strapi.eventHub.emit(event, {
    model: modelDef.modelName,
    uid,
    plugin: {
      id: plugin.pluginId,
      action
    },
    entry: sanitizedEntity
  });
};
