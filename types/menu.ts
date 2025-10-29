export interface Servers {
  games: Server[];
}

export interface Server {
  name: string;
  id: string;
  players: number;
}

export interface ErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}
