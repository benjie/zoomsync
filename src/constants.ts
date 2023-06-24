export const ZOOM_API_URL = "https://api.zoom.us/v2";
export const ZOOM_AUTHORIZE_URL = "https://zoom.us/oauth/authorize";
export const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token";
export const ZOOM_USER_ID = "410467";
/**
 * Requires all of the following
 * 1. OAuth Token openapi_oauth in Authorization header
 *    Required scopes: recording:read recording:read:admin
 * 2. Token in Authorization HEADER
 */
export const ZOOM_LIST_ALL_RECORDINGS = `${ZOOM_API_URL}/users/${ZOOM_USER_ID}/recordings`;
