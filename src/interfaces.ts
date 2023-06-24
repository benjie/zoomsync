import { EventEmitter } from "events";

export interface Secrets {
  PORT: string;

  ZOOM_CLIENT_ID: string;
  ZOOM_CLIENT_SECRET: string;
  ZOOM_SECRET_TOKEN: string;
}

export interface GlobalContext {
  SECRETS: Secrets;
  eventEmitter: OurEventEmitter;
  zoomToken?: string;
  zoomRefreshToken?: string;
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
  token: {
    token: string;
  };
};

export type OurEventEmitter = TypedEventEmitter<EventMap>;
