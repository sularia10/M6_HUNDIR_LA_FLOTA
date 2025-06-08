// Pinta un tablero en el div con id, recibe matriz celdas y función click y si se habilita click
export function mostrarTableroInteractivo(idDiv, celdas, funcionClick, habilitarClick = true) {
  const div = document.getElementById(idDiv);
  div.innerHTML = ""; // limpio
  div.setAttribute("role", "grid"); // Accessibility: grid role

  for (let fila = 0; fila < celdas.length; fila++) {
    const filaDiv = document.createElement("div");
    filaDiv.style.display = "flex";
    filaDiv.setAttribute("role", "row"); // Accessibility: row role
    for (let col = 0; col < celdas[fila].length; col++) {
      const celda = document.createElement("div");
      celda.style.width = "30px";
      celda.style.height = "30px";
      celda.style.border = "1px solid black";
      celda.style.textAlign = "center";
      celda.style.lineHeight = "30px";
      celda.style.userSelect = "none";
      celda.style.cursor = habilitarClick ? "pointer" : "default";
      celda.setAttribute("role", "gridcell"); // Accessibility: gridcell role
      celda.setAttribute("aria-label", `Celda ${fila},${col}`); // Accessibility: label

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
  let selectedButton = null; // Track selected button
  barcos.forEach(barco => {
    const btn = document.createElement("button");
    btn.textContent = `${barco.name} (${barco.size})`;
    btn.onclick = () => {
      if (selectedButton) selectedButton.style.backgroundColor = ""; // Reset previous
      btn.style.backgroundColor = "yellow"; // Highlight
      selectedButton = btn;
      funcionSeleccion(barco);
    };
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
    <label for="inputFila">Fila:</label>
    <input type="number" id="inputFila" placeholder="Fila (0-9)" min="0" max="9" style="width:60px;" />
    <label for="inputCol">Columna:</label>
    <input type="number" id="inputCol" placeholder="Columna (0-9)" min="0" max="9" style="width:60px;" />
    <button id="botonDisparar">Disparar</button>
  `;

  const boton = document.getElementById("botonDisparar");
  boton.onclick = () => {
    const inputFila = document.getElementById("inputFila");
    const inputCol = document.getElementById("inputCol");
    const fila = parseInt(inputFila.value);
    const col = parseInt(inputCol.value);
    if (
      Number.isInteger(fila) &&
      fila >= 0 &&
      fila < 10 &&
      Number.isInteger(col) &&
      col >= 0 &&
      col < 10
    ) {
      funcionDisparo(fila, col);
      inputFila.value = ""; // Clear input
      inputCol.value = ""; // Clear input
    } else {
      mostrarMensaje("Coordenadas no válidas");
    }
  };
}