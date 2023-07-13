import { plugin } from "../../utils";

export const getSoftDeletedByAuth = (auth: any) => {
  const id: number | null = auth.credentials?.id || null
  const strategy: 'admin' | 'users-permissions' | 'api-token' | 'transfer-token' | string = auth.strategy.name

  return { id, strategy }
};

export const getService = (name: string) => {
  return strapi.plugin(plugin.pluginId).service(name);
};
