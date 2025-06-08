import { Tablero, Barco } from "./modelo.js";
import { barcosJSON } from "./barcos.js";
import { mostrarTableroInteractivo, mostrarBarcosParaSeleccion, mostrarMensaje, mostrarFormularioDisparo } from "./vista.js";
import { guardarPartida, cargarPartida, recuperaTablerosApi, listarPartidas } from './indexAPI.js';

const filas = 10;
const columnas = 10;

export let tableroJugador = new Tablero(filas, columnas);
export let tableroIA = new Tablero(filas, columnas);
tableroIA.colocarBarcosAleatorio(barcosJSON);

let barcoSeleccionado = null;
let colocados = 0;

const botonJugar = document.getElementById("jugar");
botonJugar.disabled = true;

function actualizarTableros() {
  // Para el jugador mostramos barcos visibles y disparos
  const vistaJugador = tableroJugador.casillas.map(fila => fila.map(celda => {
    if (celda.barco && !celda.disparado) return { barco: true };
    if (celda.barco && celda.disparado) return "X";
    if (!celda.barco && celda.disparado) return "agua";
    return null;
  }));

  mostrarTableroInteractivo("jugador", vistaJugador, colocarBarcoClick, colocados < barcosJSON.length);

  // Para la IA mostramos solo disparos (oculto barcos no tocados)
  const vistaIA = tableroIA.obtenerVistaOculta();
  mostrarTableroInteractivo("ia", vistaIA, null, false);
}

function colocarBarcoClick(fila, col) {
  if (!barcoSeleccionado) {
    mostrarMensaje("Selecciona un barco primero.");
    return;
  }
  const barco = new Barco(barcoSeleccionado.name, barcoSeleccionado.size);
  const exito = tableroJugador.colocarBarcoManual(barco, fila, col, horizontal);
  if (exito) {
    colocados++;
    mostrarMensaje(`Barco ${barco.nombre} colocado.`);
    barcoSeleccionado = null; // deselecciona para evitar colocar varios iguales
    if (colocados === barcosJSON.length) {
      mostrarMensaje("¡Todos los barcos colocados! Puedes jugar.");
      botonJugar.disabled = false;
      deshabilitarColocacion();
      mostrarFormularioDisparo(jugarTurnoJugador);
    }
  } else {
    mostrarMensaje("Posición no válida para ese barco.");
  }
  actualizarTableros();
}

function deshabilitarColocacion() {
    if (!tableroJugador || !tableroJugador.casillas) {
        console.error('Tablero no inicializado correctamente');
        return;
    }
    
    mostrarTableroInteractivo("jugador", tableroJugador.casillas.map(fila => 
        fila.map(celda => {
            if (celda.barco) return { barco: true };
            if (celda.disparado) return celda.barco ? "X" : "agua";
            return null;
        })
    ), null, false);
}

// Selección de barco desde botones
mostrarBarcosParaSeleccion(barcosJSON, barco => {
  barcoSeleccionado = barco;
  mostrarMensaje(`Seleccionaste: ${barco.name}`);
});

function jugarTurnoJugador(fila, col) {
  const resultado = tableroIA.recibirDisparo(fila, col);
  if (resultado === null) {
    mostrarMensaje("Ya disparaste ahí. Elige otra posición.");
    return;
  }
  actualizarTableros();

  if (resultado === "agua") {
    mostrarMensaje("¡Agua! Turno de la IA.");
    turnoIA();
  } else if (resultado === "tocado") {
    mostrarMensaje("¡Tocado! Puedes disparar otra vez.");
  } else if (resultado === "hundido") {
    mostrarMensaje("¡Hundido! Puedes disparar otra vez.");
  }

  if (tableroIA.todosHundidos()) {
    mostrarMensaje("¡Ganaste! Hundiste toda la flota enemiga.");
    botonJugar.disabled = true;
  }
}

function turnoIA() {
  let dispararDeNuevo = true;
  while (dispararDeNuevo) {
    const [fila, col] = tableroJugador.casillaAleatoriaNoDisparada();
    const resultado = tableroJugador.recibirDisparo(fila, col);
    actualizarTableros();
    if (resultado === "agua") {
      mostrarMensaje("IA disparó en " + fila + "," + col + ": Agua. Tu turno.");
      dispararDeNuevo = false;
    } else if (resultado === "tocado") {
      mostrarMensaje("IA disparó en " + fila + "," + col + ": Tocado. Sigue la IA.");
    } else if (resultado === "hundido") {
      mostrarMensaje("IA disparó en " + fila + "," + col + ": Hundido. Sigue la IA.");
    }
    if (tableroJugador.todosHundidos()) {
      mostrarMensaje("¡La IA ganó! Perdiste toda tu flota.");
      botonJugar.disabled = true;
      dispararDeNuevo = false;
    }
  }
}

botonJugar.onclick = () => {
  mostrarMensaje("Comienza la partida. Introduce coordenadas y dispara.");
  mostrarFormularioDisparo(jugarTurnoJugador);
};

actualizarTableros();
// Declaración única al inicio
let horizontal = true;

// Listener para cambiar orientación con H o V
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "h") {
    horizontal = true;
    mostrarMensaje("Orientación cambiada a Horizontal");
  } else if (event.key.toLowerCase() === "v") {
    horizontal = false;
    mostrarMensaje("Orientación cambiada a Vertical");
  }
});

async function actualizarListaPartidas() {
    const gamesList = document.getElementById('games-list');
    
    try {
        const partidas = await listarPartidas();
        
        if (!partidas || partidas.length === 0) {
            gamesList.innerHTML = '<p>No hay partidas guardadas</p>';
            return;
        }

        gamesList.innerHTML = partidas.map(partida => `
            <div class="game-card">
                <div class="game-info">
                    <span><strong>Jugador:</strong> ${partida.jugador}</span>
                    <span><strong>ID:</strong> ${partida.id}</span>
                </div>
                <button class="load-button" onclick="window.cargarPartidaGuardada('${partida.id}')">
                    Cargar Partida
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error al cargar lista de partidas:', error);
        mostrarMensaje('Error al cargar lista de partidas');
    }
}

window.cargarPartidaGuardada = async (id) => {
    try {
        const partida = await cargarPartida(id);
        const { tableroJugador: nuevoTableroJugador, tableroIA: nuevoTableroIA } = recuperaTablerosApi(partida);
        
        tableroJugador = nuevoTableroJugador;
        tableroIA = nuevoTableroIA;
        
        actualizarTableros();
        mostrarMensaje(`Partida de ${partida.jugador} cargada correctamente`);
    } catch (error) {
        console.error('Error al cargar:', error);
        mostrarMensaje('Error al cargar la partida');
    }
};

function inicializarControles() {
    document.getElementById('guardarPartida').addEventListener('click', async () => {
        const nombreJugador = prompt('Introduce tu nombre:', 'Jugador1');
        if (!nombreJugador) return;

        try {
            const datosPartida = {
                jugador: nombreJugador,
                tableroJugador: tableroJugador,
                tableroIA: tableroIA
            };

            const idPartida = await guardarPartida(datosPartida);
            mostrarMensaje(`Partida guardada con éxito. ID: ${idPartida}`);
            await actualizarListaPartidas(); // Update list after saving
        } catch (error) {
            console.error('Error al guardar:', error);
            mostrarMensaje('Error al guardar la partida');
        }
    });

    document.getElementById("cargarPartida").addEventListener("click", async () => {
        const id = prompt("Introduce el ID de la partida:");
        if (!id) return;
        
        try {
            const partida = await cargarPartida(id);
            const { tableroJugador: nuevoTableroJugador, tableroIA: nuevoTableroIA } = recuperaTablerosApi(partida);
            
            tableroJugador = nuevoTableroJugador;
            tableroIA = nuevoTableroIA;
            
            colocados = tableroJugador.barcos.length;
            if (colocados === barcosJSON.length) {
                botonJugar.disabled = false;
                deshabilitarColocacion();
            }
            
            actualizarTableros();
            mostrarMensaje('Partida cargada correctamente');
        } catch (error) {
            console.error('Error al cargar:', error);
            mostrarMensaje('Error al cargar la partida');
        }
    });

    // Initial load of saved games
    actualizarListaPartidas();
}

document.addEventListener('DOMContentLoaded', inicializarControles);