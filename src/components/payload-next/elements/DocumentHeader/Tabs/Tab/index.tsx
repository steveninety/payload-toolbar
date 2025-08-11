import type {
  DocumentTabConfig,
  DocumentTabServerPropsOnly,
  PayloadRequest,
  SanitizedCollectionConfig,
  SanitizedGlobalConfig,
  SanitizedPermissions,
} from 'payload'
import type React from 'react'

import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import { Fragment } from 'react'

import { DocumentTabLink } from './TabLink'
// import './index.scss'

export const baseClass = 'doc-tab'

export const DefaultDocumentTab: React.FC<{
  apiURL?: string
  collectionConfig?: SanitizedCollectionConfig
  globalConfig?: SanitizedGlobalConfig
  path?: string
  permissions?: SanitizedPermissions
  req: PayloadRequest
  tabConfig: { readonly Pill_Component?: React.FC } & DocumentTabConfig
  icon?: React.ReactNode
}> = (props) => {
  const {
    apiURL,
    collectionConfig,
    globalConfig,
    permissions,
    req,
    tabConfig: { href: tabHref, isActive: tabIsActive, label, newTab, Pill, Pill_Component },
    icon,
  } = props

  let href = typeof tabHref === 'string' ? tabHref : ''
  let isActive = typeof tabIsActive === 'boolean' ? tabIsActive : false

  if (typeof tabHref === 'function') {
    href = tabHref({
      apiURL: apiURL || '',
      collection: collectionConfig || ({} as SanitizedCollectionConfig),
      global: globalConfig || ({} as SanitizedGlobalConfig),
      routes: req.payload.config.routes,
    })
  }

  if (typeof tabIsActive === 'function') {
    isActive = tabIsActive({
      href,
    })
  }

  const labelToRender =
    typeof label === 'function'
      ? label({
          t: (key: string) => req.i18n.t(key as any),
        })
      : label

  return (
    <DocumentTabLink
      adminRoute={req.payload.config.routes.admin}
      ariaLabel={labelToRender}
      baseClass={baseClass}
      href={href}
      isActive={isActive}
      newTab={newTab}
      tooltip={labelToRender}
      customIcon={icon}
    >
      <span className={`${baseClass}__label`}>
        {labelToRender}
        {Pill || Pill_Component ? (
          <Fragment>
            &nbsp;
            {RenderServerComponent({
              Component: Pill,
              Fallback: Pill_Component,
              importMap: req.payload.importMap,
              serverProps: {
                i18n: req.i18n,
                payload: req.payload,
                permissions: permissions || ({} as SanitizedPermissions),
                req,
                user: req.user || undefined,
              } satisfies DocumentTabServerPropsOnly,
            })}
          </Fragment>
        ) : null}
      </span>
    </DocumentTabLink>
  )
}
