// YouTube Shorts Redirector — background service worker (Manifest V3)
//
// WHY TWO EVENTS?
// YouTube is a Single Page Application (SPA). Navigation inside YouTube
// does not trigger a full page load — it uses the History API (pushState).
//
//   • onCommitted       → fires on "real" navigations: address bar, bookmarks,
//                         external links, and page reloads. This covers the case
//                         where someone pastes a Shorts URL directly.
//
//   • onHistoryStateUpdated → fires when the SPA calls history.pushState().
//                             This covers clicking a Short from the homepage
//                             shelf or anywhere else inside YouTube.
//
// Together they cover every way a user can land on /shorts/.

const YOUTUBE_HOME = 'https://www.youtube.com';
const REDIRECT_DELAY_MS = 500;

// WHY FILTER AT THE LISTENER LEVEL?
// Passing the URL filter to the listener lets Chrome evaluate it in the browser
// process before invoking the service worker. This is more efficient than
// waking the service worker for every YouTube navigation and then discarding
// most of them in JavaScript.
const URL_FILTER = { url: [{ urlContains: 'youtube.com/shorts' }] };

function handleNavigation({ tabId, url }) {
  // The URL filter already guarantees "youtube.com/shorts" is present,
  // but we check for the trailing slash to avoid false positives on any
  // hypothetical URL like /shorts-something (defensive guard).
  if (/youtube\.com\/shorts\//.test(url)) {
    // WHY A DELAY?
    // A small delay lets the Shorts page begin loading so the redirect feels
    // intentional rather than a flicker. 500ms is well within the ~30-second
    // inactivity window before MV3 suspends the service worker, so setTimeout
    // is reliable here.
    setTimeout(() => {
      chrome.tabs.update(tabId, { url: YOUTUBE_HOME });
    }, REDIRECT_DELAY_MS);
  }
}

// Direct navigation (address bar, external link, bookmark, page reload)
chrome.webNavigation.onCommitted.addListener(handleNavigation, URL_FILTER);

// SPA navigation (clicking within YouTube, e.g. the Shorts shelf on the homepage)
chrome.webNavigation.onHistoryStateUpdated.addListener(handleNavigation, URL_FILTER);
