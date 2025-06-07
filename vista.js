// vista.js

// Pinta un tablero en el div con id, recibe matriz celdas y función click y si se habilita click
export function mostrarTableroInteractivo(idDiv, celdas, funcionClick, habilitarClick = true) {
  const div = document.getElementById(idDiv);
  div.innerHTML = ""; // limpio

  for (let fila = 0; fila < celdas.length; fila++) {
    const filaDiv = document.createElement("div");
    filaDiv.style.display = "flex";
    for (let col = 0; col < celdas[fila].length; col++) {
      const celda = document.createElement("div");
      celda.style.width = "30px";
      celda.style.height = "30px";
      celda.style.border = "1px solid black";
      celda.style.textAlign = "center";
      celda.style.lineHeight = "30px";
      celda.style.userSelect = "none";
      celda.style.cursor = habilitarClick ? "pointer" : "default";

      const valor = celdas[fila][col];
      if (valor === null) {
        celda.style.backgroundColor = "lightblue"; // agua sin disparar
      } else if (valor === "agua") {
        celda.style.backgroundColor = "blue";
        celda.textContent = "";
      } else if (valor === "X") {
        celda.style.backgroundColor = "red";
        celda.textContent = "X";
      } else if (typeof valor === "object" && valor.barco) {
        celda.style.backgroundColor = "gray"; // barco visible para jugador
      }

      if (habilitarClick) {
        celda.addEventListener("click", () => funcionClick(fila, col));
      }

      filaDiv.appendChild(celda);
    }
    div.appendChild(filaDiv);
  }
}

// Muestra lista de barcos para seleccionar (botones)
export function mostrarBarcosParaSeleccion(barcos, funcionSeleccion) {
  const div = document.getElementById("barcos");
  div.innerHTML = "";
  barcos.forEach(barco => {
    const btn = document.createElement("button");
    btn.textContent = `${barco.name} (${barco.size})`;
    btn.onclick = () => funcionSeleccion(barco);
    div.appendChild(btn);
  });
}

// Muestra mensajes en el div mensaje
export function mostrarMensaje(texto) {
  const div = document.getElementById("mensaje");
  div.textContent = texto;
}

// Muestra el formulario para disparar
export function mostrarFormularioDisparo(funcionDisparo) {
  const div = document.getElementById("formularioDisparo");
  div.innerHTML = `
    <input type="number" id="inputFila" placeholder="Fila (0-9)" min="0" max="9" style="width:60px;" />
    <input type="number" id="inputCol" placeholder="Columna (0-9)" min="0" max="9" style="width:60px;" />
    <button id="botonDisparar">Disparar</button>
  `;

  const boton = document.getElementById("botonDisparar");
  boton.onclick = () => {
    const fila = parseInt(document.getElementById("inputFila").value);
    const col = parseInt(document.getElementById("inputCol").value);
    if (
      Number.isInteger(fila) &&
      fila >= 0 &&
      fila < 10 &&
      Number.isInteger(col) &&
      col >= 0 &&
      col < 10
    ) {
      funcionDisparo(fila, col);
    } else {
      mostrarMensaje("Coordenadas no válidas");
    }
  };
}
