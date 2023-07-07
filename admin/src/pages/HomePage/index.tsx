/*
 *
 * HomePage
 *
 */

import React from 'react';
import pluginId from '../../pluginId';
import {
  Flex,
  Box,
  SubNav,
  SubNavHeader,
  SubNavSection,
  SubNavSections,
  SubNavLink,
} from '@strapi/design-system';

const { useState, useEffect } = React;
import { useFetchClient } from '@strapi/helper-plugin';
import { uidMatcher } from '../../../../utils';

const HomePage: React.VoidFunctionComponent = () => {
  const [search, setSearch] = useState('');
  const { get } = useFetchClient();

  const [softDeletableCollectionTypes, setSoftDeletableCollectionTypes] = useState<{label: string, to: string}[]>([]);
  const [softDeletableSingleTypes, setSoftDeletableSingleTypes] = useState<{label: string, to: string}[]>([]);
  useEffect(() => {
    get('/content-type-builder/content-types').then(response => {
      setSoftDeletableCollectionTypes(
        response.data.data.filter(contentType => uidMatcher(contentType.uid) && contentType.schema.kind === 'collectionType')
          .map(contentType => ({
            label: contentType.schema.displayName,
            to: `/plugins/${pluginId}/colectionType/${contentType.uid}`,
          }))
      );
      setSoftDeletableSingleTypes(
        response.data.data.filter(contentType => uidMatcher(contentType.uid) && contentType.schema.kind === 'singleType')
          .map(contentType => ({
            label: contentType.schema.displayName,
            to: `/plugins/${pluginId}/singleType/${contentType.uid}`,
          }))
      );
    });
  }, [])

  return (
  <Flex>
    <Box style={{
    height: '100vh'
    }}>
      <SubNav ariaLabel="Soft Delete sub nav">
        <SubNavHeader searchable value={search} onClear={() => setSearch('')} onChange={e => setSearch(e.target.value)} label="Soft Delete" searchLabel="Search..." />
        <SubNavSections>
          <SubNavSection label="Collection Types" collapsable badgeLabel={softDeletableCollectionTypes.length.toString()}>
            {
              softDeletableCollectionTypes.map((collectionType, index) =>
                <SubNavLink to={collectionType.to} active={index === 0} key={index}>
                  {collectionType.label}
                </SubNavLink>
              )
            }
          </SubNavSection>
          <SubNavSection label="Single Types" collapsable badgeLabel={softDeletableSingleTypes.length.toString()}>
            {
              softDeletableSingleTypes.map((singleType, index) =>
                <SubNavLink to={singleType.to} key={index}>
                  {singleType.label}
                </SubNavLink>
              )
            }
          </SubNavSection>
        </SubNavSections>
      </SubNav>
    </Box>
  </Flex>
  );
};

export default HomePage;
