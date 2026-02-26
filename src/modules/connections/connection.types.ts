import mongoose, { Document } from "mongoose";
import type { IConsumerPopulated } from "../consumers/consumer.types.ts";

export const CONNECTION_STATUSES = ["connected", "disconnected"] as const;
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

export const CONNECTION_TYPES = ["residential", "commercial"] as const;
export type ConnectionType = (typeof CONNECTION_TYPES)[number];

// consumer, meterNumber, address, connectionDate, type: residential | , status: active | disconnected
export interface IConnection {
  consumer: mongoose.Types.ObjectId;
  meterNumber: number;
  address: string;
  connectionDate: Date;
  type: ConnectionType;
  status: ConnectionStatus;
}

export interface IConnectionDocument extends IConnection, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

/** Lean version without population */
export interface IConnectionLean {
  _id: string;
  consumer: mongoose.Types.ObjectId;
  meterNumber: number;
  address: string;
  connectionDate: Date;
  type: ConnectionType;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
}

/** Connection → consumer populated */
export interface IConnectionPopulated {
  _id: mongoose.Types.ObjectId;
  consumer: IConsumerPopulated;
  meterNumber: number;
  address: string;
  connectionDate: Date;
  type: ConnectionType;
  status: ConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
