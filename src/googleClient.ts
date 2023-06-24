import { YOUTUBE_CHANNEL_ID } from "./constants";
import { GlobalContext } from "./interfaces";
import { google } from "googleapis";

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

  const uploadsChannelResult = await youtubeClient.playlistItems.list({
    part: ["id", "contentDetails", "snippet", "status"],
    playlistId: uploadsChannelId,
  });
  console.dir(uploadsChannelResult.data);
}
