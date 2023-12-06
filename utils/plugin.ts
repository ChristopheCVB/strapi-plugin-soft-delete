import pluginPkg from '../package.json';

export const name = pluginPkg.strapi.name;
export const pluginId = pluginPkg.name.replace(/^(@[^-,.][\w,-]+\/|strapi-)plugin-/i, '');

export const supportsContentType = (uid?: string) => {
  return uid?.match(/^api::/) || false;// || !uid?.match(/^\w+::/) || false; // TODO: Deleting a component doesn't use the entityService
};
