      // Vertically centred inside the navbar, just slightly below midpoint so it
      // clears the logo and nav pills. top-[74px] places it just below the nav.
      return (
        <div
          ref={pillRef}
          className={cn(
            "fixed left-1/2 -translate-x-1/2 z-[10000] transition-all duration-300",
            // aligned with navbar center so it doesn't overlap
            "top-[calc(var(--nav-h,74px)-22px)]",
            visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
          )}
        >
          {/* ── Closed: icon-only button with cycling colour ── */}
          {!open && (
            <button
              onClick={openSearch}
              aria-label="Search services"
              className="w-11 h-11 rounded-full flex items-center justify-center bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.14)] transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <MagnifyingGlass
                size={22}
                weight="bold"
                style={{ color: CYCLE_COLORS[colorIdx], transition: "color 0.7s ease" }}
              />
            </button>
          )}

          {/* ── Open: expanded search input ── */}
          {open && (
            <div className="flex items-center gap-2 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.18)] rounded-[18px] px-4 py-2.5 w-[min(86vw,360px)]">
              <MagnifyingGlass size={16} weight="bold" className="shrink-0 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={query ? "" : "Search"}
                className={"flex-1 bg-transparent text-sm font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none min-w-0 " + (query ? 'text-left' : 'text-center placeholder:opacity-60')}
              />
              {query && (
                <button onClick={() => setQuery("")} className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 shrink-0">
                  <X size={11} weight="bold" />
                </button>
              )}
              <button onClick={closeSearch} className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 shrink-0">
                <X size={14} weight="bold" />
              </button>
            </div>
          )}

