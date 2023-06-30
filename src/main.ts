import EventEmitter from "node:events";
import { SECRETS } from "./secrets";
import { GlobalContext } from "./interfaces";
import { runOAuthServer } from "./oauthServer";
import { loadResult as loadZoomResult } from "./zoomTokenManagement";
import { loadResult as loadGoogleResult } from "./googleTokenManagement";
import { getZoomRecordings } from "./zoomClient";
import * as fs from "node:fs/promises";
import { google } from "googleapis";
import { getPlaylists, getUploads } from "./googleClient";
import { categorizeUploads, getPendingMeetings } from "./matching";
import { INFO } from "./logging";
import { uploadPending } from "./sync";
import { yn } from "./ui";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

// DO NOT SET THIS TO TRUE in normal usage. It's useful when iterating on the
// comparison logic (for both speed and to stop us spamming Google/Zoom APIs),
// but it will mean that comparisons are being done on potentially stale data,
// which could lead to undesirable results.
const enableCache = false;

async function cache<TData>(
  name: string,
  callback: () => Promise<TData>
): Promise<TData> {
  if (!enableCache) {
    return callback();
  }

  const filePath = `${__dirname}/../cache/${name}.json`;
  try {
    const stats = await fs.stat(filePath);
    if (+stats.mtime < Date.now() - 2 * HOUR) {
      throw new Error(`Cache is out of date`);
    }
    return await JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    const data = await callback();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n");
    return data;
  }
}

/**
 * The main function, this is where everything starts.
 */
async function main() {
  try {
    await fs.mkdir(`${__dirname}/../cache`);
  } catch {
    // ignore
  }
  const googleRedirectUri = `https://localhost:${SECRETS.PORT}/google/auth/redirect`;
  const googleClient = new google.auth.OAuth2(
    SECRETS.GOOGLE_CLIENT_ID,
    SECRETS.GOOGLE_CLIENT_SECRET,
    googleRedirectUri
  );
  const ctx: GlobalContext = {
    eventEmitter: new EventEmitter(),
    SECRETS,
    googleOAuthClient: googleClient,
  };
  await loadZoomResult(ctx);
  await loadGoogleResult(ctx);
  await runOAuthServer(ctx);

  await runMainProcess(ctx);
  ctx.eventEmitter.on("zoomToken", () => runMainProcess(ctx));
  ctx.eventEmitter.on("googleCredentials", () => runMainProcess(ctx));
}

/**
 * Determines whether or not `_dangerouslyRunMainProcess` is running.
 */
let running = false;
async function runMainProcess(ctx: GlobalContext) {
  if (running) {
    console.warn(`Main process is already running; will not retry.`);
    return;
  }
  running = true;
  try {
    await _dangerouslyRunMainProcess(ctx);
  } catch (e) {
    console.error(e);
    console.error();
    console.error(
      "The above error occurred running the main process... Perhaps you need to re-authenticate?"
    );
    console.error(`  https://localhost:${SECRETS.PORT}/zoom/login`);
    console.error(`  https://localhost:${SECRETS.PORT}/google/login`);
  } finally {
    running = false;
  }
}

async function _dangerouslyRunMainProcess(ctx: GlobalContext, now = false) {
  const start = await yn(
    `Would you like me to start the comparison and upload process${
      now ? " _now_" : ""
    }? [y/N] `
  );
  if (start !== true) {
    console.log("Okay fine... I won't start it yet.");
    return _dangerouslyRunMainProcess(ctx, true);
  }
  const uploads = await cache("uploads", () => getUploads(ctx));
  const playlists = await cache("playlists", () => getPlaylists(ctx));
  const categorizedVideos = categorizeUploads(uploads, playlists);

  for (let monthsAgo = 6; monthsAgo >= 0; monthsAgo--) {
    console.log();
    const allRecordingsFromMonth = await cache(`recordings-${monthsAgo}`, () =>
      getZoomRecordings(ctx, monthsAgo)
    );
    const pending = getPendingMeetings(
      allRecordingsFromMonth,
      categorizedVideos
    );

    if (pending.length > 0) {
      await uploadPending(ctx, pending);
    } else {
      console.log(
        `${INFO}All videos already uploaded for ${monthsAgo} months ago`
      );
    }
  }
  console.log();
  console.log("All done!");
}

// Kicks off the main function. If we were running pure ESM-mode we wouldn't
// need this due to top-level await, but for now it's a reasonable compromise.
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
