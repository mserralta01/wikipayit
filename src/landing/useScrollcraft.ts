import { useEffect } from "react"

type ScrollCraftApi = { mount: (root: Element) => unknown; instances: unknown[] }

declare global {
  interface Window {
    ScrollCraft?: ScrollCraftApi
  }
}

/** Versioned file name: replacing the engine means a new name, never new bytes at the same URL. */
const ENGINE_SRC = "/scrollcraft/scrollcraft-2026-10.js"

/**
 * Loads the scrollcraft engine and mounts it on the page root once. The engine
 * reads data-sc-* attributes from the rendered markup and never creates DOM of
 * its own, so React's tree stays intact. It also scopes the landing page's base
 * styles to <html> and <body> while the page is on screen.
 */
export function useScrollcraft(rootId: string) {
  useEffect(() => {
    document.documentElement.classList.add("wpl-html")
    document.body.classList.add("wpl-body")

    const mount = () => {
      const root = document.getElementById(rootId)
      if (!root || !window.ScrollCraft || root.dataset.scMounted) return
      root.dataset.scMounted = "1"
      window.ScrollCraft.mount(root)
    }

    let script: HTMLScriptElement | null = null
    if (window.ScrollCraft) {
      mount()
    } else {
      script = document.querySelector<HTMLScriptElement>(`script[src="${ENGINE_SRC}"]`)
      if (!script) {
        script = document.createElement("script")
        script.src = ENGINE_SRC
        script.async = true
        document.body.appendChild(script)
      }
      script.addEventListener("load", mount, { once: true })
    }

    return () => {
      script?.removeEventListener("load", mount)
      document.documentElement.classList.remove("wpl-html")
      document.body.classList.remove("wpl-body")
    }
  }, [rootId])
}
