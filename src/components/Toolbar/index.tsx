'use client'

import React from 'react'
import { useTranslation } from '@payloadcms/ui'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// Context for passing selected state to children
const ToolContext = React.createContext<{ selected: boolean }>({ selected: false })

export function ToolbarWrapper({ children }: { children: React.ReactNode }) {
  /**
   * For "floating" toolbar, use "md:h-[calc(100vh-var(--spacing-view-bottom)-var(--app-header-height))] md:top-[var(--doc-controls-height)]" on container.
   * For "fixed" to top, use "md:top-[calc(-1*var(--app-header-height))]" on outer-wrapper.
   */
  return (
    <div className="toolbar__container md:w-16 sticky z-10 top-0 md:h-[calc(100vh-var(--app-header-height))] border-solid border-l border-[var(--theme-elevation-150)]">
      <div className="toolbar__outer-wrapper w-full md:absolute md:inset-0 md:left-1/2  md:overflow-y-auto scrollbar-hide z-10">
        <div className="toolbar__inner-wrapper flex flex-row md:flex-col px-4 md:px-0  overflow-x-auto md:overflow-x-hidden md:overflow-y-auto z-10 items-center border-b md:border-b-0 md:border-l border-foreground rounded-lg h-fit">
          {children}
        </div>
      </div>
    </div>
  )
}

export function Group({ children, gap = true }: { children: React.ReactNode; gap?: boolean }) {
  return (
    <div
      className={cn(
        'toolbar__group md:w-full flex flex-row md:flex-col items-center m-0.5',
        gap && 'gap-1',
      )}
    >
      {children}
    </div>
  )
}

export function Divider() {
  return <div className="toolbar__divider md:h-px md:w-full h-full w-px bg-foreground" />
}

export function FilledChevronIcon({
  className = '',
  size = 12,
}: {
  className?: string
  size?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="currentColor"
      className={`toolbar__chevron-icon absolute bottom-0 right-0 md:left-0 md:right-auto -rotate-45 md:rotate-45 ${className}`}
    >
      <path d="M6 6L6 2L10 6L6 6z" />
    </svg>
  )
}

interface TopRowProps {
  children?: React.ReactNode
  variant?: 'text' | 'dot'
  color?: string
}

export function TopRow({ children, variant = 'text', color = 'bg-green-400' }: TopRowProps) {
  return (
    <div className="toolbar__top-row relative">
      <div className="text-sm u-text-style- opacity-0 pointer-events-none">-</div>
      {children ? children : null}
    </div>
  )
}

export function TopRowDot({ children, color = 'bg-green-400' }: TopRowProps) {
  return (
    <div
      className="toolbar__dot w-full absolute bottom-1/2 right-0"
      style={{ transform: 'translateY(50%)' }}
    >
      <div className="flex justify-end">
        <div className={`w-1.5 h-1.5 ${color} rounded-full`} />
      </div>
    </div>
  )
}

interface BottomRowProps {
  children?: React.ReactNode
}

export function BottomRow({ children }: BottomRowProps) {
  return children ? (
    <div className="toolbar__bottom-row text-sm u-text-style- relative">{children}</div>
  ) : (
    <div className="toolbar__bottom-row text-sm u-text-style- opacity-0 pointer-events-none relative">
      -
    </div>
  )
}

interface IconSlotProps {
  children: React.ReactNode
  selected?: boolean
}

export function IconSlot({ children }: IconSlotProps) {
  const { selected } = React.useContext(ToolContext)

  // Check if the child is a React element (likely an icon)
  const isIcon = React.isValidElement(children) && typeof children.type !== 'string'

  if (isIcon && children.props) {
    // Clone the element and merge the className
    const iconClasses = selected ? 'w-5 h-5 text-foreground' : 'w-5 h-5 text-muted-foreground'

    return (
      <div className="toolbar__icon-slot flex items-center justify-center">
        {React.cloneElement(children as React.ReactElement<any>, {
          className: `w-5 h-5 text-foreground ${(children.props as any).className || ''}`.trim(),
        })}
      </div>
    )
  }

  return <div className="toolbar__icon-slot flex items-center justify-center">{children}</div>
}

interface ToolProps {
  children: React.ReactNode
  variant?: 'default' | 'toggle' | 'shadcn-toggle'
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}

const Tool = React.forwardRef<HTMLButtonElement, ToolProps>(
  ({ children, variant = 'default', selected = false, disabled = false, onClick }, ref) => {
    if (variant === 'shadcn-toggle') {
      return (
        <ToolContext.Provider value={{ selected }}>
          <Toggle
            ref={ref}
            pressed={selected}
            onPressedChange={onClick}
            className="flex-col h-auto p-1"
            disabled={disabled}
          >
            {children}
          </Toggle>
        </ToolContext.Provider>
      )
    }

    if (variant === 'toggle') {
      const toggleClasses = selected
        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
        : 'hover:bg-muted'

      const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

      return (
        <ToolContext.Provider value={{ selected }}>
          <button
            ref={ref}
            className={`toolbar__tool ${defaultClassNames} ${toggleClasses} ${disabledClasses} transition-colors`}
            onClick={() => {
              if (!disabled) {
                console.log('clicked')
                onClick?.()
              }
            }}
            disabled={disabled}
          >
            {children}
          </button>
        </ToolContext.Provider>
      )
    }

    const disabledClasses = disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer hover:bg-muted'

    return (
      <ToolContext.Provider value={{ selected }}>
        <button
          ref={ref}
          className={`${baseClasses} ${disabledClasses}`}
          onClick={() => {
            if (!disabled) {
              onClick?.()
            }
          }}
          disabled={disabled}
        >
          {children}
        </button>
      </ToolContext.Provider>
    )
  },
)

Tool.displayName = 'Tool'

// Tooltip Tool wrapper
interface TooltipToolProps {
  children: React.ReactNode
  tooltip: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right' | 'responsive'
}

export function TooltipTool({ children, tooltip, side = 'responsive' }: TooltipToolProps) {
  const [currentSide, setCurrentSide] = React.useState<'top' | 'bottom' | 'left' | 'right'>(
    'bottom',
  )

  React.useEffect(() => {
    if (side === 'responsive') {
      const updateSide = () => {
        // Check if screen is md (768px) or larger
        const isMd = window.matchMedia('(min-width: 768px)').matches
        setCurrentSide(isMd ? 'left' : 'bottom')
      }

      updateSide() // Set initial value

      const mediaQuery = window.matchMedia('(min-width: 768px)')
      mediaQuery.addEventListener('change', updateSide)

      return () => mediaQuery.removeEventListener('change', updateSide)
    } else {
      setCurrentSide(side)
    }
  }, [side])

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipPortal>
        <TooltipContent side={currentSide}>{tooltip}</TooltipContent>
      </TooltipPortal>
    </Tooltip>
  )
}

// New ToggleGroup Tool component
interface ToggleGroupToolProps {
  children: React.ReactNode
  value: string
  'aria-label': string
}

function ToggleGroupTool({ children, value, 'aria-label': ariaLabel }: ToggleGroupToolProps) {
  return (
    <ToggleGroupItem value={value} aria-label={ariaLabel} className="h-auto p-1 flex-col">
      {children}
    </ToggleGroupItem>
  )
}

// Dropdown Tool component
interface DropdownToolProps {
  children: React.ReactNode
  dropdownItems: React.ReactNode
}

function DropdownTool({ children, dropdownItems }: DropdownToolProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="w-full flex flex-col items-center relative p-1 gap-1 rounded-sm hover:bg-muted cursor-pointer">
          {children}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-1">
        {dropdownItems}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Toolbar(props: DocumentViewClientProps) {
  const [selectedTool, setSelectedTool] = React.useState<string | null>(null)
  const [singleSelectValue, setSingleSelectValue] = React.useState<string>('')
  const [multiSelectValues, setMultiSelectValues] = React.useState<string[]>([])
  const { t } = useTranslation()

  return <></>
}

export const defaultClassNames =
  'w-full flex flex-col items-center relative p-1 gap-0 rounded-sm !border-none transition-colors'

import type { DocumentViewClientProps } from 'payload'
import { TooltipPortal } from '@radix-ui/react-tooltip'
import { cn } from '@/utilities/ui'
Toolbar.Wrapper = ToolbarWrapper
Toolbar.Group = Group
Toolbar.Tool = Tool
Toolbar.TooltipTool = TooltipTool
Toolbar.ToggleGroupTool = ToggleGroupTool
Toolbar.DropdownTool = DropdownTool
Toolbar.TopRow = TopRow
Toolbar.TopRowDot = TopRowDot
Toolbar.BottomRow = BottomRow
Toolbar.IconSlot = IconSlot
Toolbar.Divider = Divider
Toolbar.FilledChevronIcon = FilledChevronIcon
