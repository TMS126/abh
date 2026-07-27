"use client"

import { useCallback, useEffect, useRef } from "react"
import { ProjectData } from "@/lib/data"

export function useGalleryBackStack(
  selectedProject: ProjectData | null,
  setSelectedProject: (p: ProjectData | null) => void,
  zoomIndex: number | null,
  setZoomIndex: (i: number | null) => void,
) {
  const projectPushed = useRef(false)
  const zoomPushed = useRef(false)

  // Pushes a history entry when a project is freshly selected. Checks the
  // ACTUAL URL (not just component state) before pushing — if the URL
  // already carries this project's id, we're hydrating from an existing
  // history entry (deep link, or landing back here via the browser's own
  // back/forward button after a remount), not a brand-new selection. In
  // that case we just mark it as "already accounted for" instead of
  // pushing a duplicate entry, which is what was previously causing the
  // stack to grow every time someone navigated away and came back.
  useEffect(() => {
    if (!selectedProject) return
    if (projectPushed.current) return

    const current = new URLSearchParams(window.location.search).get("project")
    if (current === selectedProject.id) {
      projectPushed.current = true
      return
    }

    window.history.pushState(
      { abModal: "project" },
      "",
      `${window.location.pathname}?project=${selectedProject.id}`
    )
    projectPushed.current = true
  }, [selectedProject])

  useEffect(() => {
    if (zoomIndex !== null && !zoomPushed.current) {
      window.history.pushState({ abModal: "zoom" }, "")
      zoomPushed.current = true
    }
  }, [zoomIndex])

  useEffect(() => {
    const onPop = () => {
      if (zoomIndex !== null) {
        zoomPushed.current = false
        setZoomIndex(null)
        return
      }
      if (selectedProject) {
        projectPushed.current = false
        setSelectedProject(null)
        return
      }
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [zoomIndex, selectedProject, setZoomIndex, setSelectedProject])

  const closeZoom = useCallback(() => {
    if (zoomPushed.current) {
      zoomPushed.current = false
      window.history.back()
    } else {
      setZoomIndex(null)
    }
  }, [setZoomIndex])

  const closeProject = useCallback(() => {
    if (zoomIndex !== null) {
      if (zoomPushed.current) {
        zoomPushed.current = false
        window.history.back()
      } else {
        setZoomIndex(null)
      }
      return
    }
    if (projectPushed.current) {
      projectPushed.current = false
      window.history.back()
    } else {
      setSelectedProject(null)
    }
  }, [zoomIndex, setZoomIndex, setSelectedProject])

  return { closeProject, closeZoom }
} 
