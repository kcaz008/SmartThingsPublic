# LocalSignal Auto-Assist Extension

This is a Manifest V3 browser extension for button-activated page scanning.

## What it does

1. The user logs into Facebook normally in their own browser.
2. The user opens a Facebook group page.
3. The user clicks **Scan Current Page** in the LocalSignal extension popup.
4. The extension injects a one-time extraction function into the active tab.
5. Only visible post text from the current page is sent to LocalSignal.
6. LocalSignal returns HVAC/service-intent opportunity cards.
7. The user can copy a suggested reply or mark cards ignored, replied, booked,
   or won.

## What it does not do

- No Facebook password storage.
- No fake accounts.
- No pretending to be a customer.
- No automatic posting or comments.
- No background scraping.
- No scanning until the user clicks the button.
- No analysis of posts that are not visible to the logged-in user.

## Local testing

1. Run the LocalSignal app:

   ```bash
   npm run dev
   ```

2. Open Chrome or Edge extension settings.
3. Enable developer mode.
4. Choose **Load unpacked** and select this `browser-extension` folder.
5. Open a Facebook group page while logged in normally.
6. Click the LocalSignal extension and choose **Scan Current Page**.

The popup defaults to `http://localhost:3000`; update the app URL in the popup
when scanning against a deployed LocalSignal instance.
