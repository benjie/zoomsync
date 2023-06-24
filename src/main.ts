import EventEmitter from "node:events";
import { SECRETS } from "./secrets";
import { GlobalContext } from "./interfaces";
import { runOAuthServer } from "./oauthServer";

async function main() {
  const ctx: GlobalContext = {
    eventEmitter: new EventEmitter(),
    SECRETS,
  };
  await runOAuthServer(ctx);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
