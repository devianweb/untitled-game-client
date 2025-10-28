import Camera from "./Camera";
import Game from "./Game";

export default class Menu {
  refreshButton: HTMLButtonElement;
  menu: HTMLDivElement;
  game: HTMLDivElement;
  serverTableBody: HTMLTableSectionElement;
  debugUI: HTMLDivElement;

  instance: Game;
  camera: Camera;

  url: string = "https://semiglazed-too-kimberlie.ngrok-free.dev";

  constructor(instance: Game, camera: Camera) {
    this.refreshButton = document.getElementById(
      "refresh-button"
    ) as HTMLButtonElement;
    this.menu = document.getElementById("menu") as HTMLDivElement;
    this.game = document.getElementById("game") as HTMLDivElement;
    this.serverTableBody = document.getElementById(
      "server-table-body"
    ) as HTMLTableSectionElement;
    this.debugUI = document.getElementById("debug-ui") as HTMLDivElement;

    this.instance = instance;
    this.camera = camera;

    this.getServerList();

    this.refreshButton.addEventListener("click", () => {
      this.getServerList();
    });
  }

  getServerList = async (): Promise<any> => {
    try {
      const res = await fetch(`${this.url}/api/1/games`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        mode: "cors",
      });
      const data = await res.json();
      this.renderServerRows(data.games);
      data.games.forEach((server: any) => {
        const joinButton = this.serverTableBody.querySelector(
          `button[data-server-id="${server.id}"]`
        ) as HTMLButtonElement;
        joinButton.addEventListener("click", () => {
          this.menu.style.display = "none";
          this.game.style.display = "block";
          this.debugUI.classList.remove("hidden");
          this.instance.start(server.id);
        });
      });
    } catch (error) {
      console.error("Error fetching server list:", error);
      this.serverTableBody.innerHTML = `<tr><td colspan="3" class="px-3 py-2 text-red-600">Error loading servers</td></tr>`;
    }
  };

  renderServerRows = (servers: any) => {
    if (!servers.length) {
      this.serverTableBody.innerHTML = `<tr><td colspan="3" class="px-3 py-2">No servers available</td></tr>`;
      return;
    }
    this.serverTableBody.innerHTML = servers
      .map(
        (server: any) =>
          `<tr class="*:text-gray-900 *:first:font-medium">
            <td class="px-3 py-2 whitespace-nowrap">${server.id}</td>
            <td class="px-3 py-2 whitespace-nowrap">${server.players}</td>
            <td class="px-3 py-2 whitespace-nowrap">
              <button data-server-id="${server.id}" class="px-6 py-3 rounded bg-orange-600 text-white font-semibold hover:bg-orange-500 transition font-pixelify">
                Join
              </button>
            </td>
          </tr>`
      )
      .join("");
  };
}
