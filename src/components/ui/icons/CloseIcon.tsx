import type { IconProps } from './types'

export function CloseIcon(props: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" {...props}>
      <path
        d="M10.59 0L6 4.59L1.41 0L0 1.41L4.59 6L0 10.59L1.41 12L6 7.41L10.59 12L12 10.59L7.41 6L12 1.41L10.59 0Z"
        fill="currentColor"
      />
    </svg>
  )
}
