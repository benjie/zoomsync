import { EventEmitter } from "events";
import { Auth } from "googleapis";

export interface Secrets {
  PORT: string;

  ZOOM_CLIENT_ID: string;
  ZOOM_CLIENT_SECRET: string;
  ZOOM_SECRET_TOKEN: string;

  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

export interface GlobalContext {
  SECRETS: Secrets;
  eventEmitter: OurEventEmitter;
  zoomToken?: string;
  zoomRefreshToken?: string;
  googleOAuthClient: Auth.OAuth2Client;
  googleCredentials?: Auth.Credentials;
}

type BaseEventMap = Record<string, any>;
type EventMapKey<TEventMap extends BaseEventMap> = string & keyof TEventMap;
type EventCallback<TPayload> = (params: TPayload) => void;

interface TypedEventEmitter<TEventMap extends BaseEventMap>
  extends EventEmitter {
  addListener<TEventName extends EventMapKey<TEventMap>>(
    eventName: TEventName,
    callback: EventCallback<TEventMap[TEventName]>
  ): this;
  on<TEventName extends EventMapKey<TEventMap>>(
    eventName: TEventName,
    callback: EventCallback<TEventMap[TEventName]>
  ): this;
  once<TEventName extends EventMapKey<TEventMap>>(
    eventName: TEventName,
    callback: EventCallback<TEventMap[TEventName]>
  ): this;

  removeListener<TEventName extends EventMapKey<TEventMap>>(
    eventName: TEventName,
    callback: EventCallback<TEventMap[TEventName]>
  ): this;
  off<TEventName extends EventMapKey<TEventMap>>(
    eventName: TEventName,
    callback: EventCallback<TEventMap[TEventName]>
  ): this;

  emit<TEventName extends EventMapKey<TEventMap>>(
    eventName: TEventName,
    params: TEventMap[TEventName]
  ): boolean;
}

type EventMap = {
  /**
   * We have an access token again
   */
  zoomToken: {
    token: string;
  };

  googleCredentials: {
    credentials: Auth.Credentials;
  };
};

export type OurEventEmitter = TypedEventEmitter<EventMap>;

export interface WorkingGroup {
  name: string;
  aliases: string[];
  repo: string;
  subtitles?: Array<{
    dateMin: number;
    dateMax: number;
    label: string;
  }>;
  max?: number;
  ytDescription: string;
  /**
   * If this isn't really a working group and should be ignored, set true
   */
  ignore?: boolean;
}
