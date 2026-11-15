#!/usr/bin/env python3
"""Verify the dsh-mobile phone layer against the live DSH web UI."""
import json
import os
import re
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

def resolve_url():
    """Newest launch-token URL: DSH_WEB_URL, else $DSH_HOME/web.log, else web_url."""
    env = os.environ.get("DSH_WEB_URL")
    loopback = bool(env) and bool(re.match(r"https?://(127\.0\.0\.1|localhost|\[::1\])(?::\d+)?/?$", env.strip()))
    if env and not loopback:
        return env.strip()
    home = Path(os.environ.get("DSH_HOME", str(Path.home() / ".dsh"))).expanduser()
    log = home / "web.log"
    if log.exists():
        found = re.findall(r"https?://[^\s\"'<>]+\?token=[A-Za-z0-9_-]+", log.read_text(errors="replace"))
        if found:
            return found[-1]
    cached = home / "web_url"
    if cached.exists():
        return cached.read_text().strip()
    if env:
        return env.strip()
    raise SystemExit("dsh-mobile-ui test: set DSH_WEB_URL to the DSH web UI URL")

url = resolve_url()
OUT = Path(os.environ.get("DSH_MOBILE_OUT", "/tmp/dsh-mobile-ui-out")); OUT.mkdir(parents=True, exist_ok=True)

BOOT = r"""() => {
  const boot = window.__DSH_BOOT__;
  return {
    entries: (boot?.entries ?? []).map(e => e.id),
    mobileEntry: (boot?.entries ?? []).some(e => e.id === 'dsh-mobile-ui'),
    reachable: typeof window.__dshMobile !== 'undefined',
    version: window.__dshMobile?.version ?? null,
    htmlClass: document.documentElement.className,
    hasStyle: !!document.getElementById('dsh-mobile-style'),
    viewportMeta: document.querySelector('meta[name="viewport"]')?.getAttribute('content') ?? null,
  };
}"""

LAYOUT = r"""() => {
  const q = s => document.querySelector(s);
  const box = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
  const cs = el => el ? getComputedStyle(el) : null;
  const frame = q('[class*="_frame"]');
  const side = q('[class*="_sidebarCol"]');
  const right = q('[class*="_rightbarCol"]');
  const center = q('[class*="_centerCol"]');
  const burger = q('.dsh-m-burger');
  const scrim = q('.dsh-m-scrim');
  const editor = q('[contenteditable="true"]');
  const send = q('button[aria-label="Send message"]');
  const root = document.getElementById('root');
  return {
    inner: [innerWidth, innerHeight],
    frameCols: frame ? cs(frame).gridTemplateColumns : null,
    frameRect: box(frame), sideRect: box(side), centerRect: box(center), rightRect: box(right),
    sideTransform: side ? cs(side).transform : null,
    sideVisible: side ? cs(side).visibility : null,
    rightTransform: right ? cs(right).transform : null,
    drawer: document.documentElement.classList.contains('dsh-drawer'),
    rb: document.documentElement.classList.contains('dsh-rb'),
    burger: burger ? { box: box(burger), display: cs(burger).display } : null,
    scrim: scrim ? { box: box(scrim), opacity: cs(scrim).opacity, pe: cs(scrim).pointerEvents } : null,
    edge: (() => { const e = q('.dsh-m-edge'); return e ? { display: cs(e).display, box: box(e) } : null; })(),
    editor: editor ? { font: cs(editor).fontSize, hint: editor.getAttribute('enterkeyhint'), box: box(editor) } : null,
    send: send ? { box: box(send), disabled: send.disabled, ariaDisabled: send.getAttribute('aria-disabled') } : null,
    rootH: root ? Math.round(root.getBoundingClientRect().height) : null,
    vvh: getComputedStyle(document.documentElement).getPropertyValue('--dsh-vvh').trim(),
    overflow: { html: cs(document.documentElement).overflow, body: cs(document.body).overflow },
    composerBottom: (() => { const s = q('[data-composer-seat]'); return s ? Math.round(s.getBoundingClientRect().bottom) : null; })(),
  };
}"""

results = []
def check(name, ok, detail):
    results.append((name, bool(ok), detail))
    print(("PASS " if ok else "FAIL ") + name + "  " + json.dumps(detail)[:400])

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path="/usr/bin/chromium",
                                    args=["--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars"])
        ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=3,
                                  is_mobile=True, has_touch=True,
                                  user_agent="Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36")
        page = ctx.new_page()
        console = []
        page.on("console", lambda m: console.append((m.type, m.text[:200])))
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(5000)

        boot = page.evaluate(BOOT)
        check("boot entry dsh-mobile-ui", boot["mobileEntry"], {"entries": len(boot["entries"])})
        check("client plugin executed", boot["reachable"], {"version": boot["version"], "html": boot["htmlClass"]})
        check("style injected", boot["hasStyle"], {"style": boot["hasStyle"]})
        check("viewport meta extended", "viewport-fit=cover" in (boot["viewportMeta"] or ""), {"meta": boot["viewportMeta"]})

        L = page.evaluate(LAYOUT)
        check("single full-width column", L["frameCols"] in ("0px 390px 0px", "0px 389.984px 0px"), {"cols": L["frameCols"]})
        check("center uses full width", L["centerRect"] and L["centerRect"][2] >= 389, {"center": L["centerRect"]})
        check("rail hidden off-canvas", L["sideRect"] and L["sideRect"][0] < 0, {"side": L["sideRect"], "transform": L["sideTransform"]})
        check("menu button visible", L["burger"] and L["burger"]["display"] != "none" and L["burger"]["box"][2] == 40, L["burger"])
        check("scrim inert when closed", L["scrim"] and L["scrim"]["pe"] == "none", L["scrim"])
        check("editor 16px + enterkeyhint=send", L["editor"] and L["editor"]["font"] == "16px" and L["editor"]["hint"] == "send", L["editor"])
        check("send button 44px", L["send"] and L["send"]["box"][2] == 44 and L["send"]["box"][3] == 44, L["send"])
        check("root height = viewport", L["rootH"] == 844, {"rootH": L["rootH"], "vvh": L["vvh"]})
        page.screenshot(path=str(OUT / "v1_welcome.png"))

        # drawer via menu button
        page.locator(".dsh-m-burger").click()
        page.wait_for_timeout(600)
        D = page.evaluate(LAYOUT)
        check("drawer open class", D["drawer"], {"drawer": D["drawer"]})
        check("drawer slides in", D["sideRect"] and D["sideRect"][0] >= -1 and D["sideRect"][2] >= 300, {"side": D["sideRect"]})
        check("center still full width under drawer", D["centerRect"] and D["centerRect"][2] >= 389, {"center": D["centerRect"]})
        check("scrim active", D["scrim"] and D["scrim"]["pe"] == "auto" and float(D["scrim"]["opacity"] or 0) > 0.5, D["scrim"])
        page.screenshot(path=str(OUT / "v2_drawer.png"))

        # close via scrim click
        page.locator(".dsh-m-scrim").click(position={"x": 370, "y": 700})
        page.wait_for_timeout(600)
        D2 = page.evaluate(LAYOUT)
        check("scrim click closes drawer", not D2["drawer"] and D2["sideRect"][0] < 0, {"drawer": D2["drawer"], "side": D2["sideRect"]})

        # edge swipe opens drawer
        page.mouse.move(4, 420)
        page.mouse.down()
        for x in (30, 60, 90, 120):
            page.mouse.move(x, 420, steps=2)
        page.mouse.up()
        page.wait_for_timeout(700)
        D3 = page.evaluate(LAYOUT)
        check("edge swipe opens drawer", D3["drawer"], {"drawer": D3["drawer"]})
        # close by swiping left on the drawer
        page.mouse.move(300, 500)
        page.mouse.down()
        for x in (250, 200, 150):
            page.mouse.move(x, 500, steps=2)
        page.mouse.up()
        page.wait_for_timeout(700)
        D4 = page.evaluate(LAYOUT)
        check("swipe left closes drawer", not D4["drawer"], {"drawer": D4["drawer"]})

        # right panel fullscreen
        try:
            page.get_by_label("Open right sidebar").click(timeout=4000)
            page.wait_for_timeout(800)
        except Exception as err:
            print("open right sidebar failed:", str(err)[:200])
        R = page.evaluate(LAYOUT)
        check("right panel opening class", R["rb"], {"rb": R["rb"]})
        check("right panel fullscreen geometry", R["rightRect"] and R["rightRect"][2] >= 389 and R["rightRect"][0] == 0, {"right": R["rightRect"]})
        page.screenshot(path=str(OUT / "v3_rightpanel.png"))
        try:
            page.get_by_label("Collapse right sidebar").first.click(timeout=3000)
            page.wait_for_timeout(700)
        except Exception as err:
            print("close right failed:", str(err)[:160])
        R2 = page.evaluate(LAYOUT)
        check("right panel closes", not R2["rb"], {"rb": R2["rb"]})

        # Enter sends exactly once (prompt POST blocked), Shift+Enter newline
        blocked = []
        def handler(route):
            r = route.request
            if r.method == "POST" and "session/prompt" in r.url:
                blocked.append(r.url.split("?")[0]); route.abort()
            else:
                route.continue_()
        page.route("**/api/**", handler)
        ed = page.locator('[contenteditable="true"]').first
        ed.click()
        page.keyboard.type("enter check")
        page.wait_for_timeout(200)
        page.keyboard.press("Enter")
        page.wait_for_timeout(1200)
        check("Enter sends once", len(blocked) == 1, {"prompts": len(blocked)})
        ed.click(); page.keyboard.press("Control+A"); page.keyboard.press("Backspace")
        page.keyboard.type("line one"); page.keyboard.press("Shift+Enter"); page.keyboard.type("line two")
        page.wait_for_timeout(400)
        html = page.evaluate("() => document.querySelector('[contenteditable=\"true\"]').innerHTML")
        check("Shift+Enter still newline", "<br>" in html and len(blocked) == 1, {"html": html[:120], "prompts": len(blocked)})
        ed.click(); page.keyboard.press("Control+A"); page.keyboard.press("Backspace")
        page.unroute("**/api/**")

        # keyboard-ish shrink: simulate a shorter visible viewport
        page.set_viewport_size({"width": 390, "height": 520})
        page.wait_for_timeout(800)
        K = page.evaluate(LAYOUT)
        check("layout follows visible viewport", K["rootH"] == 520 and K["vvh"] == "520px", {"rootH": K["rootH"], "vvh": K["vvh"], "inner": K["inner"]})
        check("composer stays above the fold", K["composerBottom"] is None or K["composerBottom"] <= 521, {"composerBottom": K["composerBottom"]})
        page.screenshot(path=str(OUT / "v4_keyboard.png"))
        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(600)

        # conversation view at phone size (drawer should close itself after picking a session)
        page.locator(".dsh-m-burger").click()
        page.wait_for_timeout(500)
        scrollable = page.evaluate(r"""() => {
          const el = document.elementsFromPoint(200, 700).find(e => {
            const cs = getComputedStyle(e); return /auto|scroll/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 20;
          });
          if (!el) return {found: false};
          const before = el.scrollTop; el.scrollTop = before + 240;
          return {found: true, before, after: el.scrollTop, cls: el.className};
        }""")
        check("drawer session list scrolls", scrollable.get("found") and scrollable.get("after", 0) > scrollable.get("before", 0), scrollable)
        opened = False
        try:
            page.get_by_text("HARNESS OK test", exact=False).first.click(timeout=4000)
            opened = True
        except Exception as err:
            print("open session failed:", str(err)[:160])
        page.wait_for_timeout(3500)
        page.screenshot(path=str(OUT / "v5_conversation.png"))
        C = page.evaluate(LAYOUT)
        check("conversation opens", opened, {"opened": opened})
        check("drawer closes after opening a session", not C["drawer"], {"drawer": C["drawer"]})
        check("conversation full width", C["centerRect"] and C["centerRect"][2] >= 389, {"center": C["centerRect"]})
        check("conversation editor 16px", C["editor"] and C["editor"]["font"] == "16px", C["editor"])

        # New Session from the drawer lands on the hero with the drawer closed
        page.locator(".dsh-m-burger").click()
        page.wait_for_timeout(500)
        try:
            page.get_by_text("New Session", exact=True).first.click(timeout=3000)
        except Exception as err:
            print("new session click failed:", str(err)[:160])
        page.wait_for_timeout(1800)
        N = page.evaluate(LAYOUT)
        check("drawer closes after New Session", not N["drawer"], {"drawer": N["drawer"]})
        page.screenshot(path=str(OUT / "v6_new_session.png"))

        # Attribute-only session switch (no class/aria change) must also close the drawer
        page.locator(".dsh-m-burger").click()
        page.wait_for_timeout(500)
        before_drawer = page.evaluate("() => document.documentElement.classList.contains('dsh-drawer')")
        page.evaluate(r"""() => {
          const el = document.querySelector('[data-conversation-session]');
          if (el) el.setAttribute('data-conversation-session', 'session-phone-attr-probe');
        }""")
        page.wait_for_timeout(800)
        after_drawer = page.evaluate("() => document.documentElement.classList.contains('dsh-drawer')")
        check("attribute-only session switch closes drawer", before_drawer and not after_drawer, {"before": before_drawer, "after": after_drawer})

        # Settings dialog: stacks into a full-width phone sheet
        page.locator(".dsh-m-burger").click()
        page.wait_for_timeout(500)
        try:
            page.get_by_label("Account menu").click(timeout=3000)
            page.wait_for_timeout(600)
            page.get_by_text("Settings", exact=True).first.click(timeout=3000)
            page.wait_for_timeout(1200)
        except Exception as err:
            print("settings open failed:", str(err)[:160])
        S = page.evaluate(r"""() => {
          const q = s => document.querySelector(s);
          const box = el => { if (!el) return null; const r = el.getBoundingClientRect();
            return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
          const nav = [...document.querySelectorAll('[class~="VOzbGW_navCell"]')];
          const panel = q('[class~="VOzbGW_panel"]');
          const content = q('[class~="VOzbGW_content"]');
          return {panel: box(panel), content: box(content), cells: nav.length,
            cellRects: nav.map(e => box(e)),
            allInside: nav.every(e => { const r = e.getBoundingClientRect(); return r.left >= -1 && r.right <= 391; }),
            cellTexts: nav.map(e => (e.textContent || '').trim()).slice(0, 6)};
        }""")
        check("settings sheet is full width", S["panel"] and S["panel"][2] == 390 and S["content"] and S["content"][2] == 390, S)
        check("settings tabs stay readable", S["cells"] >= 3 and len(S["cellTexts"]) >= 3, {"cells": S["cells"], "texts": S["cellTexts"]})
        check("all settings tabs on screen", S.get("allInside") and S["cells"] == 4, {"cells": S["cells"], "rects": S.get("cellRects")})
        page.screenshot(path=str(OUT / "v7_settings.png"))
        try:
            page.locator('[class~="VOzbGW_close"]').click(timeout=2500)
        except Exception:
            pass
        page.wait_for_timeout(600)

        fails = [r for r in results if not r[1]]
        print("\nSUMMARY", len(results) - len(fails), "pass /", len(fails), "fail")
        Path(OUT / "verify_result.json").write_text(json.dumps(
            {"results": results, "console": console[-30:], "boot": boot}, indent=1))
        browser.close()
        return 1 if fails else 0

if __name__ == "__main__":
    sys.exit(main())
