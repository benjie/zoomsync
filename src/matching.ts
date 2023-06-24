import { youtube_v3 } from "googleapis";
import { getPlaylists } from "./googleClient";
import { playlistIds, workingGroups } from "./constants";

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
      }
    } else if (wgFromTitle) {
      // TODO: add to playlist
      console.warn(
        `Video title '${title}' id '${videoId}' expected in playlist ${workingGroups[wgFromTitle].name}`
      );
    } else {
      console.warn(
        `Video title '${title}' id '${videoId}' unknown working group`
      );
    }
  }

  function guessWgByTitle(upload: youtube_v3.Schema$PlaylistItem) {
    const title = upload.snippet?.title;
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
            `Video ${upload.contentDetails
              ?.videoId!} matches title with multiple working groups!`
          );
        }
        guess = wgId;
      }
    }
    return guess as keyof typeof workingGroups | null;
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
