import { YOUTUBE_CHANNEL_ID, playlistIds, workingGroups } from "./constants";
import { GlobalContext } from "./interfaces";
import { blue } from "./logging";
import { getPendingMeetings } from "./matching";
import * as fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import * as https from "node:https";
import { uploadVideo } from "./googleClient";
import { yn } from "./ui";

const VIDEO_DOWNLOAD_BASE = `${__dirname}/../cache/videos`;

type Pending = ReturnType<typeof getPendingMeetings>[number];
type ToUploadSpec = Pending & { title: string };

export async function uploadPending(ctx: GlobalContext, pendings: Pending[]) {
  console.log();
  console.log();
  console.log(`Proposed uploads:`);
  console.log();
  const countByWg: { -readonly [wgId in keyof typeof workingGroups]: number } =
    Object.create(null);
  const seenTitles = new Map<string, Pending>();
  const toUploadSpecs: Array<ToUploadSpec> = [];
  for (const pending of pendings) {
    if (!countByWg[pending.wgId]) {
      countByWg[pending.wgId] = 1;
    } else {
      countByWg[pending.wgId]++;
    }

    const count = countByWg[pending.wgId];
    const wg = workingGroups[pending.wgId];
    if (wg.max && wg.max < count) {
      throw new Error(`Wasn't expecting multiple meetings of '${wg.name}'`);
    }
    const title = makeTitle(pending, count);
    if (seenTitles.has(title.toLowerCase())) {
      console.dir(seenTitles.get(title.toLowerCase()));
      console.dir(pending);
      throw new Error(`'${title}' occurred more than once!`);
    }
    seenTitles.set(title.toLowerCase(), pending);
    console.log(
      `- Zoom meeting '${pending.meeting.topic}' on '${
        pending.meeting.start_time
      }'\n  -> ${blue(title)}`
    );
    toUploadSpecs.push({ ...pending, title });
  }

  try {
    await fs.mkdir(VIDEO_DOWNLOAD_BASE);
  } catch {}

  // readline

  if (
    !(await yn(
      `Would you like me to upload the above? (You should check YouTube to ensure there will be no duplicates.) [y/N] `
    ))
  ) {
    throw new Error(`User requested to abort`);
  } else {
    for (const toUploadSpec of toUploadSpecs) {
      const dirName = Buffer.from(toUploadSpec.meeting.uuid!).toString("hex");
      const uploadDir = `${VIDEO_DOWNLOAD_BASE}/${dirName}`;
      try {
        await fs.mkdir(uploadDir);
      } catch {}
      console.log(`Processing '${toUploadSpec.title}'...`);
      for (const file of toUploadSpec.meeting.recording_files!) {
        if (file.file_type !== "MP4") continue;
        const filePath = `${uploadDir}/${Buffer.from(
          toUploadSpec.meeting.uuid!
        ).toString("hex")}.mp4`;
        console.log(`Downloading...`);
        await download(file.download_url!, filePath, {
          Authorization: `Bearer ${ctx.zoomToken}`,
        });
        await upload(ctx, toUploadSpec, filePath);
        console.log(`Deleting...`);
        await fs.unlink(filePath);
      }
    }
  }
}

async function upload(
  ctx: GlobalContext,
  toUploadSpec: ToUploadSpec,
  filePath: string
) {
  await uploadVideo(
    ctx,
    filePath,
    {
      channelId: YOUTUBE_CHANNEL_ID,
      title: toUploadSpec.title,
      description: workingGroups[toUploadSpec.wgId].ytDescription,
      // TODO: tags,
      categoryId: "28" /* science and technology */,
      defaultLanguage: "en",
      defaultAudioLanguage: "en",
    },
    playlistIds[toUploadSpec.wgId]
  );
}

function makeTitle(pending: Pending, count: number): string {
  const wg = workingGroups[pending.wgId];
  return `${wg.name}${subtitle(pending, count)} - ${pending.date}`;
}

function subtitle(pending: Pending, count: number): string {
  const wg = workingGroups[pending.wgId];
  if (!wg.subtitles) return "";
  const dd = parseInt(pending.date.slice(8), 10);
  const subtitle = wg.subtitles
    .slice(count - 1)
    .find((t) => dd >= t.dateMin && dd <= t.dateMax);
  if (subtitle) {
    return ` ${subtitle.label}`;
  } else {
    throw new Error(
      `Failed to find matching subtitle for date ${dd} count ${count}`
    );
  }
}

async function download(
  url: string,
  filePath: string,
  headers?: Record<string, string>,
  redirects = 0
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers,
      },
      (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          if (redirects > 10) {
            reject(new Error(`Too many redirects`));
          } else {
            resolve(
              download(
                response.headers.location!,
                filePath,
                headers,
                redirects + 1
              )
            );
          }
        } else if (response.statusCode === 200) {
          const writeStream = createWriteStream(filePath);
          response.pipe(writeStream);
          writeStream.on("finish", resolve);
        } else {
          request.end();
          reject(new Error(`Bad status code ${response.statusCode}`));
        }
      }
    );
  });
}
