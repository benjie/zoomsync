import { YOUTUBE_CHANNEL_ID, playlistIds, workingGroups } from "./constants";
import { GlobalContext } from "./interfaces";
import { google, youtube_v3 } from "googleapis";
import { createReadStream } from "fs";

export async function getUploads(ctx: GlobalContext) {
  const youtubeClient = google.youtube({
    version: "v3",
    auth: ctx.googleOAuthClient,
  });
  const mainChannelResult = await youtubeClient.channels.list({
    part: [
      "id",
      "topicDetails",
      "brandingSettings",
      "contentDetails",
      "contentOwnerDetails",
    ],
    id: [YOUTUBE_CHANNEL_ID],
  });
  const channel = mainChannelResult.data.items?.[0];
  if (!channel) {
    throw new Error(`Couldn't find YouTube Channel!`);
  }
  const branding = channel.brandingSettings?.channel;
  const uploadsChannelId = channel.contentDetails?.relatedPlaylists?.uploads;
  console.log(
    `Processing videos from ${branding?.title} (uploads channel id = ${uploadsChannelId})...`
  );
  if (!uploadsChannelId) {
    throw new Error(`Couldn't find the uploads Channel!`);
  }

  let pageToken: string | undefined = undefined;
  const all: youtube_v3.Schema$PlaylistItem[] = [];
  do {
    const uploadsChannelResult = await youtubeClient.playlistItems.list({
      part: ["id", "contentDetails", "snippet", "status"],
      playlistId: uploadsChannelId,
      maxResults: 50,
      pageToken,
    });
    if (uploadsChannelResult.data.items) {
      all.push(...uploadsChannelResult.data.items);
    }
    pageToken = uploadsChannelResult.data.nextPageToken as string | undefined;
  } while (pageToken != null);
  for (const item of all) {
    console.log(item.snippet?.title, item.snippet?.publishedAt);
  }

  return all;
}

export async function getPlaylists(ctx: GlobalContext) {
  console.log("getPlaylists");
  const youtubeClient = google.youtube({
    version: "v3",
    auth: ctx.googleOAuthClient,
  });
  const playlists: {
    [playlistId: (typeof playlistIds)[keyof typeof playlistIds]]: {
      workingGroupId: keyof typeof workingGroups;
      videoIds: string[];
    };
  } = Object.create(null);
  for (const [wgId, playlistId] of Object.entries(playlistIds)) {
    let pageToken: string | undefined = undefined;
    const items: youtube_v3.Schema$PlaylistItem[] = [];
    do {
      const result = await youtubeClient.playlistItems.list({
        part: ["id", "contentDetails"],
        playlistId: playlistId,
        maxResults: 50,
        pageToken,
      });
      if (result.data.items) {
        items.push(...result.data.items);
      }
      result.data.items;
      pageToken = result.data.nextPageToken as string | undefined;
    } while (pageToken != null);
    playlists[playlistId] = {
      workingGroupId: wgId as any,
      videoIds: items.map((i) => i.contentDetails?.videoId!) ?? [],
    };
  }
  return playlists;
}

export async function uploadVideo(
  ctx: GlobalContext,
  filePath: string,
  snippet: youtube_v3.Schema$VideoSnippet,
  playlistId: string
) {
  const youtubeClient = google.youtube({
    version: "v3",
    auth: ctx.googleOAuthClient,
  });

  // TODO: should add retry logic!

  console.log(`Uploading...`);
  // Upload the video:
  const response = await youtubeClient.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet,
      status: {
        // Set to "private" to allow publishing later, or "unlisted" to be able to share
        privacyStatus: "public",
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: createReadStream(filePath),
    },
  });

  console.log(`Adding to playlist...`);
  // And add it to the playlist:
  await youtubeClient.playlistItems.insert({
    part: ["id", "snippet"],
    requestBody: {
      snippet: {
        playlistId,
        resourceId: {
          kind: "youtube#video",
          videoId: response.data.id!,
        },
      },
    },
  });
  console.log(`Uploaded!`);
}
