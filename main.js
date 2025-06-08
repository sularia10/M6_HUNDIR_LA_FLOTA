import { Tablero, Barco } from "./modelo.js";
import { barcosJSON } from "./barcos.js";
import { mostrarTableroInteractivo, mostrarBarcosParaSeleccion, mostrarMensaje, mostrarFormularioDisparo } from "./vista.js";

const filas = 10;
const columnas = 10;

let tableroJugador = new Tablero(filas, columnas);
let tableroIA = new Tablero(filas, columnas);
tableroIA.colocarBarcosAleatorio(barcosJSON);

let barcoSeleccionado = null;
let colocados = 0;

const botonJugar = document.getElementById("jugar");
botonJugar.disabled = true;

function actualizarTableros() {
  // Para el jugador mostramos barcos visibles y disparos
  const vistaJugador = tableroJugador.celdas.map(fila => fila.map(celda => {
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
  // Solo dejamos visible el tablero, sin poder colocar más barcos
  mostrarTableroInteractivo("jugador", tableroJugador.celdas.map(fila => fila.map(celda => {
    if (celda.barco) return { barco: true };
    if (celda.disparado) return celda.barco ? "X" : "agua";
    return null;
  })), null, false);
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