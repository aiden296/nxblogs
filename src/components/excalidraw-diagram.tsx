'use client'

import { useEffect, useState } from 'react'
import { ImageZoom } from 'nextra/components'

interface ExcalidrawDiagramProps {
  src: string
  alt?: string
}

let excalidrawModule: Promise<typeof import('@excalidraw/excalidraw')> | null = null

// Turbopack dev resolves Excalidraw's font-subset worker URL as file://, which throws a
// cross-origin SecurityError. Disabling Worker during import forces font subsetting onto
// the main thread (identical SVG output, no error). Production keeps the worker.
function loadExcalidraw() {
  if (!excalidrawModule) {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const OriginalWorker = window.Worker
      window.Worker = undefined as unknown as typeof Worker
      excalidrawModule = import('@excalidraw/excalidraw').finally(() => {
        window.Worker = OriginalWorker
      })
    } else {
      excalidrawModule = import('@excalidraw/excalidraw')
    }
  }

  return excalidrawModule
}

export function ExcalidrawDiagram({ src, alt }: ExcalidrawDiagramProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const res = await fetch(src)

        if (!res.ok) {
          throw new Error(`Failed to load ${src}`)
        }

        const data = await res.json()

        const { exportToSvg } = await loadExcalidraw()

        const svgElement = await exportToSvg({
          elements: data.elements,
          appState: {
            ...data.appState,
            exportWithDarkMode: false,
            exportBackground: true,
            exportEmbedScene: false,
          },
          files: data.files || {},
        })

        const svgString = new XMLSerializer().serializeToString(svgElement)
        const blob = new Blob([svgString], { type: 'image/svg+xml' })

        if (cancelled) {
          return
        }

        setDataUrl(URL.createObjectURL(blob))
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to render diagram')
        }
      }
    }

    render()

    return () => {
      cancelled = true

      if (dataUrl) {
        URL.revokeObjectURL(dataUrl)
      }
    }
  }, [src])

  if (error) {
    return <p className="text-red-500 text-sm">{error}</p>
  }

  if (!dataUrl) {
    return null
  }

  return (
    <figure className="post-figure">
      <ImageZoom src={dataUrl} alt={alt || 'Excalidraw diagram'} />
      {alt ? <figcaption className="post-figcaption">{alt}</figcaption> : null}
    </figure>
  )
}
