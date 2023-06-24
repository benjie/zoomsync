import { YOUTUBE_CHANNEL_ID } from "./constants";
import { GlobalContext } from "./interfaces";
import { google, youtube_v3 } from "googleapis";

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
  } while (pageToken);
  for (const item of all) {
    console.log(item.snippet?.title, item.snippet?.publishedAt);
  }
}
