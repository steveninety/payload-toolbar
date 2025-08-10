'use client'
import React, { ComponentProps, Fragment, isValidElement } from 'react'

// import type { Props } from '@payloadcms/ui/elements/Button'

import { ChevronIcon } from '@payloadcms/ui'
import { EditIcon } from '@payloadcms/ui'
import { LinkIcon } from '@payloadcms/ui'
import { PlusIcon } from '@payloadcms/ui'
import { SwapIcon } from '@payloadcms/ui'
import { XIcon } from '@payloadcms/ui'
import { Link } from '@payloadcms/ui'
import { Popup } from '@payloadcms/ui'
import { Tooltip } from '@payloadcms/ui'
import { Button as ButtonOriginal } from '@payloadcms/ui'
// import './index.scss'

type Props = ComponentProps<typeof ButtonOriginal>

const icons = {
  chevron: ChevronIcon,
  edit: EditIcon,
  link: LinkIcon,
  plus: PlusIcon,
  swap: SwapIcon,
  x: XIcon,
}

const baseClass = 'btn'

export const ButtonContents = ({ children, icon, showTooltip, tooltip }) => {
  const BuiltInIcon = icons[icon]

  return (
    <Fragment>
      {tooltip && (
        <Tooltip className={`${baseClass}__tooltip`} show={showTooltip}>
          {tooltip}
        </Tooltip>
      )}
      <span className={`${baseClass}__content`}>
        {children && <span className={`${baseClass}__label`}>{children}</span>}
        {icon && (
          <span className={`${baseClass}__icon`}>
            {isValidElement(icon) && icon}
            {BuiltInIcon && <BuiltInIcon />}
          </span>
        )}
      </span>
    </Fragment>
  )
}

export const Button: React.FC<
  Props & {
    render?: (props: {
      buttonProps: any
      children: React.ReactNode
      disabled: boolean
    }) => React.ReactNode
  }
> = (props) => {
  const {
    id,
    type = 'button',
    'aria-label': ariaLabel,
    buttonStyle = 'primary',
    children,
    className,
    disabled,
    el = 'button',
    enableSubMenu,
    icon,
    iconPosition = 'right',
    iconStyle = 'without-border',
    margin = true,
    newTab,
    onClick,
    onMouseDown,
    ref,
    render,
    round,
    size = 'medium',
    SubMenuPopupContent,
    to,
    tooltip,
    url,
  } = props

  const [showTooltip, setShowTooltip] = React.useState(false)

  const classes = [
    baseClass,
    className && className,
    icon && `${baseClass}--icon`,
    iconStyle && `${baseClass}--icon-style-${iconStyle}`,
    icon && !children && `${baseClass}--icon-only`,
    size && `${baseClass}--size-${size}`,
    icon && iconPosition && `${baseClass}--icon-position-${iconPosition}`,
    tooltip && `${baseClass}--has-tooltip`,
    !SubMenuPopupContent && `${baseClass}--withoutPopup`,
    !margin && `${baseClass}--no-margin`,
  ]
    .filter(Boolean)
    .join(' ')

  function handleClick(event) {
    setShowTooltip(false)
    if (type !== 'submit' && onClick) {
      event.preventDefault()
    }
    if (onClick) {
      onClick(event)
    }
  }

  const styleClasses = [
    buttonStyle && `${baseClass}--style-${buttonStyle}`,
    disabled && `${baseClass}--disabled`,
    round && `${baseClass}--round`,
    SubMenuPopupContent ? `${baseClass}--withPopup` : `${baseClass}--withoutPopup`,
  ]
    .filter(Boolean)
    .join(' ')

  const buttonProps = {
    id,
    type,
    'aria-disabled': disabled,
    'aria-label': ariaLabel,
    className: !SubMenuPopupContent ? [classes, styleClasses].join(' ') : classes,
    disabled,
    onClick: !disabled ? handleClick : undefined,
    onMouseDown: !disabled ? onMouseDown : undefined,
    onPointerEnter: tooltip ? () => setShowTooltip(true) : undefined,
    onPointerLeave: tooltip ? () => setShowTooltip(false) : undefined,
    rel: newTab ? 'noopener noreferrer' : undefined,
    target: newTab ? '_blank' : undefined,
    title: ariaLabel,
  }

  let buttonElement
  let prefetch

  const buttonContents = (
    <ButtonContents icon={icon} showTooltip={showTooltip} tooltip={tooltip}>
      {children}
    </ButtonContents>
  )

  // If render prop is provided, use custom rendering
  if (render) {
    buttonElement = render({
      buttonProps,
      children: buttonContents,
      disabled: !!disabled,
    })
  } else {
    // Default rendering logic
    switch (el) {
      case 'anchor':
        buttonElement = (
          <a
            {...buttonProps}
            href={!disabled ? url : undefined}
            ref={ref as React.RefObject<HTMLAnchorElement>}
          >
            {buttonContents}
          </a>
        )
        break

      case 'link':
        if (disabled) {
          buttonElement = <div {...buttonProps}>{buttonContents}</div>
        }

        buttonElement = (
          <Link {...buttonProps} href={to || url} prefetch={prefetch}>
            {buttonContents}
          </Link>
        )

        break

      default:
        const Tag = el // eslint-disable-line no-case-declarations

        buttonElement = (
          <Tag ref={ref} {...buttonProps}>
            {buttonContents}
          </Tag>
        )
        break
    }
  }
  if (SubMenuPopupContent) {
    return (
      <div className={styleClasses}>
        {buttonElement}
        <Popup
          button={<ChevronIcon />}
          buttonSize={size}
          className={disabled && !enableSubMenu ? `${baseClass}--popup-disabled` : ''}
          disabled={disabled && !enableSubMenu}
          horizontalAlign="right"
          id={`${id}-popup`}
          noBackground
          render={({ close }) => SubMenuPopupContent({ close: () => close() })}
          size="large"
          verticalAlign="bottom"
        />
      </div>
    )
  }

  return buttonElement
}
