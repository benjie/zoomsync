import fs from "node:fs/promises";
import { GlobalContext } from "./interfaces";
import axios from "axios";
import { ZOOM_TOKEN_URL } from "./constants";
import { basicAuth } from "./zoomClient";

interface OAuthResult {
  access_token: string;
  token_type: "bearer";
  refresh_token: string;
  expires_in: number;
  scope: string;
}

const OAUTH_FILE_PATH = `${__dirname}/../.oauthResult.json`;
export async function loadResult(ctx: GlobalContext) {
  try {
    const data = await fs.readFile(OAUTH_FILE_PATH, "utf8");
    const parsed = JSON.parse(data) as { data: OAuthResult; ts: number };
    ctx.zoomToken = parsed.data.access_token;
    ctx.zoomRefreshToken = parsed.data.refresh_token;
    console.log(`Loaded existing token from file`);
    // TODO: only do this if the token is near expiration
    await refreshToken(ctx);
  } catch {
    // NOOP;
  }
}

export async function saveResult(ctx: GlobalContext, data: any) {
  const token = data.access_token;
  ctx.eventEmitter.emit("token", { token });
  await fs.writeFile(
    OAUTH_FILE_PATH,
    JSON.stringify({ data, ts: Date.now() }, null, 2) + "\n"
  );
}

let pendingRefresh: Promise<void> | null = null;
export async function refreshToken(ctx: GlobalContext) {
  if (!pendingRefresh) {
    pendingRefresh = (async () => {
      console.log("Refreshing token...");
      try {
        const response = await axios({
          method: "POST",
          url: ZOOM_TOKEN_URL,
          headers: {
            Authorization: basicAuth(ctx),
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          data: {
            grant_type: "refresh_token",
            refresh_token: ctx.zoomRefreshToken,
          },
        });
        await saveResult(ctx, response.data);
        console.log("Token refreshed");
      } catch (e) {
        console.error("Token refresh failed: ", e);
        throw e;
      }
    })();
  }
  return pendingRefresh;
}
