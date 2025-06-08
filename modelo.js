class Casilla {
  constructor(x, y) {
    this.x = x; // Coordenada x (columna)
    this.y = y; // Coordenada y (fila)
    this.barco = null; // Referencia al barco que ocupa la casilla, si hay uno
    this.disparado = false; // Indica si la casilla ha sido atacada
  }

  // Marca la casilla como ocupada por un barco
  colocarBarco(barco) {
    this.ocupada = true;
    this.barco = barco;
  }

  // Ataca la casilla, marcándola como atacada
  atacar() {
    this.disparado = true;
  }

  // Devuelve el estado de la casilla como un objeto JSON
  toJSON() {
    return {
      x: this.x,
      y: this.y,
      barco: this.barco ? true : false,
      disparado: this.disparado
    };
  }

  // Crea una casilla a partir de un objeto JSON
  static fromJSON(json) {
    const casilla = new Casilla(json.x, json.y);
    casilla.barco = json.barco;
    casilla.disparado = json.disparado;
    return casilla;
  }

  fueTocada() {
    return this.disparado;
  }
}

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
    this.casillas = Array.from({ length: filas }, () =>
      Array.from({ length: columnas }, () => new Casilla())
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
      this.casillas[fila][col].colocarBarco(barco);
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
        this.casillas[fila][col].ocupada
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
    if (this.casillas[fila][col].disparado) {
      return null; // Ya disparado aquí
    }
    this.casillas[fila][col].atacar();
    const barco = this.casillas[fila][col].barco;
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
    } while (this.casillas[fila][col].disparado);
    return [fila, col];
  }

  // Devuelve true si todos los barcos están hundidos
  todosHundidos() {
    return this.barcos.every(barco => barco.estáHundido());
  }

  // Devuelve una vista del tablero para mostrar la IA (sin mostrar barcos no tocados)
  obtenerVistaOculta() {
    return this.casillas.map(fila =>
      fila.map(celda => {
        if (!celda.fueTocada()) return null;
        if (celda.barco && celda.disparado) return "X";
        return "agua";
      })
    );
  }

  // Devuelve el estado del tablero como un objeto JSON
  toJSON() {
    return {
      casillas: this.casillas,
      barcos: this.barcos
    };
  }

  // Crea un tablero a partir de un objeto JSON
  static fromJSON(json) {
    const tablero = new Tablero(10, 10);
    // Reconstruct casillas as proper Casilla objects
    tablero.casillas = json.casillas.map((fila, x) =>
      fila.map((celda, y) => {
        const nuevaCasilla = new Casilla(x, y);
        nuevaCasilla.barco = celda.barco;
        nuevaCasilla.disparado = celda.disparado;
        return nuevaCasilla;
      })
    );
    tablero.barcos = json.barcos;
    return tablero;
  }
}