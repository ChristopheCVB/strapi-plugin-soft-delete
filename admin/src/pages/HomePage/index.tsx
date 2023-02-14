/*
 *
 * HomePage
 *
 */

import React from 'react';
import { useState } from 'react'
import pluginId from '../../pluginId';
import {
  Flex,
  Box,
  SubNav,
  SubNavHeader,
  SubNavSection,
  SubNavSections,
  SubNavLink,
  SubNavLinkSection,
} from '@strapi/design-system';
import { ExclamationMarkCircle, Apps } from '@strapi/icons'


const HomePage: React.VoidFunctionComponent = () => {
  const [search, setSearch] = useState('');
  const links = [{
    id: 1,
    label: 'Addresses',
    icon: <ExclamationMarkCircle />,
    to: '/address'
  }, {
    id: 2,
    label: 'Categories',
    to: '/category'
  }, {
    id: 3,
    label: 'Cities',
    icon: <Apps />,
    to: '/city',
    active: true
  }, {
    id: 4,
    label: 'Countries',
    to: '/country'
  }];
  return (
  <Flex>
    <Box style={{
    height: '100vh'
    }}>
      <SubNav ariaLabel="Soft Delete sub nav">
        <SubNavHeader searchable value={search} onClear={() => setSearch('')} onChange={e => setSearch(e.target.value)} label="Soft Delete" searchLabel="Search..." />
        <SubNavSections>
          <SubNavSection label="Collection Type" collapsable badgeLabel={links.length.toString()}>
            {
              links.map(link =>
                <SubNavLink to={link.to} active={link.active} key={link.id}>
                  {link.label}
                </SubNavLink>
              )
            }
          </SubNavSection>
          <SubNavSection label="Single Type" collapsable badgeLabel={links.length.toString()}>
            <SubNavLinkSection label="Default">
              {links.map(link => <SubNavLink to={link.to} isSubSectionChild key={link.id}>
              {link.label}
              </SubNavLink>)}
            </SubNavLinkSection>
          </SubNavSection>
        </SubNavSections>
      </SubNav>
    </Box>
  </Flex>
  );
};

export default HomePage;
