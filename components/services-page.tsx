// Animated gradient SVG icon
export function GradientSearchIcon({ stuck, size = 18 }: { stuck: boolean; size?: number }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 18 18" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {stuck && (
        <defs>
          <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E6FA8">
              <animate attributeName="stop-color"
                values="#1E6FA8;#6FBF1A;#F4A261;#1E6FA8"
                dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#6FBF1A">
              <animate attributeName="stop-color"
                values="#6FBF1A;#F4A261;#1E6FA8;#6FBF1A"
                dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#F4A261">
              <animate attributeName="stop-color"
                values="#F4A261;#1E6FA8;#6FBF1A;#F4A261"
                dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
      )}
      <circle
        cx="7.5" cy="7.5" r="5"
        stroke={stuck ? "url(#sg)" : "currentColor"}
        strokeWidth="2" strokeLinecap="round"
      />
      <line
        x1="11.5" y1="11.5" x2="16" y2="16"
        stroke={stuck ? "url(#sg)" : "currentColor"}
        strokeWidth="2" strokeLinecap="round"
      />
    </svg>
  )
}

export function ServiceSearchBar({
  onSelect,
  stuck,
  collapsed,
  onExpandRequest,
}: {
  onSelect: (svc: SelectedService) => void
  stuck: boolean
  collapsed: boolean
  onExpandRequest: () => void
}) {
  const { resolvedTheme } = useTheme()
  const isDark     = resolvedTheme === "dark"
  const [query,    setQuery]    = useState("")
  const [focused,  setFocused]  = useState(false)
  const [expanded, setExpanded] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)

  const handleIconClick = () => {
    setExpanded(true)
    onExpandRequest()
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false)
        if (stuck) setExpanded(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setFocused(false); if (stuck) setExpanded(false) }
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [stuck])

  const index = useMemo<SearchableService[]>(() => {
    const all: SearchableService[] = []
    HUB_ORDER.forEach((hubId) => {
      HUBS[hubId].sections.forEach((section) => {
        section.items.forEach((item) => {
          all.push({
            hubId, sectionTitle: section.title, name: item.name,
            price: item.price, description: item.description,
            requirements: item.requirements,
          })
        })
      })
    })
    return all
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return index
      .filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      .slice(0, 8)
  }, [query, index])

  const pick = (s: SearchableService) => {
    onSelect({
      name: s.name, price: s.price, hubId: s.hubId,
      sectionTitle: s.sectionTitle, requirements: s.requirements, desc: s.description,
    })
    setQuery("")
    setFocused(false)
    setExpanded(false)
  }

  const showDropdown = focused && query.trim().length > 0

  // ── Collapsed icon-only (mobile + stuck) ──
  if (stuck && collapsed && !expanded) {
    return (
      <div className="flex justify-center">
        <button
          onClick={handleIconClick}
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-md transition-all active:scale-95 hover:scale-105"
          aria-label="Search services"
        >
          <GradientSearchIcon stuck={true} size={22} />
        </button>
      </div>
    )
  }

  // ── Full search bar ──
  return (
    <div ref={wrapperRef} className="relative flex justify-center w-full">
      <div
        className={cn(
          "relative transition-all duration-300",
          !stuck && "w-[85%] md:w-1/2",
          stuck && !expanded && "w-[85%] md:w-1/2",
          stuck && expanded && "w-full md:w-1/2",
        )}
      >
        {/* Icon inside input — bigger, no duplicate outside */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-zinc-400 dark:text-zinc-500">
          <GradientSearchIcon stuck={stuck} size={22} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search service"
          className={cn(
            "w-full pl-11 pr-9 py-3 rounded-[14px] text-sm font-medium outline-none transition-all duration-300",
            "bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400",
            stuck
              ? "border border-zinc-200 dark:border-zinc-700 shadow-lg focus:border-brand-blue"
              : "border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)] focus:border-brand-blue"
          )}
        />

        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600"
          >
            <X size={11} weight="bold" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full mt-2 bg-white dark:bg-zinc-950 rounded-[14px] border border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-150"
          style={{ width: "min(100%, 480px)", left: "50%", transform: "translateX(-50%)" }}
        >
          {results.length > 0 ? (
            <div className="max-h-[320px] overflow-y-auto p-2">
              {results.map((s, idx) => {
                const colors = HUB_COLORS[s.hubId as HubKey]
                const accent = isDark ? colors.tagTextDark : colors.tagText
                return (
                  <button
                    key={`${s.hubId}-${s.name}-${idx}`}
                    onClick={() => pick(s)}
                    className="w-full flex items-center gap-3 p-3 rounded-[10px] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left"
                  >
                    <div
                      className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${accent}15`, color: accent }}
                    >
                      <HubIcon id={s.hubId} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate">{s.name}</p>
                      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 truncate">
                        {s.sectionTitle} · {HUBS[s.hubId].title}
                      </p>
                    </div>
                    <span className="text-xs font-black flex-shrink-0" style={{ color: accent }}>{s.price}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-5 text-center">
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">No services found</p>
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-1">
                Try a different word or WhatsApp us directly.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
