/* GA4 event tracking helper — Little by Little */

function _getUserStatus() {
  return localStorage.getItem('littlebylittle_logged_in') === '1' ? 'logged_in' : 'guest';
}

/**
 * Send a custom GA4 event.
 * Always includes page_location, page_title, and user_status.
 * Pass additional params as an object.
 */
function trackEvent(eventName, params) {
  if (typeof gtag !== 'function') return;
  gtag('event', eventName, Object.assign({
    page_location: window.location.href,
    page_title:    document.title,
    user_status:   _getUserStatus()
  }, params || {}));
}
