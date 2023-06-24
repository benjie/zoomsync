import { GlobalContext } from "./interfaces";

export function basicAuth(ctx: GlobalContext) {
  const { SECRETS } = ctx;
  const b64 = Buffer.from(
    `${SECRETS.ZOOM_CLIENT_ID}:${SECRETS.ZOOM_CLIENT_SECRET}`
  ).toString("base64");
  return `Basic ${b64}`;
}
