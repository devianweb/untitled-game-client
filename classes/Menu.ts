import { ErrorResponse, Server, Servers } from "../types/menu";
import Camera from "./Camera";
import Game from "./Game";

export default class Menu {
  userId: string;

  refreshButton: HTMLButtonElement;
  createButton: HTMLButtonElement;
  menu: HTMLDivElement;
  game: HTMLDivElement;
  serverTableBody: HTMLTableSectionElement;
  debugUI: HTMLDivElement;
  errorMessage: HTMLParagraphElement;

  instance: Game;
  camera: Camera;

  url: string = "https://semiglazed-too-kimberlie.ngrok-free.dev";

  constructor(userId: string, instance: Game, camera: Camera) {
    this.refreshButton = document.getElementById(
      "refresh-button"
    ) as HTMLButtonElement;
    this.createButton = document.getElementById(
      "create-button"
    ) as HTMLButtonElement;
    this.menu = document.getElementById("menu") as HTMLDivElement;
    this.game = document.getElementById("game") as HTMLDivElement;
    this.serverTableBody = document.getElementById(
      "server-table-body"
    ) as HTMLTableSectionElement;
    this.debugUI = document.getElementById("debug-ui") as HTMLDivElement;
    this.errorMessage = document.getElementById(
      "error-message"
    ) as HTMLParagraphElement;

    this.userId = userId;
    this.instance = instance;
    this.camera = camera;

    this.getServersAndRenderTable();

    this.createButton.addEventListener("click", () => {
      const serverNameInput = document.getElementById(
        "server-name"
      ) as HTMLInputElement;
      const serverName = serverNameInput.value.trim();
      if (!serverName) {
        this.errorMessage.style.display = "block";
        this.errorMessage.textContent = "please enter a server name";
        return;
      }

      this.createServer(serverName).then((gameId) => {
        if (gameId !== null) {
          this.startGame(gameId);
        }
      });
    });

    this.refreshButton.addEventListener("click", () => {
      this.getServersAndRenderTable();
    });
  }

  startGame = (gameId: string) => {
    this.menu.style.display = "none";
    this.game.style.display = "block";
    this.debugUI.style.display = "block";
    this.instance.start(gameId);
  };

  createServer = async (name: string): Promise<string | null> => {
    try {
      const res = await fetch(`${this.url}/api/1/games/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ userId: this.userId, name: name }),
      });
      const data = await res.json();
      if (data.status >= 400) {
        const errorData = data as ErrorResponse;
        this.errorMessage.style.display = "block";
        this.errorMessage.textContent = errorData.detail;
        return null;
      }
      return data.gameId;
    } catch (error: any) {
      console.error("Error creating server:", error);
      this.errorMessage.style.display = "block";
      this.errorMessage.textContent = "Failed to create server: " + (error?.message || error);
      return null;
    }
  };

  getServerList = async (): Promise<Servers | null> => {
    try {
      const res = await fetch(`${this.url}/api/1/games`, {
        method: "GET",
        headers: {
          accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = (await res.json()) as Servers;
      return data;
    } catch (error) {
      console.error("Error fetching server list:", error);
      this.serverTableBody.innerHTML = `<tr><td colspan="3" class="px-3 py-2 text-red-600">Error loading servers</td></tr>`;
      return null;
    }
  };

  renderServerRows = (servers: Server[]) => {
    if (!servers.length) {
      this.serverTableBody.innerHTML = `<tr><td colspan="3" class="px-3 py-2">No servers available</td></tr>`;
      return;
    }
    this.serverTableBody.innerHTML = servers
      .map(
        (server: any) =>
          `<tr class="*:text-gray-900 *:first:font-medium">
            <td class="px-3 py-2 whitespace-nowrap">${server.name}</td>
            <td class="px-3 py-2 whitespace-nowrap">${server.players}</td>
            <td class="px-3 py-2 whitespace-nowrap">
              <button data-server-id="${server.id}" class="px-6 py-3 rounded bg-orange-600 text-white font-semibold hover:bg-orange-500 transition text-base">
                <svg class="size-5 rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m 14 5 l 7 7 m 0 0 l -7 7 m 7 -7 h -18"></path>
                </svg>
              </button>
            </td>
          </tr>`
      )
      .join("");
  };

  addEventListenersToJoinButtons = (games: any) => {
    games.forEach((server: any) => {
      const joinButton = this.serverTableBody.querySelector(
        `button[data-server-id="${server.id}"]`
      ) as HTMLButtonElement;
      joinButton.addEventListener("click", () => {
        this.startGame(server.id);
      });
    });
  };

  private getServersAndRenderTable() {
    const servers = this.getServerList();
    servers.then((servers) => {
      if (servers === null) return;
      this.renderServerRows(servers.games);
      this.addEventListenersToJoinButtons(servers.games);
    });
  }
}
