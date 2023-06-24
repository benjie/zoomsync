import EventEmitter from "node:events";
import { SECRETS } from "./secrets";
import { GlobalContext } from "./interfaces";
import { runOAuthServer } from "./oauthServer";
import { loadResult } from "./zoomTokenManagement";
import { getZoomRecordings } from "./zoomClient";

async function main() {
  const ctx: GlobalContext = {
    eventEmitter: new EventEmitter(),
    SECRETS,
  };
  await loadResult(ctx);
  await runOAuthServer(ctx);
  for (let monthsAgo = 6; monthsAgo >= 0; monthsAgo--) {
    const allRecordingsFromMonth = await getZoomRecordings(ctx, monthsAgo);

    // TODO: don't break
    break;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
