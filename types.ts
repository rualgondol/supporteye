
export enum Language {
  EN = 'EN',
  FR = 'FR'
}

export enum UserRole {
  TECHNICIAN = 'TECHNICIAN',
  CLIENT = 'CLIENT'
}

export enum SessionStatus {
  IDLE = 'IDLE',
  WAITING = 'WAITING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  COMPLETED = 'COMPLETED'
}

export interface Annotation {
  id: string;
  type: 'pointer' | 'rect' | 'circle' | 'arrow' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  text?: string;
}

export interface SessionData {
  id: string;
  clientPhone: string;
  carrier: string;
  token: string;
  createdAt: number;
  status: SessionStatus;
}
