import type { IconProps } from './types'

export function PlusIcon(props: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...props}>
      <path d="M6 6V0H8V6H14V8H8V14H6V8H0V6H6Z" fill="currentColor" />
    </svg>
  )
}
