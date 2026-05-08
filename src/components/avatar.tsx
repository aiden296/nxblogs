'use client'

import { useRef, useState, useCallback } from 'react'

type Props = {
  src: string
  alt?: string
  size?: number
}

export function Avatar({ src, alt = 'Avatar', size = 60 }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ translateX: 0, rotateDeg: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const rect = wrapper.getBoundingClientRect()
      const radius = size / 2
      const avatarCenterX = rect.left + radius
      const maxTranslateX = rect.width - size
      let translateX = e.clientX - avatarCenterX
      translateX = Math.max(0, Math.min(translateX, maxTranslateX))
      const rotateDeg = (translateX / radius) * (180 / Math.PI) * 0.3
      setTransform({ translateX, rotateDeg })
    },
    [size],
  )

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    setTransform({ translateX: 0, rotateDeg: 0 })
  }, [])

  return (
    <div
      ref={wrapperRef}
      className="flex w-full cursor-pointer items-center justify-start"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'inline',
          margin: 0,
          transform: `translateX(${transform.translateX}px) rotate(${transform.rotateDeg}deg)`,
          transition: isHovering
            ? 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            : 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform',
        }}
      />
    </div>
  )
}
