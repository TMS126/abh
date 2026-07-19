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

  useEffect(() => {
    if (selectedProject && !projectPushed.current) {
      window.history.pushState({ abModal: "project" }, "")
      projectPushed.current = true
    }
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
