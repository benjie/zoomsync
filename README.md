# ZoomSync

(WORK IN PROGRESS.)

Manages uploading meetings from Zoom to YouTube.

Aims:

- Scan through recordings and determine which have been uploaded and which have
  not
- Figure out from each recording which working group, and which meeting, it
  applies to
- AUtomatically reject recordings that don't look sensible (too short,
  insufficient data, etc)
- When uploading:
  - Assign to correct playlist
  - Give consistent title
  - Make sensible per-WG description, including linking to notes if appropriate
  - Publish
- Convert transcripts to useful format and upload somewhere

Stretch goals:

- Add a cover image
- Allow updating previous recordings (e.g. customized descriptions/cover
  image/update title (if possible))
- Cut blank section from beginning of recordings, or add the "start point" to
  the description
- Add cards or end screen details
- Add link back to specific video in meeting notes
- Notify Discord (or somewhere) that the video has been posted

## Usage

First, run the `init.sh` script:

```bash
./init.sh
```

Then edit the `src/secrets.ts` file and populate the placeholders. You will need
to populate the SECRET and TOKEN values from someone who knows them, or generate
them yourself (see Generating Secrets below).

If you are not using this for the GraphQL project, edit `src/constants.ts` and
update the `DEFAULT_UPLOAD_DESCRIPTION`, `ZOOM_USER_ID` (Zoom -> Profile >
Account No.), `YOUTUBE_CHANNEL_ID`, `workingGroups` and `playlistIds` to match
your setup. Every public video must be in a playlist.

Next, run `yarn start`. (As an optimization, future runs may use
`yarn quickstart` (which skips compilation) if no code, including the
constants/settings, has changed.)

You will probably see authentication errors, and/or links to log in. Log in to
both links, then restart the process (in future we should make it so restarting
the process is not needed). You can then follow the instructions on screen.

### Generating Secrets

If you are not using this for the GraphQL project, then you will need to create
an "app" on both Zoom and Google so that you can use the APIs necessary to
perform the sync. Follow the steps below, and then remove the `throw new Error`
statement from `src/secrets.ts`.

#### Zoom

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

#### Google / YouTube

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
