import fs from "node:fs/promises";
import { GlobalContext } from "./interfaces";
import { Auth } from "googleapis";

const OAUTH_FILE_PATH = `${__dirname}/../.googleOAuthResult.json`;
type SaveFileJSON = { data: Auth.Credentials; ts: number };
export async function loadResult(ctx: GlobalContext) {
  try {
    const data = await fs.readFile(OAUTH_FILE_PATH, "utf8");
    const parsed = JSON.parse(data) as SaveFileJSON;
    ctx.googleCredentials = parsed.data;
    ctx.googleOAuthClient.setCredentials(parsed.data);
    console.log(`Loaded existing google token from file`);

    const expires = parsed.data.expiry_date;
    if (!expires || expires - Date.now() < 30 * 60 * 1000) {
      // It's going to expire in the next 30 minutes; refresh
      await refreshToken(ctx);
    }
  } catch {
    // NOOP;
  }
}

export async function saveResult(
  ctx: GlobalContext,
  credentials: Auth.Credentials
) {
  ctx.eventEmitter.emit("googleCredentials", { credentials });
  await fs.writeFile(
    OAUTH_FILE_PATH,
    JSON.stringify(
      { data: credentials, ts: Date.now() } as SaveFileJSON,
      null,
      2
    ) + "\n"
  );
}

let pendingRefresh: Promise<void> | null = null;
export async function refreshToken(ctx: GlobalContext) {
  if (!pendingRefresh) {
    pendingRefresh = (async () => {
      console.log("Refreshing Google token...");
      try {
        const response = await ctx.googleOAuthClient.refreshAccessToken();
        await saveResult(ctx, response.credentials);
        console.log("Google token refreshed");
      } catch (e) {
        console.error("Google token refresh failed: ", e);
        throw e;
      }
    })();
  }
  return pendingRefresh;
}
