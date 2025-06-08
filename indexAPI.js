
/***
 * CONEXIÓN A API
 */
import { Tablero } from './modelo.js';

const API_URL = 'http://localhost:3000';

export async function guardarPartida(datosPartida) {
    if (!datosPartida || !datosPartida.tableroJugador || !datosPartida.tableroIA) {
        throw new Error("Los tableros no están inicializados");
    }

    const partida = {
        id: Date.now().toString(),
        jugador: datosPartida.jugador,
        tableroJugador: datosPartida.tableroJugador.toJSON(),
        tableroIA: datosPartida.tableroIA.toJSON(),
        fecha: new Date().toISOString()
    };

    try {
        const response = await fetch(`${API_URL}/partidas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(partida)
        });

        if (!response.ok) throw new Error("Error al guardar la partida");

        const data = await response.json();
        console.log("Partida guardada con éxito:", data);
        return data.id;
    } catch (err) {
        console.error("Error al guardar:", err);
        throw err;
    }
}

export async function cargarPartida(idPartida) {
    try {
        const response = await fetch(`${API_URL}/partidas/${idPartida}`);
        if (!response.ok) throw new Error("No se encontró la partida");

        const data = await response.json();
        console.log("Partida cargada:", data);
        return data;
    } catch (err) {
        console.error("Error al cargar:", err);
        throw err;
    }
}

export function recuperaTablerosApi(partida) {
    if (!partida) throw new Error("No hay datos de partida");
    
    return {
        tableroJugador: Tablero.fromJSON(partida.tableroJugador),
        tableroIA: Tablero.fromJSON(partida.tableroIA),
        nombreJugador: partida.jugador
    };
}

export async function listarPartidas() {
    try {
        const response = await fetch(`${API_URL}/partidas`);
        if (!response.ok) throw new Error("Error al obtener las partidas");

        const partidas = await response.json();
        return partidas;
    } catch (err) {
        console.error("Error al listar partidas:", err);
        throw err;
    }
}
