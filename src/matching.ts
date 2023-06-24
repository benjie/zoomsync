import { youtube_v3 } from "googleapis";
import { getPlaylists } from "./googleClient";
import { workingGroups } from "./constants";
import { Meeting } from "./zoomClient";
import { INFO, WARN } from "./logging";

export function categorizeUploads(
  uploads: youtube_v3.Schema$PlaylistItem[],
  playlists: Awaited<ReturnType<typeof getPlaylists>>
) {
  const playlistIdsByVideoId: Record<string, string[]> = Object.create(null);
  for (const [playlistId, details] of Object.entries(playlists)) {
    for (const videoId of details.videoIds) {
      if (playlistIdsByVideoId[videoId]) {
        playlistIdsByVideoId[videoId].push(playlistId);
      } else {
        playlistIdsByVideoId[videoId] = [playlistId];
      }
    }
  }

  let warnings = 0;
  const videosByWg: {
    [key in keyof typeof workingGroups]: Array<{
      title: string;
      videoId: string;
      /** YYYY-MM-DD */
      date: string;
    }>;
  } = (Object.keys(workingGroups) as (keyof typeof workingGroups)[]).reduce(
    (memo, k) => {
      memo[k] = [];
      return memo;
    },
    Object.create(null) as any
  );

  for (const upload of uploads) {
    const videoId = upload.contentDetails?.videoId;
    const title = upload.snippet?.title;
    if (!videoId || !title) {
      continue;
    }
    const wgFromPlaylist = guessWgByPlaylist(upload);
    if (wgFromPlaylist && workingGroups[wgFromPlaylist]?.ignore) {
      continue;
    }
    const wgFromTitle = guessWgByTitle(upload);
    if (wgFromPlaylist) {
      if (wgFromTitle) {
        if (wgFromTitle !== wgFromPlaylist) {
          throw new Error(
            `Video ${videoId} (${title}) has mismatch - title suggests '${wgFromTitle}' but playlist is '${wgFromPlaylist}'`
          );
        } else {
          // Noop
        }
      } else {
        // TODO: fix title?
        console.warn(
          `Unmatched title '${title}' on video '${videoId}'; expected ${
            workingGroups[wgFromPlaylist]!.name
          }`
        );
        warnings++;
      }
    } else if (wgFromTitle) {
      // TODO: add to playlist
      console.warn(
        `Video title '${title}' id '${videoId}' expected in playlist ${workingGroups[wgFromTitle].name}`
      );
      warnings++;
    } else {
      console.warn(
        `Video title '${title}' id '${videoId}' unknown working group`
      );
      warnings++;
    }
    const wg = wgFromTitle || wgFromPlaylist;
    if (wg) {
      const i = title.indexOf(" - ");
      if (i < 0) {
        throw new Error(
          `Could not split title into date part '${title}' - needs to contain ' - '`
        );
      }
      const remainderOfTitle = title.slice(i + 3);
      const date = dateFromText(remainderOfTitle);
      videosByWg[wg].push({
        title,
        videoId,
        date,
      });
    }
  }

  if (warnings > 0) {
    throw new Error(`Aborting due to ${warnings} warnings`);
  }

  return videosByWg;

  function guessWgByTitle(upload: youtube_v3.Schema$PlaylistItem) {
    try {
      return guessWgByTitleText(upload.snippet?.title);
    } catch (e: any) {
      throw new Error(`Video ${upload.contentDetails?.videoId!}: ${e.message}`);
    }
  }

  function guessWgByPlaylist(upload: youtube_v3.Schema$PlaylistItem) {
    let guess: string | null = null;
    const playlistIds = playlistIdsByVideoId[upload.contentDetails?.videoId!];
    if (playlistIds) {
      for (const playlistId of playlistIds) {
        if (guess) {
          throw new Error(
            `Video ${upload.contentDetails?.videoId!} is in multiple playlists!`
          );
        }
        guess = playlists[playlistId].workingGroupId;
      }
    }
    return guess as keyof typeof workingGroups | null;
  }
}

function dateFromText(text: string): string {
  const t = text.trim();
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(t)) {
    return t;
  }
  if (t.length < 10) throw new Error(`Could not interpret date '${t}'`);
  const date = new Date(Date.parse(t));
  date.setHours(date.getHours() + 12);
  const str = date.toISOString().slice(0, 10);
  return str;
}

function guessWgByTitleText(title: string | null | undefined) {
  const titleLower = title?.toLowerCase();
  let guess: string | null = null;
  for (const [wgId, details] of Object.entries(workingGroups)) {
    if (
      titleLower?.startsWith(details.name.toLowerCase()) ||
      details.aliases.some((alias) =>
        titleLower?.startsWith(alias.toLowerCase())
      )
    ) {
      if (guess) {
        throw new Error(
          `Title '${title}' matches title with multiple working groups!`
        );
      }
      guess = wgId;
    }
  }
  return guess as keyof typeof workingGroups | null;
}

export function guessWgByMeeting(meeting: Meeting) {
  const { topic } = meeting;
  return guessWgByTitleText(topic);
}

const byteFormatter = new Intl.NumberFormat([], {
  style: "unit",
  unit: "byte",
  notation: "compact",
  unitDisplay: "narrow",
});

export function getPendingMeetings(
  meetings: Meeting[],
  categorizedVideos: ReturnType<typeof categorizeUploads>
) {
  const pending: { meeting: Meeting; wgId: keyof typeof workingGroups }[] = [];
  for (const meeting of meetings) {
    const { duration, total_size, topic, start_time } = meeting;
    const humanSize = byteFormatter.format(total_size!);
    if (duration! < 5) {
      // Meeting is less than 5 minutes; probably irrelevant
      console.log(
        `${INFO}Skipping ${duration} minute ${humanSize} meeting '${topic}' (started ${start_time}) - too short.`
      );
      continue;
    }
    if (total_size! < 5_000_000) {
      // Meeting is less than 5 minutes; probably irrelevant
      console.log(
        `${INFO}Skipping ${duration} minute ${humanSize} meeting '${topic}' (started ${start_time}) - too small.`
      );
      continue;
    }
    const wgId = guessWgByMeeting(meeting);
    if (!wgId) {
      console.warn(
        `${WARN}Cannot guess the working group for meeting '${topic}'`
      );
      continue;
    }

    const dateTime = new Date(Date.parse(start_time!));
    const timeZone = "America/Los_Angeles";
    const yyyy = dateTime.toLocaleString("en-US", {
      timeZone,
      year: "numeric",
    });
    const mm = dateTime.toLocaleString("en-US", {
      timeZone,
      month: "2-digit",
    });
    const dd = dateTime.toLocaleString("en-US", {
      timeZone,
      day: "2-digit",
    });
    const date = `${yyyy}-${mm}-${dd}`;

    // Now determine if it has already been uploaded
    const uploaded = categorizedVideos[wgId].some((a) => a.date === date);
    if (uploaded) {
      continue;
    }
    pending.push({ meeting, wgId });
  }
  return pending;
}
