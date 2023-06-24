/*
 * It would be ideal to use server-to-server OAuth so that we don't have to deal
 * with all this OAuth nonsense (do we really need to run a server?!) but alas,
 * because the GraphQL Foundation Zoom Account is merely a "member" of the Linux
 * Foundation Zoom Account, we do not have the permissions necessary to create
 * one. So OAuth server it is.
 */

import axios from "axios";
import { ZOOM_AUTHORIZE_URL, ZOOM_TOKEN_URL } from "./constants";
import { GlobalContext } from "./interfaces";
import express from "express";
import { stringify } from "node:querystring";
import { saveResult } from "./tokenManagement";
import * as fs from "node:fs/promises";
import * as https from "node:https";

export async function runOAuthServer(ctx: GlobalContext) {
  const { SECRETS } = ctx;
  const app = express();
  const redirectUri = `https://localhost:${SECRETS.PORT}/zoom/auth/redirect`;
  app.get("/zoom/login", (req, res) => {
    res.redirect(
      `${ZOOM_AUTHORIZE_URL}?${stringify({
        response_type: "code",
        redirect_uri: redirectUri,
        client_id: SECRETS.ZOOM_CLIENT_ID,
      })}`
    );
  });

  app.get("/zoom/auth/redirect", async (req, res, next) => {
    try {
      const code = String(req.query.code);
      const b64 = Buffer.from(
        `${SECRETS.ZOOM_CLIENT_ID}:${SECRETS.ZOOM_CLIENT_SECRET}`
      ).toString("base64");
      const response = await axios({
        method: "POST",
        url: ZOOM_TOKEN_URL,
        headers: {
          Authorization: `Basic ${b64}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        data: {
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        },
      });
      await saveResult(ctx, response.data);
      res.end(`Token acquired, return to terminal.`);
    } catch (e) {
      next(e);
    }
  });

  const key = await fs.readFile(`${__dirname}/../key.pem`, "utf8");
  const cert = await fs.readFile(`${__dirname}/../cert.pem`, "utf8");

  return new Promise<void>((resolve, reject) => {
    const server = https.createServer({ key: key, cert: cert }, app);
    server.on("error", reject);
    server.on("listening", () => {
      console.log(
        `OAuth server listening; login to Zoom at https://localhost:${SECRETS.PORT}/zoom/login`
      );
      resolve();
    });
    server.listen(SECRETS.PORT);
  });
}
