# Hundir la Flota (Battleship)

A web-based Battleship game implemented in JavaScript using the MVC pattern. Players place ships on a 10x10 grid, then take turns shooting at the AI's board to sink all ships.

## Files
- `index.html`: HTML structure for the game.
- `barcos.js`: Defines ship data (name, size).
- `main.js`: Game logic and controller.
- `modelo.js`: Model classes (`Barco`, `Tablero`) for game state.
- `vista.js`: View functions for rendering the UI.

## How to Run
1. Place all files in a directory.
2. Serve the files using a local server (e.g., `npx http-server` or VS Code Live Server).
3. Open `index.html` in a browser.
4. Select ships, use `H`/`V` keys for orientation, and click to place them.
5. Click "Jugar" and use the form to shoot at the AI's board.

## Gameplay
- Place 5 ships (Portaaviones, Acorazado, Crucero, Submarino, Destructor) on your board.
- Shoot at the AI's board by entering coordinates (0–9).
- The AI shoots randomly, continuing if it hits or sinks a ship.
- The game ends when all ships on one side are sunk.