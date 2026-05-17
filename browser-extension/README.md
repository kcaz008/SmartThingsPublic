# LocalSignal Browser Assist Extension

This is a first-pass Chrome/Edge extension scaffold for the safer Facebook
Browser Assist workflow.

## What it does

- Runs only on visible Facebook pages the employee opens manually.
- Detects visible HVAC-like posts using local text heuristics.
- Highlights posts with labels such as:
  - Hot HVAC lead
  - Competitor mentioned
  - Reply recommended
  - Avoid — promo-sensitive
- Can run a user-started guided scan through the next few screens.
- Lets the employee choose/import selected visible posts.
- Can import all detected posts after the employee starts the action.
- Sends selected post text to LocalSignal:
  - `POST /api/browser-import/facebook`
- Opens LocalSignal Browser Assist for review.

## What it does not do

- It does not store Facebook passwords.
- It does not use the Facebook API.
- It does not auto-post.
- It does not run hidden background scraping.
- It does not import anything until the employee clicks the extension button.

## Local install

1. Open Chrome/Edge extensions:
   - `chrome://extensions`
   - or `edge://extensions`
2. Enable Developer Mode.
3. Click **Load unpacked**.
4. Select this folder:
   - `browser-extension`
5. Open the extension popup.
6. Set LocalSignal URL:
   - local: `http://localhost:3000`
   - tunnel: `https://YOUR-TUNNEL.trycloudflare.com`
7. Open a Facebook group you already have access to.
8. Click **Highlight visible leads** for the current screen, or
   **Guided scan next 5 screens** to let the page scroll and detect likely
   leads.
9. Review the highlights/checkmarks.
10. Click **Import selected leads** or **Import all detected leads**.

The import still opens LocalSignal for review before the team takes action.

## Notes

Facebook changes DOM markup often, so this extension uses best-effort visible
text heuristics. A production extension should add stronger selectors, user
review screens, error reporting, and signed extension packaging.
