import EventEmitter from "node:events";
import { SECRETS } from "./secrets";
import { GlobalContext } from "./interfaces";
import { runOAuthServer } from "./oauthServer";
import { loadResult } from "./zoomTokenManagement";

async function main() {
  const ctx: GlobalContext = {
    eventEmitter: new EventEmitter(),
    SECRETS,
  };
  await loadResult(ctx);
  await runOAuthServer(ctx);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
