import { WorkingGroup } from "./interfaces";

/** In general, videos under 15 minutes tend to be one person waiting for a call to start */
export const MIN_DURATION_MINUTES = 15;
/** In general, videos under 50MB tend to be one person waiting for a call to start */
export const MIN_FILE_SIZE_BYTES = 50_000_000;

export const ZOOM_API_URL = "https://api.zoom.us/v2";
export const ZOOM_AUTHORIZE_URL = "https://zoom.us/oauth/authorize";
export const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token";
export const ZOOM_USER_ID = "410467";

export const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/auth";
export const GOOGLE_TOKEN_URL = "https://accounts.google.com/o/oauth2/token";

export const YOUTUBE_CHANNEL_ID = "UCERcwLeheOXp_u61jEXxHMA";

function wg(
  spec: Partial<WorkingGroup> & Pick<WorkingGroup, "name" | "repo">
): WorkingGroup {
  return {
    aliases: [],
    // The default description for all videos
    ytDescription: `\
GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data. GraphQL provides a complete and understandable description of the data in your API, gives clients the power to ask for exactly what they need and nothing more, makes it easier to evolve APIs over time, and enables powerful developer tools. Get Started Here: https://graphql.org/\
`,
    ...spec,
  };
}

export const workingGroups = Object.freeze({
  WG: wg({
    name: "GraphQL Working Group",
    aliases: ["Working Group Meeting"],
    repo: "https://github.com/graphql/graphql-wg",
    subtitles: [
      {
        dateMin: 1,
        dateMax: 7,
        label: "(Primary)",
      },
      {
        dateMin: 7,
        dateMax: 13,
        label: "(Secondary, APAC)",
      },
      {
        dateMin: 15,
        dateMax: 21,
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
    aliases: ["Incremental Delivery WG"],
    repo: "https://github.com/robrichard/defer-stream-wg",
  }),
  COMPOSITE: wg({
    name: "Composite Schemas Working Group",
    repo: "https://github.com/graphql/composite-schemas-wg",
    max: 1,
  }),
  INPUT_UNIONS: wg({
    name: "Input Unions Working Group",
    aliases: ["Input Unions"],
    repo: "https://github.com/graphql/graphql-wg/blob/main/rfcs/InputUnion.md",
    max: 1,
  }),
  HTTP: wg({
    name: "GraphQL-over-HTTP Working Group",
    aliases: ["GraphQL over HTTP Working Group", "GraphQL over HTTP"],
    repo: "https://github.com/graphql/graphql-over-http",
    max: 1,
  }),
  METADATA: wg({
    name: "Metadata Working Group",
    repo: "https://github.com/graphql/graphql-spec/issues/300",
    max: 1,
  }),
  IGNORE_CONFERENCE_TALKS: wg({
    name: "CONFERENCE TALKS",
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
};
