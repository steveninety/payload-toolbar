'use client'
import type { SanitizedConfig } from 'payload'

import { useParams, usePathname, useSearchParams } from 'next/navigation'
import { formatAdminURL } from 'payload/shared'
import React from 'react'
import Toolbar, { TooltipTool } from '@/components/Toolbar'
import { SaveIcon } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { Link } from '@payloadcms/ui'

export const DocumentTabLink: React.FC<{
  adminRoute: SanitizedConfig['routes']['admin']
  ariaLabel?: string
  baseClass: string
  children?: React.ReactNode
  href: string
  isActive?: boolean
  newTab?: boolean
  customIcon?: React.ReactNode
  tooltip?: string
  onClick?: () => void
}> = ({
  adminRoute,
  ariaLabel,
  baseClass,
  children,
  href: hrefFromProps,
  isActive: isActiveFromProps,
  newTab,
  customIcon,
  tooltip,
  onClick,
}) => {
  const pathname = usePathname()
  const params = useParams()

  const searchParams = useSearchParams()

  const locale = searchParams.get('locale')

  const [entityType, entitySlug, segmentThree, segmentFour, ...rest] = params.segments || []
  const isCollection = entityType === 'collections'

  let docPath = formatAdminURL({
    adminRoute,
    path: `/${isCollection ? 'collections' : 'globals'}/${entitySlug}`,
  })

  if (isCollection) {
    if (segmentThree === 'trash' && segmentFour) {
      docPath += `/trash/${segmentFour}`
    } else if (segmentThree) {
      docPath += `/${segmentThree}`
    }
  }

  const href = `${docPath}${hrefFromProps}`
  // separated the two so it doesn't break checks against pathname
  const hrefWithLocale = `${href}${locale ? `?locale=${locale}` : ''}`

  const isActive =
    (href === docPath && pathname === docPath) ||
    (href !== docPath && pathname.startsWith(href)) ||
    isActiveFromProps

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }
  const el = !isActive || href !== pathname ? 'link' : 'div'
  const to = !isActive || href !== pathname ? hrefWithLocale : undefined
  const prefetch = !isActive || href !== pathname ? true : false
  const disabled = isActive

  const buttonContents = (
    <>
      <Toolbar.TopRow />
      <Toolbar.IconSlot>{customIcon}</Toolbar.IconSlot>
      <Toolbar.BottomRow />
    </>
  )

  const buttonProps = {
    'aria-label': ariaLabel,
    disabled: isActive,
    className: cn(
      'w-full flex flex-col items-center relative p-1 gap-0 rounded-sm !border-none transition-colors',
      // baseClass,
      isActive && `${baseClass}--active`,
      isActive ? 'cursor-default bg-muted' : 'cursor-pointer hover:bg-muted',
    ),
  }

  // baseClass,
  let buttonElement

  switch (el) {
    case 'link':
      if (disabled) {
        buttonElement = <div {...buttonProps}>{buttonContents}</div>
      }

      buttonElement = (
        <Link {...buttonProps} href={to} prefetch={prefetch}>
          {buttonContents}
        </Link>
      )

      break

    default:
      const Tag = el // eslint-disable-line no-case-declarations

      buttonElement = <Tag {...buttonProps}>{buttonContents}</Tag>
      break
  }

  return <TooltipTool tooltip={tooltip || ariaLabel}>{buttonElement}</TooltipTool>
}
