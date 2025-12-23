import API_BASE from '../config';

/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 */
function fetchModel(url) {
  const base = API_BASE || "";
  // Build full URL: allow absolute URLs or relative paths prefixed by a base.
  // Use relative paths by default so CRA dev server proxy can forward requests to backend.
  // Set REACT_APP_API_BASE to an absolute URL only if you need cross-origin requests.
  const fullUrl = url && (url.startsWith("http://") || url.startsWith("https://"))
    ? url
    : `${base}${url && url.startsWith("/") ? "" : "/"}${url || ""}`;

  return fetch(fullUrl, {
    method: "GET",
    // Send credentials (cookies) so server session is included
    credentials: "include",
    headers: {
      "Accept": "application/json",
    },
  }).then(async (res) => {
    const text = await res.text();
    // try to parse JSON if any
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      // ignore JSON parse error, we'll handle based on status
    }

    if (!res.ok) {
      const err = new Error(`Request failed: ${res.status} ${res.statusText}` + (text ? ` - ${text}` : ""));
      err.status = res.status;
      err.body = data || text;
      throw err;
    }

    return data;
  });
}

export default fetchModel;
