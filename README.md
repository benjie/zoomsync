# ZoomSync

Manages uploading meetings from Zoom to YouTube; intended for Open Source
Working Groups. Built specifically for the
[GraphQL working group](https://github.com/graphql/graphql-wg), but is also used
by the [Grafast WG](https://github.com/grafast/wg) and could be used for your
projects too?

## Status

Stable; has been working for the GraphQL Foundation for months. Recently adopted
by the Grafast WG.

## Current features

- Scans through Zoom recordings and YouTube videos and determine which have been
  uploaded and which have not
- Figure out from each recording which working group, and which meeting, it
  applies to
- Automatically ignore Zoom recordings that don't look sensible (too short,
  insufficient data, etc)
- When uploading:
  - Assign to correct playlist
  - Give consistent title
  - Make sensible per-WG description
  - Publish

## Future goals

- Add a link from the description to the meeting notes if appropriate
- Convert Zoom and/or YouTube transcripts to useful format and upload somewhere
- Add a cover image
- Allow updating previous recordings (e.g. customized descriptions/cover
  image/update title (if possible))
- Cut blank section from beginning of recordings, or add the "start point" to
  the description
- Add cards or end screen details
- Submit pull request to the meeting notes to add a link back to the specific
  YouTube video
- Notify Discord (or somewhere) that the video has been posted

## Setup

### Init

First, run the `init.sh` script:

```bash
./init.sh
```

Then:

### For GraphQL WG

If you're using this for the GraphQL WG, edit `src/secrets.ts` and populate the
SECRET and TOKEN values from someone who knows them (likely @benjie!)

### For a different WG

If you're not using this for the GraphQL WG, there's a few more steps:

Edit the `src/secrets.ts` file and populate all of the placeholders, including
the seemingly hardcoded ones - see Generating Secrets below for instructions.

Edit `src/constants.ts` and update the `DEFAULT_UPLOAD_DESCRIPTION`,
`ZOOM_USER_ID` (Zoom -> Profile > Account No.), `YOUTUBE_CHANNEL_ID`,
`workingGroups` and `playlistIds` to match your setup. **Every public video must
be in a playlist.**

## Running

Run `yarn start`. (As an optimization, future runs may use `yarn quickstart`
(which skips compilation) if you are **absolutely certain** that no code,
including the constants/settings, has changed.)

You will probably see authentication errors, and/or links to log in. Log in to
both links, then kill (ctrl-c) and restart (`yarn start`) the process. (In
future we should make it so restarting the process is not needed.)

Follow the instructions on screen.

## Generating Secrets

If you are not using this for the GraphQL project, then you will need to create
an "app" on both Zoom and Google so that you can use the APIs necessary to
perform the sync. Follow the steps below, and then remove the `throw new Error`
statement from `src/secrets.ts`.

If there are mistakes in these instructions or you'd like to submit
clarifications, please send a PR!

### Zoom

1. Log in to https://marketplace.zoom.us/
2. Click Develop > Build App (top right)
3. Select "OAuth" as the type
4. Pick a name, e.g. "MyProjectSync"
5. Make the app "User-managed"
6. Do not publish to the marketplace
7. Copy the Client ID and Client Secret into `src/secrets.ts` as
   `ZOOM_CLIENT_ID` and `ZOOM_CLIENT_SECRET` respectively
8. Set the "Redirect URL for OAuth" to
   `https://localhost:6549/zoom/auth/redirect`, and add the same URL to the
   Allow List
9. Press "Continue" and set `Syncs recordings with YouTube` or similar for the
   short/long descriptions. Fill out Company Name and Developer Contact
   Information
10. Press "Continue" and copy the "Secret Token" into `src/secrets.ts` as
    `ZOOM_SECRET_TOKEN`
11. Press "Continue" then "+ Add Scopes" add `meeting:read`, `recording:read`
    and `recording:write` scopes
12. "Continue"

That should do it.

### Google / YouTube

1. Log in to https://console.cloud.google.com/
2. Create an organization if you haven't already (I guess... Kinda fuzzy on this
   step)
3. Create a project, e.g. `MyProjectSync`
4. Wait for the project to be created, and then select that project as the
   active project (top left)
5. Hamburger > APIs & Services > Enabled APIs & Services; then click "+ ENABLE
   APIS AND SERVICES"
6. Search for and enable "YouTube Data API v3"
7. Click the "CREATE CREDENTIALS" button, and create credentials for "User
   data"; if asked (kinda fuzzy on this step too):
   - Scopes: Add `https://www.googleapis.com/auth/youtube`,
     `https://www.googleapis.com/auth/youtube.readonly`,
     `https://www.googleapis.com/auth/youtube.upload`
   - Application type: **Desktop** app
   - Name: MyProjectSync CLI
   - Authorized redirect URIs: `https://localhost:6549/google/auth/redirect`
8. Download the credentials and copy the `client_id` and `client_secret` into
   `src/secrets.ts` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   respectively.
9. "Done"
10. Under APIs & Services > OAuth consent screen, change User type to External
    and add your own account as a test user.
