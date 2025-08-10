'use client'
import React from 'react'

import type { Props } from '@payloadcms/ui'

import { Button } from './Button'
import {
  useForm,
  useFormBackgroundProcessing,
  useFormInitializing,
  useFormProcessing,
} from '@payloadcms/ui'
// import './index.scss'

const baseClass = 'form-submit'

export const FormSubmit: React.FC<
  Props & {
    render?: (props: {
      buttonProps: any
      children: React.ReactNode
      disabled: boolean
    }) => React.ReactNode
  }
> = (props) => {
  const {
    type = 'submit',
    buttonId: id,
    children,
    disabled: disabledFromProps,
    onClick,
    programmaticSubmit,
    ref,
    render,
  } = props

  const processing = useFormProcessing()
  const backgroundProcessing = useFormBackgroundProcessing()
  const initializing = useFormInitializing()
  const { disabled, submit } = useForm()

  const canSave = !(
    disabledFromProps ||
    initializing ||
    processing ||
    backgroundProcessing ||
    disabled
  )

  const handleClick =
    onClick ??
    (programmaticSubmit
      ? () => {
          void submit()
        }
      : undefined)

  return (
    <div className={baseClass}>
      <Button
        ref={ref}
        {...props}
        disabled={canSave ? undefined : true}
        id={id}
        onClick={handleClick}
        render={render}
        type={type}
      >
        {children}
      </Button>
    </div>
  )
}
