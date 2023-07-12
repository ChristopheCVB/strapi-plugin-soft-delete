/**
 *
 * RestorationBehavior
 *
 */

import React, { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import {
  Box,
  Layout,
  BaseHeaderLayout,
  ContentLayout,
  Button,
  Typography,
} from '@strapi/design-system';
import { Check } from '@strapi/icons';

import { pluginId } from '../../../../../utils/plugin';
import getTrad from '../../../utils/getTrad';

const RestorationBehavior: React.FunctionComponent = () => {
  // FIXME: Create RestorationBehavior Component

  const { formatMessage } = useIntl();

  return (
    <Box background="neutral100">
      <Layout>
        <BaseHeaderLayout
          title={formatMessage({id: getTrad('setting.restorationBehavior'), defaultMessage: 'Restoration Behavior'})}
          as="h1"
          primaryAction={
            <Button startIcon={<Check />} disabled={true}>
              {formatMessage({id: getTrad('save'), defaultMessage: 'Save'})}
            </Button>
          }
        />
        <ContentLayout>
          <Typography>
            Restoration Behavior Content
          </Typography>
        </ContentLayout>
      </Layout>
    </Box>
  );
};

export default RestorationBehavior;
