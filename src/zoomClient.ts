import axios from "axios";
import { GlobalContext } from "./interfaces";
import { ZOOM_API_URL } from "./constants";
import { stringify } from "node:querystring";

export function basicAuth(ctx: GlobalContext) {
  const { SECRETS } = ctx;
  const b64 = Buffer.from(
    `${SECRETS.ZOOM_CLIENT_ID}:${SECRETS.ZOOM_CLIENT_SECRET}`
  ).toString("base64");
  return `Basic ${b64}`;
}

export async function getZoomRecordings(ctx: GlobalContext, monthsAgo = 0) {
  const from = new Date();
  from.setMonth(from.getMonth() - monthsAgo);
  from.setMilliseconds(0);
  from.setSeconds(0);
  from.setMinutes(0);
  from.setHours(12);
  from.setDate(1);
  const to = new Date(+from);
  to.setMonth(to.getMonth() + 1);
  const { items } = await getAll(
    ctx,
    "/users/me/recordings",
    {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
      page_size: 3,
    },
    "meetings"
  );
  return items;
}

async function get<TData>(
  ctx: GlobalContext,
  path: string,
  params: Record<string, string | number>
) {
  const url = `${ZOOM_API_URL}${path}?${stringify(params)}`;
  console.log(`Loading ${url}...`);
  return await axios<TData>({
    method: "GET",
    url,
    headers: {
      Authorization: `Bearer ${ctx.zoomToken}`,
      Accept: "application/json",
    },
  });
}

async function getAll<
  TData extends Record<string, any>,
  TListKey extends keyof TData
>(
  ctx: GlobalContext,
  url: string,
  params: Record<string, string | number>,
  listKey: TListKey
): Promise<{ items: TData[TListKey] }> {
  let all: any = [];
  let nextPageToken = "";
  do {
    const nextResult = await get<TData & { next_page_token: string }>(
      ctx,
      url,
      {
        ...params,
        next_page_token: nextPageToken,
      }
    );
    nextPageToken = nextResult.data.next_page_token;
    all.push(...(nextResult.data[listKey] as any[]));
  } while (nextPageToken);
  return { items: all };
}
