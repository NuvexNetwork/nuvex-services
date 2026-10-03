export interface WebsocketStatus {
  enabled: false;
  reason: string;
}

export function websocketStatus(): WebsocketStatus {
  return {
    enabled: false,
    reason: "Websocket updates are not implemented. Clients poll the read API.",
  };
}
