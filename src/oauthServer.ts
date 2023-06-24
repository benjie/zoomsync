/*
 * It would be ideal to use server-to-server OAuth so that we don't have to deal
 * with all this OAuth nonsense (do we really need to run a server?!) but alas,
 * because the GraphQL Foundation Zoom Account is merely a "member" of the Linux
 * Foundation Zoom Account, we do not have the permissions necessary to create
 * one. So OAuth server it is.
 */

import axios from "axios";
import {
  GOOGLE_AUTHORIZE_URL,
  GOOGLE_TOKEN_URL,
  ZOOM_AUTHORIZE_URL,
  ZOOM_TOKEN_URL,
} from "./constants";
import { GlobalContext } from "./interfaces";
import express from "express";
import { stringify } from "node:querystring";
import { saveResult as saveZoomResult } from "./zoomTokenManagement";
import { saveResult as saveGoogleResult } from "./googleTokenManagement";
import * as fs from "node:fs/promises";
import * as https from "node:https";
import { basicAuth } from "./zoomClient";
import { google } from "googleapis";

export async function runOAuthServer(ctx: GlobalContext) {
  const { SECRETS, googleOAuthClient } = ctx;

  const app = express();

  const zoomRedirectUri = `https://localhost:${SECRETS.PORT}/zoom/auth/redirect`;

  app.get("/zoom/login", (req, res) => {
    res.redirect(
      `${ZOOM_AUTHORIZE_URL}?${stringify({
        response_type: "code",
        redirect_uri: zoomRedirectUri,
        client_id: SECRETS.ZOOM_CLIENT_ID,
      })}`
    );
  });

  app.get("/zoom/auth/redirect", async (req, res, next) => {
    try {
      const code = String(req.query.code);
      const response = await axios({
        method: "POST",
        url: ZOOM_TOKEN_URL,
        headers: {
          Authorization: basicAuth(ctx),
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        data: {
          code,
          grant_type: "authorization_code",
          redirect_uri: zoomRedirectUri,
        },
      });
      await saveZoomResult(ctx, response.data);
      res.end(`Zoom token acquired, return to terminal.`);
    } catch (e) {
      next(e);
    }
  });

  const googleScopes = [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.upload",
  ];

  app.get("/google/login", (req, res) => {
    const url = googleOAuthClient.generateAuthUrl({
      access_type: "offline",
      scope: googleScopes,
    });
    res.redirect(url);
  });

  app.get("/google/auth/redirect", async (req, res, next) => {
    try {
      const code = String(req.query.code);
      const { tokens } = await googleOAuthClient.getToken(code);
      await saveGoogleResult(ctx, tokens);
      res.end(`Google token acquired, return to terminal.`);
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
