# Install with an AI agent

Copy the block below into your coding agent (Claude Code, Codex, DSH, …).
Replace `<REPO>` with the repository URL or a local path to a checkout of
`dsh-mobile-ui`. The agent should not need anything else.

```text
Install the dsh-mobile-ui plugin into my DeepSeek Harness web GUI.

Repo/source: <REPO>

Steps:
1. Read the repo README and INSTALL_AGENT.md first. This is a DSH client bundle
   (package.json declares dsh.bundle.patch and dsh.client); it has no build step.
2. Find my DSH profile: default is "$DSH_HOME/profiles/web", DSH_HOME defaults to
   ~/.dsh. Confirm the profile's package.json lists a web app bundle (for example
   @deepseek-ai/dsh-web-app).
3. Install the bundle with the official path:
     dsh plugin --profile web add <REPO>
   If that command refuses or the DSH version is too old, fall back to a manual
   install: add "dsh-mobile-ui": "link:<abs path to checkout>" to the profile's
   dependencies, add "dsh-mobile-ui" to dsh.profile.bundles, then run
   `pnpm install --offline` in the profile directory.
4. Confirm dsh-mobile-ui is installed, enabled and present in the running
   composition (the profile package.json bundles list, and the web page's
   window.__DSH_BOOT__.entries contains a row whose id is "dsh-mobile-ui").
5. Reload the web UI at a phone-sized viewport (390x844). Verify:
   - window.__dshMobileUI.version is "0.1.0"
   - one 40x40 menu button at the top left, no 56px rail
   - the menu button opens the sidebar as an overlay drawer; tapping the scrim closes it
   - the conversation column is the full 390px wide
   - the composer is above the visible bottom edge
   - Settings opens as a full-width sheet with wrapping tabs
6. Run the repo's verification if Python + Playwright + Chromium are available:
     DSH_WEB_URL=<token URL> python3 test_phone.py
   It aborts every session/prompt request, so it never sends a real message.
   On a Linux desktop without a virtual display, use `xvfb-run -a python3 test_phone.py`.

Constraints:
- Never print or log the launch token in the URL.
- Do not send any chat message, do not modify sessions, do not delete anything.
- If the plugin does not load, show me the exact error and stop; do not rewrite
  the profile by hand unless the CLI install path failed.
- Tell me how to uninstall: `dsh plugin --profile web remove dsh-mobile-ui`, or
  remove the bundle from dsh.profile.bundles and the dependency, then restart.
```

## What the agent should expect

- Install is additive: one package, one bundle entry, no changes to existing
  plugins, sessions or credentials.
- DSH hot-reloads bundle composition on many installs; a page reload is enough.
  If the layer is still absent after a reload, restart the `dsh web` process the
  same way it was started.
- The plugin is inert at 900px and wider; it cannot affect the desktop window.
