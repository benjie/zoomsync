import fs from "node:fs/promises";
import { GlobalContext } from "./interfaces";

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
    ctx.token = parsed.data.access_token;
    ctx.refreshToken = parsed.data.refresh_token;
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
