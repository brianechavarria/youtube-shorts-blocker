# YouTube Shorts Redirector

A minimal Chrome extension (Manifest V3) that silently redirects any YouTube Shorts URL to the YouTube homepage after a 500ms delay.

## What It Does

Whenever you land on `youtube.com/shorts/...` — whether by typing the URL, clicking a link, or clicking a Short inside YouTube — the extension redirects you to `https://www.youtube.com` automatically.

## Installation

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `youtube-shorts-blocker/` folder
6. The extension is now active — no restart needed

To reload after editing files: click the refresh icon on the extension card at `chrome://extensions`.

## How It Works

### Why Two Navigation Events?

YouTube is a **Single Page Application (SPA)**. Navigating within YouTube doesn't always trigger a full page load — instead, YouTube uses the browser's History API (`pushState`) to update the URL without reloading the page. This means a single event listener isn't enough:

| Scenario | Event that fires |
|---|---|
| Paste a Shorts URL in the address bar | `chrome.webNavigation.onCommitted` |
| Click a bookmark to a Shorts URL | `chrome.webNavigation.onCommitted` |
| Click a Short in the Shorts shelf on the homepage | `chrome.webNavigation.onHistoryStateUpdated` |
| Click a Short from search results | `chrome.webNavigation.onHistoryStateUpdated` |

The background service worker listens to both events and routes them through the same handler function.

### URL Filter at Listener Level

The URL filter (`{ urlContains: 'youtube.com/shorts' }`) is passed directly to the event listeners rather than filtered in JavaScript. This tells Chrome to evaluate the filter in the browser process before waking the service worker — more efficient for high-frequency navigation events.

### The 500ms Delay

The redirect fires after a 500ms delay via `setTimeout`. This makes the redirect feel intentional rather than a flicker, and is well within the ~30-second inactivity window before MV3 suspends service workers.

## Customization

**Change the redirect target** — edit `YOUTUBE_HOME` in `background.js`:
```js
const YOUTUBE_HOME = 'https://www.youtube.com'; // change to any URL
```

**Change the delay** — edit `REDIRECT_DELAY_MS` in `background.js`:
```js
const REDIRECT_DELAY_MS = 500; // milliseconds; 0 for instant redirect
```

After any change, go to `chrome://extensions` and click the refresh icon on the extension card.
