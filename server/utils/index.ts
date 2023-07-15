import { sanitize } from '@strapi/utils'
import { plugin } from "../../utils";

declare const strapi; // global strapi

export const getSoftDeletedByAuth = (auth: any) => {
  const id: number | null = auth.credentials?.id || null;
  const strategy: 'admin' | 'users-permissions' | 'api-token' | 'transfer-token' | string = auth.strategy.name;

  return { id, strategy };
};

export const getService = (name: string) => {
  return strapi.plugin(plugin.pluginId).service(name);
};

declare type CustomEventHubEmit = {
  uid: string;
  entity: any;
} & ({
  event: 'entry.delete';
  action: 'soft-delete' | 'delete-permanently';
} | {
  event: 'entry.update';
  action: 'restore';
} | {
  event: 'entry.unpublish';
  action: 'restore';
});

export const eventHubEmit = async (params: CustomEventHubEmit) => {
  const modelDef = strapi.getModel(params.uid);
  const sanitizedEntity = await sanitize.sanitizers.defaultSanitizeOutput(
    modelDef,
    params.entity
  );
  strapi.eventHub.emit(params.event, {
    model: modelDef.modelName,
    uid: params.uid,
    plugin: {
      id: plugin.pluginId,
      action: params.action
    },
    entry: sanitizedEntity
  });
};
