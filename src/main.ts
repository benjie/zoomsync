import EventEmitter from "node:events";
import { SECRETS } from "./secrets";
import { GlobalContext } from "./interfaces";
import { runOAuthServer } from "./oauthServer";
import { loadResult as loadZoomResult } from "./zoomTokenManagement";
import { loadResult as loadGoogleResult } from "./googleTokenManagement";
import { Meeting, getZoomRecordings } from "./zoomClient";
import * as fs from "node:fs/promises";
import { google } from "googleapis";
import { getUploads } from "./googleClient";

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
  await getUploads(ctx);
  for (let monthsAgo = 6; monthsAgo >= 0; monthsAgo--) {
    const allRecordingsFromMonth = await getZoomRecordings(ctx, monthsAgo);
    console.log(allRecordingsFromMonth);

    // TODO: don't break
    break;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
