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
- Lets the employee choose/import selected visible posts.
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
8. Click **Highlight visible leads**.
9. Click **Import selected leads**.

## Notes

Facebook changes DOM markup often, so this extension uses best-effort visible
text heuristics. A production extension should add stronger selectors, user
review screens, error reporting, and signed extension packaging.
