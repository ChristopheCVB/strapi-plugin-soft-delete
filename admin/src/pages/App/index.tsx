/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { AnErrorOccurred, CheckPagePermissions } from '@strapi/helper-plugin';
import { pluginId } from '../../../../utils/plugin';
import permissions from '../../permissions';
import Explorer from '../Explorer';

const App = () => {
  return (
    <CheckPagePermissions permissions={permissions.main}>
      <Switch>
        <Route path={`/plugins/${pluginId}/:kind?/:uid?`} component={Explorer} exact />
        <Route component={AnErrorOccurred} />
      </Switch>
    </CheckPagePermissions>
  );
};

export default App;
