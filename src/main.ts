import EventEmitter from "node:events";
import { SECRETS } from "./secrets";
import { GlobalContext } from "./interfaces";
import { runOAuthServer } from "./oauthServer";
import { loadResult as loadZoomResult } from "./zoomTokenManagement";
import { loadResult as loadGoogleResult } from "./googleTokenManagement";
import { Meeting, getZoomRecordings } from "./zoomClient";
import * as fs from "node:fs/promises";
import { google } from "googleapis";
import { getPlaylists, getUploads } from "./googleClient";
import {
  categorizeUploads,
  getPendingMeetings,
  guessWgByMeeting,
} from "./matching";
import { workingGroups } from "./constants";
import { INFO } from "./logging";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

// TODO: this method is only for development, to stop us spamming APIs. Remove!
async function cache<TData>(
  name: string,
  callback: () => Promise<TData>
): Promise<TData> {
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

async function main() {
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

  const uploads = await cache("uploads", () => getUploads(ctx));
  const playlists = await cache("playlists", () => getPlaylists(ctx));
  const categorizedVideos = categorizeUploads(uploads, playlists);

  for (let monthsAgo = 6; monthsAgo >= 0; monthsAgo--) {
    const allRecordingsFromMonth = await cache(`recordings-${monthsAgo}`, () =>
      getZoomRecordings(ctx, monthsAgo)
    );
    const pending = getPendingMeetings(
      allRecordingsFromMonth,
      categorizedVideos
    );

    if (pending.length > 0) {
      console.dir(pending);
      // TODO: don't break
      break;
    } else {
      console.log(
        `${INFO}All videos already uploaded for ${monthsAgo} months ago`
      );
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
