#!/usr/bin/env bash

set -e

if [ ! -f "src/secrets.ts" ]; then
  echo "Creating secrets file"

  cat > src/secrets.ts <<HERE
import { Secrets } from "./interfaces.js";

throw new Error("Please provide secrets in src/secrets.ts, then delete this line");

export const SECRETS: Secrets = {
  PORT: "6549",

  ZOOM_CLIENT_ID: "PHWkXfbFSjWV5oNin9Djg",
  ZOOM_CLIENT_SECRET: "...",
  ZOOM_SECRET_TOKEN: "...",
};

HERE
  echo
  echo
fi

if [ ! -f "cert.pem" ]; then
  echo "Generating keys..."
  openssl req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 3650 -passout pass:graphqlisgreat -subj "/C=GB/ST=London/L=London/O=GraphQL Foundation/OU=WG/CN=localhost:6549"
  openssl rsa -in keytmp.pem -out key.pem -passin pass:graphqlisgreat
  rm keytmp.pem
  echo
  echo
fi

yarn

echo "You're all set"
