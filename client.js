window.__ModuleLoader__.load({
  id: 'dsh-mobile-ui',
  factory() {
    const VERSION = '0.1.0'
    const PHONE_QUERY = '(max-width: 900px)'

    const CSS = `
/* Elements exist only for the phone layer; hidden on every wider surface. */
.dsh-m-scrim, .dsh-m-edge, .dsh-m-burger { display: none; }
@media (max-width: 900px) {
  html.dsh-mobile { -webkit-text-size-adjust: 100%; }
  html.dsh-mobile, html.dsh-mobile body {
    height: 100% !important;
    overflow: hidden !important;
    overscroll-behavior-y: contain;
  }
  html.dsh-mobile #root { height: var(--dsh-vvh, 100%); overflow: hidden; }

  /* One full-width column: both sidebars leave the grid and become sheets. */
  html.dsh-mobile [class*="_frame"] {
    grid-template-columns: 0 minmax(0px, 1fr) 0 !important;
  }
  html.dsh-mobile [class*="_centerCol"] { grid-column: 1 / -1 !important; }

  /* Left drawer */
  html.dsh-mobile [class*="_sidebarCol"] {
    position: fixed !important;
    top: 0; bottom: 0; left: 0;
    width: min(86vw, 360px) !important;
    height: 100% !important;
    z-index: 60;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 24px 0 60px rgba(0, 0, 0, 0.55);
    transform: translateX(-105%);
    transition: transform 0.22s cubic-bezier(0.22, 0.8, 0.22, 1);
    pointer-events: none;
  }
  html.dsh-mobile.dsh-drawer [class*="_sidebarCol"] {
    transform: translateX(0);
    pointer-events: auto;
  }

  /* Right panel (opens fullscreen on phones; give it real geometry) */
  html.dsh-mobile [class*="_rightbarCol"] {
    position: fixed !important;
    inset: 0;
    width: 100% !important;
    height: 100% !important;
    z-index: 60;
    background: var(--dsw-alias-bg-base, #141416);
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    transform: translateX(105%);
    transition: transform 0.22s cubic-bezier(0.22, 0.8, 0.22, 1);
    pointer-events: none;
  }
  html.dsh-mobile.dsh-rb [class*="_rightbarCol"] {
    transform: translateX(0);
    pointer-events: auto;
  }
  html.dsh-mobile [data-sidebar-right-panel] {
    width: 100% !important;
    max-width: 100% !important;
    height: 100% !important;
    --dsh-sidebar-width: 100% !important;
  }

  /* Scrim under either sheet */
  html.dsh-mobile .dsh-m-scrim {
    display: block;
    position: fixed; inset: 0;
    z-index: 55;
    background: rgba(0, 0, 0, 0.55);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }
  html.dsh-mobile.dsh-drawer .dsh-m-scrim,
  html.dsh-mobile.dsh-rb .dsh-m-scrim { opacity: 1; pointer-events: auto; }

  /* Left-edge swipe catcher */
  html.dsh-mobile .dsh-m-edge {
    display: block;
    position: fixed; top: 0; bottom: 0; left: 0;
    width: 20px;
    z-index: 45;
    touch-action: pan-y;
  }
  html.dsh-mobile.dsh-drawer .dsh-m-edge,
  html.dsh-mobile.dsh-rb .dsh-m-edge { display: none; }

  /* Menu button that replaces the 56px rail */
  html.dsh-mobile .dsh-m-burger {
    position: fixed;
    z-index: 70;
    left: max(8px, env(safe-area-inset-left));
    top: calc(env(safe-area-inset-top) + 8px);
    width: 40px; height: 40px;
    display: grid; place-items: center;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(26, 26, 29, 0.92);
    color: #f4f4f5;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
    touch-action: manipulation;
  }
  html.dsh-mobile.dsh-drawer .dsh-m-burger,
  html.dsh-mobile.dsh-rb .dsh-m-burger { display: none; }
  html.dsh-mobile [class*="_centerCol"] header { padding-left: 56px !important; }

  /* Touch + reading */
  html.dsh-mobile [contenteditable="true"] {
    font-size: 16px !important;
    line-height: 24px !important;
  }
  html.dsh-mobile button,
  html.dsh-mobile [role="button"] { touch-action: manipulation; }
  html.dsh-mobile [data-composer-seat] button[class*="_primary"] {
    width: 44px !important;
    height: 44px !important;
    min-width: 44px;
    min-height: 44px;
  }
  html.dsh-mobile [class*="_scrollBody"] {
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }
  html.dsh-mobile .wSkVaW_body {
    --dsh-chat-content-width: 100% !important;
    --dsh-composer-card-max-width: 100% !important;
  }
  html.dsh-mobile [class*="_composerSeat"]:not([class*="fixed"]) {
    padding-bottom: env(safe-area-inset-bottom);
  }
  /* Settings is a two-column desktop dialog; stack it into a phone sheet. */
  html.dsh-mobile [class~="VOzbGW_overlay"] {
    padding: 0 !important;
    align-items: stretch !important;
    justify-content: stretch !important;
  }
  html.dsh-mobile [class~="VOzbGW_panel"] {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
    border-radius: 0 !important;
    flex-direction: column !important;
  }
  html.dsh-mobile [class~="VOzbGW_nav"] {
    width: 100% !important;
    flex: 0 0 auto !important;
    padding: max(14px, env(safe-area-inset-top)) 16px 0 !important;
    gap: 10px !important;
  }
  html.dsh-mobile [class~="VOzbGW_navList"] {
    width: 100% !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    overflow: visible !important;
    gap: 4px !important;
    padding-bottom: 6px !important;
  }
  html.dsh-mobile [class~="VOzbGW_navCell"] {
    width: auto !important;
    flex: 0 0 auto !important;
    white-space: nowrap !important;
  }
  html.dsh-mobile [class~="VOzbGW_content"] {
    width: 100% !important;
    flex: 1 1 auto !important;
    min-height: 0 !important;
  }
  html.dsh-mobile [class~="VOzbGW_options"] {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow-y: auto !important;
  }
}
`

    function apply(ctx) {
      if (typeof document === 'undefined') return
      ctx.effect(() => install(), 'dsh-mobile: phone layer')
    }

    function install() {
      const html = document.documentElement
      const body = document.body
      html.classList.add('dsh-mobile')
      html.dataset.dshMobile = VERSION

      const style = document.createElement('style')
      style.id = 'dsh-mobile-style'
      style.dataset.version = VERSION
      style.textContent = CSS
      document.head.appendChild(style)

      const viewportMeta = document.querySelector('meta[name="viewport"]')
      const originalViewport = viewportMeta === null ? null : viewportMeta.getAttribute('content')
      if (viewportMeta !== null) {
        let content = originalViewport || 'width=device-width, initial-scale=1'
        if (viewportMeta === null) content = ''
        if (!/viewport-fit/u.test(content)) content += ', viewport-fit=cover'
        if (!/interactive-widget/u.test(content)) content += ', interactive-widget=resizes-content'
        viewportMeta.setAttribute('content', content)
      }

      const scrim = document.createElement('div')
      scrim.className = 'dsh-m-scrim'
      scrim.setAttribute('aria-hidden', 'true')

      const edge = document.createElement('div')
      edge.className = 'dsh-m-edge'
      edge.setAttribute('aria-hidden', 'true')

      const burger = document.createElement('button')
      burger.type = 'button'
      burger.className = 'dsh-m-burger'
      burger.setAttribute('aria-label', 'Open menu')
      burger.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'

      body.appendChild(scrim)
      body.appendChild(edge)
      body.appendChild(burger)

      const phone = () => window.matchMedia(PHONE_QUERY).matches
      const sideCol = () => document.querySelector('[class*="_sidebarCol"]')
      const rightCol = () => document.querySelector('[class*="_rightbarCol"]')
      const drawerOpen = () => {
        const col = sideCol()
        return col !== null && col.querySelector('[class*="_collapsed"]') === null
      }
      const rightOpen = () => document.querySelector('[data-sidebar-right-open="true"]') !== null
      const toggleSidebar = () => {
        const col = sideCol()
        if (col === null) return
        const button = col.querySelector('button[aria-label="Open sidebar"]')
          || col.querySelector('button[aria-label="Collapse sidebar"]')
          || col.querySelector('button[aria-label="Close sidebar"]')
        if (button !== null) button.click()
      }
      const closeRight = () => {
        const button = document.querySelector('button[aria-label="Collapse right sidebar"]')
        if (button !== null) button.click()
      }
      const sendButton = (editor) => {
        const seat = editor.closest('[data-composer-seat]')
        const local = seat === null ? null : seat.querySelector('button[aria-label="Send message"]')
        return local || document.querySelector('button[aria-label="Send message"]')
      }
      const sendable = (button) => button !== null
        && button.disabled !== true
        && button.getAttribute('aria-disabled') !== 'true'

      let syncTimer = 0
      let lastSession = null
      const applyState = () => {
        if (!phone()) {
          html.classList.remove('dsh-drawer', 'dsh-rb')
          return
        }
        const sessionEl = document.querySelector('[data-conversation-session]')
        const sessionId = sessionEl === null ? null : sessionEl.getAttribute('data-conversation-session')
        if (drawerOpen() && lastSession !== null && sessionId !== null && sessionId !== lastSession) {
          // Picking a session (or New Session) from the drawer should land on it.
          toggleSidebar()
        }
        if (sessionId !== null) lastSession = sessionId
        html.classList.toggle('dsh-drawer', drawerOpen())
        html.classList.toggle('dsh-rb', rightOpen())
        for (const editor of document.querySelectorAll('[contenteditable="true"]')) {
          if (editor.getAttribute('enterkeyhint') !== 'send') editor.setAttribute('enterkeyhint', 'send')
        }
      }
      const sync = () => {
        window.clearTimeout(syncTimer)
        syncTimer = window.setTimeout(applyState, 60)
      }

      const observer = new MutationObserver(sync)
      observer.observe(body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'aria-label', 'data-sidebar-right-open', 'data-conversation-session'],
      })
      window.addEventListener('resize', sync)

      // Drawer / right panel entry points.
      burger.addEventListener('click', () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        toggleSidebar()
      })
      scrim.addEventListener('click', () => {
        if (rightOpen()) closeRight()
        else if (drawerOpen()) toggleSidebar()
      })

      // Edge swipe right opens the drawer; swipe left inside it closes it.
      let drag = null
      const edgeDown = (event) => {
        if (!phone() || drawerOpen() || rightOpen()) return
        drag = { x: event.clientX, y: event.clientY }
        if (event.pointerId !== undefined) {
          try { edge.setPointerCapture(event.pointerId) } catch { /* not capturable */ }
        }
      }
      const edgeMove = (event) => {
        if (drag === null) return
        const dx = event.clientX - drag.x
        const dy = event.clientY - drag.y
        if (dx > 46 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          drag = null
          toggleSidebar()
        }
      }
      const edgeEnd = () => { drag = null }
      edge.addEventListener('pointerdown', edgeDown)
      edge.addEventListener('pointermove', edgeMove)
      edge.addEventListener('pointerup', edgeEnd)
      edge.addEventListener('pointercancel', edgeEnd)

      let sheetDrag = null
      const sheetDown = (event) => {
        const target = event.target
        if (!(target instanceof Element) || !phone()) return
        if (target.closest('[class*="_sidebarCol"]') !== null) sheetDrag = { kind: 'left', x: event.clientX, y: event.clientY }
        else if (target.closest('[class*="_rightbarCol"]') !== null) sheetDrag = { kind: 'right', x: event.clientX, y: event.clientY }
      }
      const sheetMove = (event) => {
        if (sheetDrag === null) return
        const dx = event.clientX - sheetDrag.x
        const dy = event.clientY - sheetDrag.y
        if (sheetDrag.kind === 'left' && dx < -50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          sheetDrag = null
          toggleSidebar()
        } else if (sheetDrag.kind === 'right' && dx > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          sheetDrag = null
          closeRight()
        }
      }
      const sheetEnd = () => { sheetDrag = null }
      document.addEventListener('pointerdown', sheetDown, true)
      document.addEventListener('pointermove', sheetMove, true)
      document.addEventListener('pointerup', sheetEnd, true)
      document.addEventListener('pointercancel', sheetEnd, true)

      // Enter sends on the phone; Shift+Enter still inserts a newline.
      let allowBreak = false
      let breakTimer = 0
      const keyGuard = (event) => {
        if (!phone()) return
        if (event.key === 'Enter' && event.shiftKey) {
          allowBreak = true
          window.clearTimeout(breakTimer)
          breakTimer = window.setTimeout(() => { allowBreak = false }, 400)
          return
        }
        if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) return
        if (event.isComposing || event.keyCode === 229) return
        const target = event.target
        if (!(target instanceof Element)) return
        const editor = target.closest('[contenteditable="true"]')
        if (editor === null) return
        const text = (editor.textContent || '').trim()
        if (text.length === 0) return
        const button = sendButton(editor)
        if (!sendable(button)) return
        event.preventDefault()
        event.stopPropagation()
        button.click()
      }
      const beforeGuard = (event) => {
        if (!phone() || event.isComposing) return
        if (event.inputType !== 'insertLineBreak' && event.inputType !== 'insertParagraph') return
        const target = event.target
        if (!(target instanceof Element)) return
        const editor = target.closest('[contenteditable="true"]')
        if (editor === null) return
        if (allowBreak) {
          allowBreak = false
          return
        }
        const text = (editor.textContent || '').trim()
        if (text.length === 0) return
        const button = sendButton(editor)
        if (!sendable(button)) return
        event.preventDefault()
        button.click()
      }
      document.addEventListener('keydown', keyGuard, true)
      document.addEventListener('beforeinput', beforeGuard, true)

      // The on-screen keyboard shrinks the visual viewport, not the layout viewport.
      const viewport = window.visualViewport
      const fitViewport = () => {
        if (viewport === null || viewport === undefined) return
        if (!phone()) {
          html.style.removeProperty('--dsh-vvh')
          html.classList.remove('dsh-kb')
          return
        }
        const scale = viewport.scale || 1
        if (Math.abs(scale - 1) > 0.02) return
        const height = Math.max(120, Math.round(viewport.height))
        html.style.setProperty('--dsh-vvh', height + 'px')
        const keyboardOpen = Math.round(window.innerHeight - viewport.height) > 120
        html.classList.toggle('dsh-kb', keyboardOpen)
        if (keyboardOpen) window.scrollTo(0, 0)
      }
      if (viewport !== null && viewport !== undefined) {
        viewport.addEventListener('resize', fitViewport)
        viewport.addEventListener('scroll', fitViewport)
      }

      applyState()
      fitViewport()
      sync()

      // Fail loudly, not silently, on a DSH build whose DOM this layer does not know.
      let warned = false
      const checkCompat = () => {
        if (warned) return
        if (document.querySelector('[class*="_frame"]') !== null
          && document.querySelector('[contenteditable="true"]') !== null) return
        warned = true
        console.warn('[dsh-mobile-ui] expected DSH layout not found (built against DSH 0.2.1-rc.5). '
          + 'The phone layer stays inactive; see README section Compatibility.')
      }
      const compatTimers = [window.setTimeout(checkCompat, 3000), window.setTimeout(checkCompat, 8000)]

      window.__dshMobile = { version: VERSION, drawerOpen, rightOpen, phone }
      window.__dshMobileUI = window.__dshMobile

      return () => {
        window.clearTimeout(syncTimer)
        window.clearTimeout(breakTimer)
        for (const timer of compatTimers) window.clearTimeout(timer)
        observer.disconnect()
        window.removeEventListener('resize', sync)
        if (viewport !== null && viewport !== undefined) {
          viewport.removeEventListener('resize', fitViewport)
          viewport.removeEventListener('scroll', fitViewport)
        }
        document.removeEventListener('pointerdown', sheetDown, true)
        document.removeEventListener('pointermove', sheetMove, true)
        document.removeEventListener('pointerup', sheetEnd, true)
        document.removeEventListener('pointercancel', sheetEnd, true)
        document.removeEventListener('keydown', keyGuard, true)
        document.removeEventListener('beforeinput', beforeGuard, true)
        burger.remove()
        scrim.remove()
        edge.remove()
        style.remove()
        html.classList.remove('dsh-mobile', 'dsh-drawer', 'dsh-rb', 'dsh-kb')
        html.style.removeProperty('--dsh-vvh')
        delete html.dataset.dshMobile
        delete window.__dshMobile
        delete window.__dshMobileUI
        if (viewportMeta !== null && originalViewport !== null) viewportMeta.setAttribute('content', originalViewport)
      }
    }

    return { inject: [], apply }
  },
})
