/*
 *
 * Explorer
 *
 */

import React, { useState, useEffect } from 'react';
import { pluginId } from '../../../../utils/plugin';
import {
  Box,
  Layout,
  SubNav,
  SubNavHeader,
  SubNavSection,
  SubNavSections,
  SubNavLink,
  Loader,
  Flex,
  Typography,
} from '@strapi/design-system';

import { useHistory, useParams } from 'react-router-dom'
import { useFetchClient } from '@strapi/helper-plugin';
import { uidMatcher } from '../../../../utils';
import { useIntl } from 'react-intl';

import { useRBACProvider } from '@strapi/helper-plugin';

import getTrad from '../../utils/getTrad';

import type {
  ContentManagerInitResponse,
  ContentType,
  ContentTypeNavLink,
  Permission,
} from './types';
import ContentTypeEntries from './ContentTypeEntries';

const Explorer: React.FunctionComponent = () => {
  const params: { kind: string, uid: string } = useParams();

  const { formatMessage } = useIntl();
  const history = useHistory();
  const [search, setSearch] = useState(''); // TODO: Implement Content Type search
  const { get } = useFetchClient();
  const { allPermissions }: { allPermissions: Permission[] } = useRBACProvider();

  const [contentTypeNavLinks, setContentTypeNavLinks] = useState<ContentTypeNavLink[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<Error | undefined>(undefined);

  const [activeContentType, setActiveContentType] = useState<ContentTypeNavLink | undefined>(undefined);

  useEffect(() => {
    setIsLoading(true);
    setLoadingError(undefined);
    get('/content-manager/init')
      .then((response: ContentManagerInitResponse) => {
        const collectionTypeNavLinks = (response.data.data.contentTypes as ContentType[])
          // Filter out hidden content types and content types that don't match the uid matcher
          .filter(contentType =>
            contentType.isDisplayed &&
            contentType.kind === 'collectionType' &&
            uidMatcher(contentType.uid)
          )
          // Filter out content types that the user doesn't have the permission to access
          .filter(contentType =>
            allPermissions.some(permission =>
              permission.action === `plugin::${pluginId}.explorer.read` &&
              permission.subject === contentType.uid
            )
          )
          .map(contentType => ({
            uid: contentType.uid,
            kind: contentType.kind,
            label: contentType.info.displayName,
            to: `/plugins/${pluginId}/collectionType/${contentType.uid}`,
          }));

        const singleTypeNavLinks = (response.data.data.contentTypes as ContentType[])
          // Filter out hidden content types and content types that don't match the uid matcher
          .filter(contentType =>
            contentType.isDisplayed &&
            contentType.kind === 'singleType' &&
            uidMatcher(contentType.uid)
          )
          // Filter out content types that the user doesn't have the permission to access
          .filter(contentType =>
            allPermissions.some(permission =>
              permission.action === `plugin::${pluginId}.explorer.read` &&
              permission.subject === contentType.uid
            )
          )
          .map(contentType => ({
            uid: contentType.uid,
            kind: contentType.kind,
            label: contentType.info.displayName,
            to: `/plugins/${pluginId}/singleType/${contentType.uid}`,
          }));

        setContentTypeNavLinks(collectionTypeNavLinks.concat(singleTypeNavLinks));
      })
      .catch((error: Error) => {
        setLoadingError(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [])

  useEffect(() => {
    const firstContentTypeNavLink = contentTypeNavLinks[0];
    if (firstContentTypeNavLink && (!params.kind || !params.uid)) {
      history.push(`/plugins/${pluginId}/${firstContentTypeNavLink.kind}/${firstContentTypeNavLink.uid}`);
    }
    else if (params.kind && params.uid) {
      setActiveContentType(
        contentTypeNavLinks.filter(contentType =>
          params.kind === contentType.kind &&
          params.uid === contentType.uid
        )[0]
      )
    }
  },[contentTypeNavLinks, params.kind, params.uid]);

  return (
    <Box background="neutral100">
      <Layout
        sideNav={
          <SubNav ariaLabel="Soft Delete sub nav">
            <SubNavHeader
              searchable
              value={search}
              onClear={() => setSearch("")}
              onChange={(e: any) => setSearch(e.target.value)}
              label={formatMessage({id: getTrad('name'), defaultMessage: 'Soft Delete'})}
              searchLabel="Search..."
            />
            <SubNavSections>
              <SubNavSection
                label={formatMessage({id: getTrad('explorer.collectionTypes'), defaultMessage: 'Collection Types'})}
                collapsable
                badgeLabel={contentTypeNavLinks
                  .filter(
                    (contentTypeNavLink) =>
                      contentTypeNavLink.kind === "collectionType"
                  )
                  .length.toString()}
              >
                {contentTypeNavLinks
                  .filter(
                    (contentTypeNavLink) =>
                      contentTypeNavLink.kind === "collectionType"
                  )
                  .map((contentType, index) => (
                    <SubNavLink
                      to={contentType.to}
                      active={contentType.uid === activeContentType?.uid}
                      key={index}
                    >
                      {contentType.label}
                    </SubNavLink>
                  ))}
              </SubNavSection>
              <SubNavSection
                label={formatMessage({id: getTrad('explorer.singleTypes'), defaultMessage: 'Single Types'})}
                collapsable
                badgeLabel={contentTypeNavLinks
                  .filter(
                    (contentTypeNavLink) =>
                      contentTypeNavLink.kind === "singleType"
                  )
                  .length.toString()}
              >
                {contentTypeNavLinks
                  .filter(
                    (contentTypeNavLink) =>
                      contentTypeNavLink.kind === "singleType"
                  )
                  .map((contentType, index) => (
                    <SubNavLink
                      to={contentType.to}
                      active={contentType.uid === activeContentType?.uid}
                      key={index}
                    >
                      {contentType.label}
                    </SubNavLink>
                  ))}
              </SubNavSection>
            </SubNavSections>
          </SubNav>
        }
      >
        <>
          {isLoading && <Flex
            direction="column"
            gap="2"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <Loader />
          </Flex> ||
          !isLoading && loadingError && <Flex
            direction="column"
            gap="2"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <Typography variant="delta" textColor="neutral500">
              {formatMessage({id: getTrad('explorer.errorLoadingContentTypes'), defaultMessage: 'Error loading types'})}
            </Typography>
            <Typography variant="delta" textColor="neutral600">
              {loadingError.message}
            </Typography>
          </Flex> ||
          <ContentTypeEntries contentType={activeContentType} />}
        </>
      </Layout>
    </Box>
  );
};

export default Explorer;
