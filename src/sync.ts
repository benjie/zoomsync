import { workingGroups } from "./constants";
import { GlobalContext } from "./interfaces";
import { blue } from "./logging";
import { getPendingMeetings } from "./matching";

type Pending = ReturnType<typeof getPendingMeetings>[number];

export async function uploadPending(ctx: GlobalContext, pendings: Pending[]) {
  console.log();
  console.log();
  console.log(
    `Should I upload the following (you should check YouTube to ensure there will be no duplicates)?`
  );
  console.log();
  const countByWg: { -readonly [wgId in keyof typeof workingGroups]: number } =
    Object.create(null);
  const seenTitles = new Map<string, Pending>();
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
  }
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
