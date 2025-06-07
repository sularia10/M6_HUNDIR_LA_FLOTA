// modelo.js

export class Barco {
  constructor(nombre, tamaño) {
    this.nombre = nombre;
    this.tamaño = tamaño;
    this.posiciones = []; // Array de celdas ocupadas [{fila, col}]
    this.hits = 0; // Cuántos impactos ha recibido
  }

  // Añade posiciones al barco (para saber dónde está)
  setPosiciones(posiciones) {
    this.posiciones = posiciones;
  }

  // Marca un impacto en una posición
  recibirImpacto(fila, col) {
    for (const pos of this.posiciones) {
      if (pos.fila === fila && pos.col === col) {
        this.hits++;
        return true;
      }
    }
    return false;
  }

  // Devuelve si el barco está hundido (todos los impactos)
  estáHundido() {
    return this.hits >= this.tamaño;
  }
}

export class Tablero {
  constructor(filas, columnas) {
    this.filas = filas;
    this.columnas = columnas;
    // Matriz con objetos casilla: { barco: Barco o null, disparado: boolean }
    this.celdas = Array.from({ length: filas }, () =>
      Array.from({ length: columnas }, () => ({ barco: null, disparado: false }))
    );
    this.barcos = []; // Lista de barcos colocados
  }

  // Intenta colocar barco manualmente, devuelve true si se colocó
  colocarBarcoManual(barco, filaInicio, colInicio, horizontal) {
    if (!this.puedeColocar(barco.tamaño, filaInicio, colInicio, horizontal)) {
      return false;
    }

    const posiciones = [];
    for (let i = 0; i < barco.tamaño; i++) {
      const fila = horizontal ? filaInicio : filaInicio + i;
      const col = horizontal ? colInicio + i : colInicio;
      this.celdas[fila][col].barco = barco;
      posiciones.push({ fila, col });
    }
    barco.setPosiciones(posiciones);
    this.barcos.push(barco);
    return true;
  }

  // Revisa si se puede colocar sin salir del tablero ni superponerse
  puedeColocar(tamaño, filaInicio, colInicio, horizontal) {
    for (let i = 0; i < tamaño; i++) {
      const fila = horizontal ? filaInicio : filaInicio + i;
      const col = horizontal ? colInicio + i : colInicio;
      if (
        fila < 0 ||
        fila >= this.filas ||
        col < 0 ||
        col >= this.columnas ||
        this.celdas[fila][col].barco !== null
      ) {
        return false;
      }
    }
    return true;
  }

  // Coloca todos los barcos aleatoriamente (para la IA)
  colocarBarcosAleatorio(barcosData) {
    for (const datoBarco of barcosData) {
      let colocado = false;
      while (!colocado) {
        const horizontal = Math.random() < 0.5;
        const filaInicio = Math.floor(Math.random() * this.filas);
        const colInicio = Math.floor(Math.random() * this.columnas);
        const barco = new Barco(datoBarco.name, datoBarco.size);
        colocado = this.colocarBarcoManual(barco, filaInicio, colInicio, horizontal);
      }
    }
  }

  // Recibe disparo, devuelve 'agua', 'tocado' o 'hundido'
  recibirDisparo(fila, col) {
    if (this.celdas[fila][col].disparado) {
      return null; // Ya disparado aquí
    }
    this.celdas[fila][col].disparado = true;
    const barco = this.celdas[fila][col].barco;
    if (!barco) {
      return "agua";
    }
    barco.recibirImpacto(fila, col);
    if (barco.estáHundido()) {
      return "hundido";
    }
    return "tocado";
  }

  // Devuelve una casilla aleatoria que no ha sido disparada aún
  casillaAleatoriaNoDisparada() {
    let fila, col;
    do {
      fila = Math.floor(Math.random() * this.filas);
      col = Math.floor(Math.random() * this.columnas);
    } while (this.celdas[fila][col].disparado);
    return [fila, col];
  }

  // Devuelve true si todos los barcos están hundidos
  todosHundidos() {
    return this.barcos.every(barco => barco.estáHundido());
  }

  // Devuelve una vista del tablero para mostrar la IA (sin mostrar barcos no tocados)
  obtenerVistaOculta() {
    const vista = [];
    for (let f = 0; f < this.filas; f++) {
      const fila = [];
      for (let c = 0; c < this.columnas; c++) {
        const celda = this.celdas[f][c];
        if (!celda.disparado) {
          fila.push(null);
        } else if (celda.barco) {
          fila.push("X"); // Tocado o hundido
        } else {
          fila.push("agua");
        }
      }
      vista.push(fila);
    }
    return vista;
  }
}
