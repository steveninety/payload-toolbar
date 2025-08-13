'use client'
import type { SanitizedCollectionConfig } from 'payload'

import { useModal } from '@payloadcms/ui'
import { getTranslation } from '@payloadcms/translations'
import { useRouter } from 'next/navigation.js'
import { formatAdminURL } from 'payload/shared'
import React, { Fragment, useCallback, useState } from 'react'
import { toast } from 'sonner'

import type { DocumentDrawerContextType } from '@payloadcms/ui'

import { CheckboxInput } from '@payloadcms/ui'
import { useForm } from '@payloadcms/ui'
import { useConfig } from '@payloadcms/ui'
import { useDocumentTitle } from '@payloadcms/ui'
import { useRouteTransition } from '@payloadcms/ui'
import { useTranslation } from '@payloadcms/ui'
import { requests } from '@payloadcms/ui/utilities/api'
import { ConfirmationModal } from '@payloadcms/ui'
import { PopupList } from '@payloadcms/ui'
import { Translation } from '@payloadcms/ui'
import TB, { defaultClassNames, TooltipTool } from '@/components/Toolbar'
import { cn } from '@/utilities/ui'
import { TrashIcon } from 'lucide-react'
// import './index.scss'

const baseClass = 'delete-document'

export type Props = {
  readonly buttonId?: string
  readonly collectionSlug: SanitizedCollectionConfig['slug']
  readonly id?: string
  readonly onDelete?: DocumentDrawerContextType['onDelete']
  readonly redirectAfterDelete?: boolean
  readonly singularLabel: SanitizedCollectionConfig['labels']['singular']
  readonly title?: string
  readonly useAsTitle: SanitizedCollectionConfig['admin']['useAsTitle']
}

export const DeleteDocument: React.FC<Props> = (props) => {
  const {
    id,
    buttonId,
    collectionSlug,
    onDelete,
    redirectAfterDelete = true,
    singularLabel,
    title: titleFromProps,
  } = props

  const {
    config: {
      routes: { admin: adminRoute, api },
      serverURL,
    },
    getEntityConfig,
  } = useConfig()

  const collectionConfig = getEntityConfig({ collectionSlug })

  const { setModified } = useForm()
  const router = useRouter()
  const { i18n, t } = useTranslation()
  const { title } = useDocumentTitle()
  const { startRouteTransition } = useRouteTransition()
  const { openModal } = useModal()

  const modalSlug = `delete-${id}`

  const [deletePermanently, setDeletePermanently] = useState(false)

  const addDefaultError = useCallback(() => {
    toast.error(t('error:deletingTitle', { title }))
  }, [t, title])

  const handleDelete = useCallback(async () => {
    setModified(false)

    console.log('deletePermanently', deletePermanently)

    try {
      const res =
        deletePermanently || !collectionConfig.trash
          ? await requests.delete(`${serverURL}${api}/${collectionSlug}/${id}`, {
              headers: {
                'Accept-Language': i18n.language,
                'Content-Type': 'application/json',
              },
            })
          : await requests.patch(`${serverURL}${api}/${collectionSlug}/${id}`, {
              body: JSON.stringify({
                deletedAt: new Date().toISOString(),
              }),
              headers: {
                'Accept-Language': i18n.language,
                'Content-Type': 'application/json',
              },
            })

      const json = await res.json()

      console.log('json', json)

      if (res.status < 400) {
        toast.success(
          t(
            deletePermanently || !collectionConfig.trash
              ? 'general:titleDeleted'
              : 'general:titleTrashed',
            {
              label: getTranslation(singularLabel, i18n),
              title,
            },
          ) || json.message,
        )

        if (redirectAfterDelete) {
          console.log('redirectAfterDelete', redirectAfterDelete)
          return startRouteTransition(() =>
            router.push(
              formatAdminURL({
                adminRoute,
                path: `/collections/${collectionSlug}`,
              }),
            ),
          )
        }

        if (typeof onDelete === 'function') {
          await onDelete({ id, collectionConfig })
        }

        return
      }

      if (json.errors) {
        json.errors.forEach((error) => toast.error(error.message))
      } else {
        addDefaultError()
      }

      return
    } catch (_err) {
      return addDefaultError()
    }
  }, [
    deletePermanently,
    setModified,
    serverURL,
    api,
    collectionSlug,
    id,
    t,
    singularLabel,
    addDefaultError,
    i18n,
    title,
    router,
    adminRoute,
    redirectAfterDelete,
    onDelete,
    collectionConfig,
    startRouteTransition,
  ])

  if (id) {
    return (
      <Fragment>
        <TooltipTool tooltip={t('general:delete')}>
          <button
            className={cn(defaultClassNames)}
            id={buttonId}
            // onClick={() => openModal(modalSlug)}
          >
            <TB.TopRow />
            <TB.IconSlot>
              <TrashIcon />
            </TB.IconSlot>
            <TB.BottomRow />
          </button>
        </TooltipTool>
        <ConfirmationModal
          body={
            <Fragment>
              <Translation
                elements={{
                  '1': ({ children }) => <strong>{children}</strong>,
                }}
                i18nKey={collectionConfig.trash ? 'general:aboutToTrash' : 'general:aboutToDelete'}
                t={t}
                variables={{
                  label: getTranslation(singularLabel, i18n),
                  title: titleFromProps || title || id,
                }}
              />
              {collectionConfig.trash && (
                <div className={`${baseClass}__checkbox`}>
                  <CheckboxInput
                    checked={deletePermanently}
                    id="delete-forever"
                    label={t('general:deletePermanently')}
                    name="delete-forever"
                    onToggle={(e) => setDeletePermanently(e.target.checked)}
                  />
                </div>
              )}
            </Fragment>
          }
          className={baseClass}
          confirmingLabel={t('general:deleting')}
          heading={t('general:confirmDeletion')}
          modalSlug={modalSlug}
          // onConfirm={handleDelete}
          onConfirm={() => {
            console.log('onConfirm')
          }}
        />
      </Fragment>
    )
  }

  return null
}
