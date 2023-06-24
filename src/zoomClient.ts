import axios from "axios";
import { GlobalContext } from "./interfaces";
import { ZOOM_API_URL } from "./constants";
import { stringify } from "node:querystring";
import { paths } from "./zoomApiSchema";

export function basicAuth(ctx: GlobalContext) {
  const { SECRETS } = ctx;
  const b64 = Buffer.from(
    `${SECRETS.ZOOM_CLIENT_ID}:${SECRETS.ZOOM_CLIENT_SECRET}`
  ).toString("base64");
  return `Basic ${b64}`;
}

export type Meeting = Exclude<
  paths["/users/{userId}/recordings"]["get"]["responses"]["200"]["content"]["application/json"]["meetings"],
  undefined
>[number];
export async function getZoomRecordings(
  ctx: GlobalContext,
  monthsAgo = 0
): Promise<Meeting[]> {
  const from = new Date();
  from.setMonth(from.getMonth() - monthsAgo);
  from.setMilliseconds(0);
  from.setSeconds(0);
  from.setMinutes(0);
  from.setHours(12);
  from.setDate(1);
  const to = new Date(+from);
  to.setMonth(to.getMonth() + 1);

  let all: Meeting[] = [];
  let nextPageToken = "";
  do {
    const nextResult = await get(
      ctx,
      "/users/me/recordings" as unknown as "/users/{userId}/recordings",
      {
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
        page_size: 3,
        next_page_token: nextPageToken,
      }
    );
    nextPageToken = nextResult.next_page_token ?? "";
    const meetings: Meeting[] = nextResult.meetings!;
    all.push(...meetings);
  } while (nextPageToken);
  return all;
}

// Constrained form of 'paths' for just those that we can get()
type gettablePaths = {
  [k in keyof paths as paths[k] extends {
    get: {
      parameters: {
        query?: Record<string, any>;
      };
      responses: {
        200: {
          content: {
            "application/json": Record<string, any>;
          };
        };
      };
    };
  }
    ? k
    : never]: paths[k];
};

async function get<const TPath extends keyof gettablePaths>(
  ctx: GlobalContext,
  path: TPath,
  params: gettablePaths[TPath]["get"]["parameters"]["query"]
): Promise<
  gettablePaths[TPath]["get"]["responses"][200]["content"]["application/json"]
> {
  const url = `${ZOOM_API_URL}${path}?${stringify(params as any)}`;
  console.log(`Loading ${url}...`);
  const response = await axios<
    gettablePaths[TPath]["get"]["responses"][200]["content"]["application/json"]
  >({
    method: "GET",
    url,
    headers: {
      Authorization: `Bearer ${ctx.zoomToken}`,
      Accept: "application/json",
    },
  });

  if (response.status !== 200) {
    console.error(response.data);
    throw new Error(`Request failed with status code '${response.status}'`);
  }

  return response.data;
}
