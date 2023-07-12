import adminContentTypes from './adminContentTypes';
import adminSettings from './adminSettings';

export default {
  admin: {
    type: 'admin',
    routes: [...adminContentTypes, ...adminSettings],
  },
};
