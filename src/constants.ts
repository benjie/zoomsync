import { WorkingGroup } from "./interfaces";

// The default description for all videos; overwrite on per-wg basis using the `ytDescription` property
const DEFAULT_UPLOAD_DESCRIPTION = `\
GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data. GraphQL provides a complete and understandable description of the data in your API, gives clients the power to ask for exactly what they need and nothing more, makes it easier to evolve APIs over time, and enables powerful developer tools. Get Started Here: https://graphql.org/\
`;
export const ZOOM_USER_ID = "410467";
export const YOUTUBE_CHANNEL_ID = "UCERcwLeheOXp_u61jEXxHMA";

export const workingGroups = Object.freeze({
  WG: wg({
    name: "GraphQL Working Group",
    aliases: ["Working Group Meeting"],
    repo: "https://github.com/graphql/graphql-wg",
    subtitles: [
      {
        dateMin: 1,
        dateMax: 7,
        dow: "Thu",
        label: "(Primary)",
      },
      {
        dateMin: 7,
        dateMax: 13,
        dow: "Wed",
        label: "(Secondary, APAC)",
      },
      {
        dateMin: 15,
        dateMax: 21,
        dow: "Thu",
        label: "(Secondary, EU)",
      },
    ],
  }),
  JS: wg({
    name: "GraphQL.js Working Group",
    aliases: ["GraphQL js Working Group"],
    repo: "https://github.com/graphql/graphql-js",
    max: 1,
  }),
  GRAPHIQL: wg({
    name: "GraphiQL Working Group",
    repo: "https://github.com/graphql/graphiql",
    max: 1,
  }),
  INCREMENTAL: wg({
    name: "Incremental Delivery Working Group",
    aliases: ["Incremental Delivery WG", "Incremental Delivery"],
    repo: "https://github.com/robrichard/defer-stream-wg",
  }),
  COMPOSITE: wg({
    name: "Composite Schemas Working Group",
    aliases: ["Composite Schemas WG"],
    repo: "https://github.com/graphql/composite-schemas-wg",
    max: 5,
  }),
  INPUT_UNIONS: wg({
    name: "Input Unions Working Group",
    aliases: ["Input Unions"],
    repo: "https://github.com/graphql/graphql-wg/blob/main/rfcs/InputUnion.md",
    max: 1,
  }),
  HTTP: wg({
    name: "GraphQL-over-HTTP Working Group",
    aliases: [
      "GraphQL over HTTP Working Group",
      "GraphQL over HTTP",
      "GraphQL-over-HTTP",
    ],
    repo: "https://github.com/graphql/graphql-over-http",
    max: 1,
  }),
  METADATA: wg({
    name: "Metadata Working Group",
    repo: "https://github.com/graphql/graphql-spec/issues/300",
    max: 1,
  }),
  CCN: wg({
    name: "Nullability WG",
    aliases: ["Client Controlled Nullability"],
    repo: "https://github.com/graphql/nullability-wg",
  }),
  COMMUNITY: wg({
    name: "Community Working Group",
    aliases: ["Community WG"],
    repo: "https://github.com/graphql/community-wg",
    max: 1,
  }),
  OTEL: wg({
    name: "OTel Working Group",
    aliases: ["OTel WG"],
    repo: "https://github.com/graphql/otel-wg",
    max: 1,
  }),
  IGNORE_CONFERENCE_TALKS: wg({
    name: "CONFERENCE TALKS",
    repo: "",
    ignore: true,
  }),
  IGNORE_MEETUPS: wg({
    name: "MEETUPS",
    repo: "",
    ignore: true,
  }),
  IGNORE_GRAPHQL_LONDON: wg({
    name: "GraphQL London",
    repo: "",
    ignore: true,
  }),
  IGNORE_LIVESTREAMS: wg({
    name: "Livestreams",
    repo: "",
    ignore: true,
  }),
  IGNORE_GRAPHQLCONF2023: wg({
    name: "GraphQLConf",
    repo: "",
    ignore: true,
  }),
  IGNORE_GRAPHQLCONF2024: wg({
    name: "GraphQLConf",
    repo: "",
    ignore: true,
  }),
});

export const playlistIds: { [key in keyof typeof workingGroups]: string } = {
  WG: "PLP1igyLx8foH30_sDnEZnxV_8pYW3SDtb",
  JS: "PLP1igyLx8foHghwopNuQM7weyP5jR147I",
  GRAPHIQL: "PLP1igyLx8foGJaxw3z0rlUMAuXu7kcsVm",
  INCREMENTAL: "PLP1igyLx8foHTSNBi4tKUByY5kz4pqz1u",
  COMPOSITE: "PLP1igyLx8foFjxyTg6wPn4pUkZwuAk2GR",
  INPUT_UNIONS: "PLP1igyLx8foH4M0YAbVqpSo2fS1ElvNVD",
  HTTP: "PLP1igyLx8foEz9127xc0SsabIrbTMt9g5",
  METADATA: "PLP1igyLx8foF5nZFcwhvKszPMK_LpgjDf",
  IGNORE_CONFERENCE_TALKS: "PLP1igyLx8foGJrtkgYL9nunvC5qMXTVaa",
  IGNORE_MEETUPS: "PLP1igyLx8foF0ToOOgjdDnx2Z8stuSIpw",
  CCN: "PLP1igyLx8foFPThkIGEUVbne2_DBwgQke",
  COMMUNITY: "PLP1igyLx8foHhWZk2u1SthsW1weH3VA7l",
  OTEL: "PLP1igyLx8foFO2xFpWp7IturLnInoyWv1",
  IGNORE_GRAPHQL_LONDON: "PLP1igyLx8foEZXJIBbWS3SR7ylRK1yxff",
  IGNORE_LIVESTREAMS: "PLP1igyLx8foG5294jnyQV_R1Hg8ItkUGF",
  IGNORE_GRAPHQLCONF2023: "PLP1igyLx8foE9SlDLI1Vtlshcon5r1jMJ",
  IGNORE_GRAPHQLCONF2024: "PLP1igyLx8foEO0qsyk3IFn1peYSVGDBFA",
};

export const VIDEO_IGNORE_LIST = ["bInp--btyYg", "GFAaBIok2qQ"];

/******************************************************************************/

/** In general, videos under 15 minutes tend to be one person waiting for a call to start */
export const MIN_DURATION_MINUTES = 15;
/** In general, videos under 50MB tend to be one person waiting for a call to start */
export const MIN_FILE_SIZE_BYTES = 38_500_000;

export const ZOOM_API_URL = "https://api.zoom.us/v2";
export const ZOOM_AUTHORIZE_URL = "https://zoom.us/oauth/authorize";
export const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token";

export const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/auth";
export const GOOGLE_TOKEN_URL = "https://accounts.google.com/o/oauth2/token";

function wg(
  spec: Partial<WorkingGroup> & Pick<WorkingGroup, "name" | "repo">
): WorkingGroup {
  return {
    aliases: [],
    ytDescription: DEFAULT_UPLOAD_DESCRIPTION,
    ...spec,
  };
}
