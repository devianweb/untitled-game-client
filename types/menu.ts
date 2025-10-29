export interface Servers {
  games: Server[];
}

export interface Server {
  name: string;
  id: string;
  players: number;
}
