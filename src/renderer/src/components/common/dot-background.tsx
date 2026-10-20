import type { RefObject } from 'react'

interface DotProps {
  /**
   * Color of the dot
   */
  color?: string

  /**
   * Size of the dot in pixels
   */
  size?: number

  /**
   * Spacing between dots
   */
  spacing?: number

  /**
   * Content of the component
   */
  children?: React.ReactNode

  /**
   * Class name
   */
  className?: string

  style?: React.CSSProperties
  ref?: RefObject<HTMLDivElement>
}

export function Dot({
  ref,
  color = '#cacaca',
  size = 1,
  spacing = 10,
  children,
  className,
  style = {
    backgroundColor: 'white'
  }
}: DotProps) {
  return (
    <div
      ref={ref}
      style={{
        ...style,
        backgroundImage: `radial-gradient(${color} ${size}px, transparent ${size}px)`,
        backgroundSize: `calc(${spacing} * ${size}px) calc(${spacing} * ${size}px)`
      }}
      className={className}
    >
      {children}
    </div>
  )
}
