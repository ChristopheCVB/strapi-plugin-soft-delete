/*
 *
 * HomePage
 *
 */

import React from 'react';
import pluginId from '../../pluginId';
import {
  Box,
  BaseHeaderLayout,
  Layout,
  SubNav,
  SubNavHeader,
  SubNavSection,
  SubNavSections,
  SubNavLink,
  ContentLayout,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  BaseCheckbox,
  Typography,
  VisuallyHidden,
  Flex,
  IconButton,
  Link,
} from '@strapi/design-system';
import { Trash, Refresh, ArrowLeft } from '@strapi/icons';

const { useState, useEffect } = React;
import { useLocation } from 'react-router-dom'
import { useFetchClient } from '@strapi/helper-plugin';
import { uidMatcher } from '../../../../utils';

declare type ContentType = {
  uid: string,
  kind: 'collectionType' | 'singleType',
  active: boolean,
  label: string,
  to: string
}

const HomePage: React.VoidFunctionComponent = () => {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const { get } = useFetchClient();

  const [softDeletableCollectionTypes, setSoftDeletableCollectionTypes] = useState<ContentType[]>([]);
  const [softDeletableSingleTypes, setSoftDeletableSingleTypes] = useState<ContentType[]>([]);
  const [activeContentType, setActiveContentType] = useState<ContentType | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  useEffect(() => {
    get('/content-manager/init').then(response => {
      const collectionTypes = (response.data.data.contentTypes as any[]).filter(contentType => contentType.isDisplayed && contentType.kind === 'collectionType' && uidMatcher(contentType.uid))
        .map((contentType, index) => ({
          uid: contentType.uid,
          kind: contentType.kind,
          active: false,
          label: contentType.info.displayName,
          to: `/plugins/${pluginId}/collectionType/${contentType.uid}`,
        }))
      setSoftDeletableCollectionTypes(collectionTypes);

      const singleTypes = (response.data.data.contentTypes as any[]).filter(contentType => contentType.isDisplayed && contentType.kind === 'singleType' && uidMatcher(contentType.uid))
        .map(contentType => ({
          uid: contentType.uid,
          kind: contentType.kind,
          active: false,
          label: contentType.info.displayName,
          to: `/plugins/${pluginId}/singleType/${contentType.uid}`,
        }))
      setSoftDeletableSingleTypes(singleTypes);
    });
  }, [])

  useEffect(() => {
    const collectionTypes = softDeletableCollectionTypes.map(contentType => {
      return {
        ...contentType,
        active: (location.pathname as string).match(/collectionType/) !== null && location.pathname.indexOf(contentType.kind + '/' + contentType.uid) > -1
      }
    })
    setSoftDeletableCollectionTypes(collectionTypes)
    const singleTypes = softDeletableSingleTypes.map(contentType => {
      return {
        ...contentType,
        active: (location.pathname as string).match(/singleType/) !== null && location.pathname.indexOf(contentType.kind + '/' + contentType.uid) > -1
      }
    })
    setSoftDeletableSingleTypes(singleTypes)
    const activeType = collectionTypes.concat(singleTypes).filter(type => type.active)[0]
    setActiveContentType(activeType);
    if (!activeType) return;
    get(`/${pluginId}/${activeType.kind}/${activeType.uid}`, {
      params: {
        filters: {
          $and: [
            {
              softDeletedAt: {
                $notNull: true
              }
            }
          ]
        }
      }
    }).then(response => {
      setEntries(response.data);
    });
  }, [location.pathname])

  return (
    <Box background="neutral100">
      <Layout sideNav={<SubNav ariaLabel="Soft Delete sub nav">
        <SubNavHeader searchable value={search} onClear={() => setSearch('')} onChange={e => setSearch(e.target.value)} label="Soft Delete" searchLabel="Search..." />
            <SubNavSections>
              <SubNavSection label="Collection Type" collapsable badgeLabel={softDeletableCollectionTypes.length.toString()}>
                {
                  softDeletableCollectionTypes.map((contentType, index) => <SubNavLink to={contentType.to} active={contentType.active} key={index}>
                    {contentType.label}
                  </SubNavLink>)
                }
              </SubNavSection>
              <SubNavSection label="Single Type" collapsable badgeLabel={softDeletableSingleTypes.length.toString()}>
                {
                  softDeletableSingleTypes.map((contentType, index) => <SubNavLink to={contentType.to} active={contentType.active} key={index}>
                    {contentType.label}
                  </SubNavLink>)
                }
              </SubNavSection>
            </SubNavSections>
          </SubNav>}>
        <>
          {activeContentType && <BaseHeaderLayout navigationAction={
            <Link startIcon={<ArrowLeft />} to={`/plugins/${pluginId}`}>
              Go back
            </Link>
          } title={softDeletableCollectionTypes.concat(softDeletableSingleTypes).filter(type => type.active)[0]?.label || ''} subtitle={entries.length + " entries found"} as="h2" />}
          {activeContentType && <ContentLayout>
            <Table colCount={4} rowCount={entries.length + 1}>
              <Thead>
                <Tr>
                  <Th>
                    <BaseCheckbox aria-label="Select all entries" />
                  </Th>
                  <Th>
                    <Typography variant="sigma">ID</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">Name</Typography>
                  </Th>
                  <Th>
                    <VisuallyHidden>Actions</VisuallyHidden>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {
                  entries.map(entry => <Tr key={entry.id}>
                    <Td>
                      <BaseCheckbox aria-label={`Select ${entry.name}`} />
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">{entry.id}</Typography>
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">{entry.name}</Typography>
                    </Td>
                    <Td>
                      <Flex>
                        <IconButton onClick={() => console.log('restore')} label="Restore" icon={<Refresh />} />
                        <Box paddingLeft={1}>
                          <IconButton onClick={() => console.log('rawDelete')} label="Delete forever" icon={<Trash />} />
                        </Box>
                      </Flex>
                    </Td>
                  </Tr>)
                }
              </Tbody>
            </Table>
          </ContentLayout>}
        </>
      </Layout>
    </Box>
  );
};

export default HomePage;
