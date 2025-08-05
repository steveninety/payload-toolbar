'use client'

import type { SaveDraftButtonClientProps } from 'payload'

import React, { useCallback } from 'react'
import {
  useConfig,
  useDocumentInfo,
  useEditDepth,
  useForm,
  useFormModified,
  useLocale,
  useOperation,
  useTranslation,
} from '@payloadcms/ui'
import { FormSubmit } from './FormSubmit'
import { cn } from '@/utilities/ui'
import { formatTimeAgoCompact } from '@/utilities/formatTimeAgoCompact'
import Toolbar, { TooltipTool } from '@/components/Toolbar'
import { SaveIcon } from 'lucide-react'

const baseClass = 'save-draft'

export const SaveDraftButton = React.forwardRef<
  HTMLButtonElement,
  SaveDraftButtonClientProps & {
    className?: string
    children?: React.ReactNode
  }
>((props, ref) => {
  const {
    id,
    collectionSlug,
    globalSlug,
    savedDocumentData,
    setUnpublishedVersionCount,
    uploadStatus,
  } = useDocumentInfo()
  const { t, i18n } = useTranslation()
  const { code: localeCode } = useLocale()
  const {
    config: {
      routes: { api },
      serverURL,
    },
  } = useConfig()

  const { submit } = useForm()
  const modified = useFormModified()
  const operation = useOperation()

  // This is the crucial logic that was missing!
  const disabled = (operation === 'update' && !modified) || uploadStatus === 'uploading'

  // Format time ago for display using savedDocumentData.updatedAt
  const timeAgoText = savedDocumentData?.updatedAt
    ? formatTimeAgoCompact(savedDocumentData.updatedAt)
    : null

  console.log(
    'savedDocumentData?.updatedAt',
    savedDocumentData?.updatedAt,
    'timeAgoText',
    timeAgoText,
  )

  const handleSaveDraft = useCallback(async () => {
    if (disabled) {
      return
    }

    const search = `?locale=${localeCode}&depth=0&fallback-locale=null&draft=true`
    let action
    let method = 'POST'

    if (collectionSlug) {
      action = `${serverURL}${api}/${collectionSlug}${id ? `/${id}` : ''}${search}`
      if (id) {
        method = 'PATCH'
      }
    }

    if (globalSlug) {
      action = `${serverURL}${api}/globals/${globalSlug}${search}`
    }

    await submit({
      action,
      method,
      overrides: {
        _status: 'draft',
      },
      skipValidation: true,
    })

    setUnpublishedVersionCount((count) => count + 1)
  }, [
    disabled,
    submit,
    collectionSlug,
    globalSlug,
    id,
    localeCode,
    serverURL,
    api,
    setUnpublishedVersionCount,
  ])

  return (
    <FormSubmit
      buttonId="action-save-draft"
      disabled={disabled}
      onClick={handleSaveDraft}
      type="button"
      render={({ buttonProps, disabled: formDisabled }) => {
        const isDisabled = disabled || formDisabled
        return (
          <TooltipTool tooltip={t('version:saveDraft')}>
            <button
              {...buttonProps}
              ref={ref}
              className={cn(
                'w-8 flex flex-col items-center relative p-1 gap-1 rounded-sm !border-none',
                isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-muted',
                props.className,
              )}
            >
              <Toolbar.TopRow>
                <Toolbar.TopRowDot color="bg-green-400" />
              </Toolbar.TopRow>
              <Toolbar.IconSlot>
                <SaveIcon className={isDisabled ? 'opacity-50' : ''} />
              </Toolbar.IconSlot>
              <Toolbar.BottomRow>{timeAgoText || '-'}</Toolbar.BottomRow>
            </button>
          </TooltipTool>
        )
      }}
    />
  )
})

SaveDraftButton.displayName = 'SaveDraftButton'
