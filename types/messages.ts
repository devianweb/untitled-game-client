import type { ControlInputs } from "./controls";
import type { PlayerState } from "./player";

export interface PositionPayload extends PlayerState {}

export interface PositionMessage {
  type: "POSITION";
  userId: string;
  payload: PositionPayload;
}

export interface AuthoritativePlayersState {
  [userId: string]: PositionPayload;
}

export interface AuthoritativeMessage {
  type: "AUTHORITATIVE";
  seqId: number;
  userId: string;
  payload: {
    players: AuthoritativePlayersState;
  };
}

export type ServerMessage = PositionMessage | AuthoritativeMessage;

export interface InputMessage {
  userId: string;
  type: "INPUT";
  seqId: number;
  payload: ControlInputs;
}

export type OutboundMessage = InputMessage; // Extend later if needed
