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

const { useState } = React;

const HomePage: React.VoidFunctionComponent = () => {
  const [search, setSearch] = useState('');
  const softDeletableCollectionTypes = [
    {
      id: 1,
      label: 'Collection',
      to: `/plugins/${pluginId}/collections`,
      active: true,
    }
  ];
  const softDeletableSingleTypes = [
    {
      id: 1,
      label: 'Single',
      to: `/plugins/${pluginId}/singles`,
      active: false,
    }
  ];
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
              softDeletableCollectionTypes.map(collectionType =>
                <SubNavLink to={collectionType.to} active={collectionType.active} key={collectionType.id}>
                  {collectionType.label}
                </SubNavLink>
              )
            }
          </SubNavSection>
          <SubNavSection label="Single Types" collapsable badgeLabel={softDeletableSingleTypes.length.toString()}>
            {
              softDeletableSingleTypes.map(singleType =>
                <SubNavLink to={singleType.to} active={singleType.active} key={singleType.id}>
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
