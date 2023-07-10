/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { NotFound } from '@strapi/helper-plugin';
import { pluginId } from '../../../../utils/plugin';
import HomePage from '../HomePage';

const App: React.VoidFunctionComponent = () => {
  return (
    <div>
      <Switch>
        <Route path={`/plugins/${pluginId}/:kind?/:uid?`} component={HomePage} exact />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
};

export default App;
