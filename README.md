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
to populate the SECRET and TOKEN values from someone who knows them.

Next, run `yarn start`. (As an optimization, future runs may use
`yarn quickstart` (which skips compilation) if no code has changed.)

You will probably see authentication errors, and links to log in. Log in to both
links, then restart the process (in future we should make it so restarting the
process is not needed). You can then follow the instructions on screen.
