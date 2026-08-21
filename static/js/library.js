const CLAVE_SEGUIMIENTO = "bdp_read_books";
const TIEMPO_BLOQUEO_MARCAR = 1000;

const librosGuardados = JSON.parse(localStorage.getItem(CLAVE_SEGUIMIENTO) || "[]");
const librosLeidos = new Set(librosGuardados);
const tarjetas = Array.from(document.querySelectorAll("[data-book-id]"));
const contadorResumen = document.querySelector("[data-summary-count]");
const buscador = document.querySelector("[data-buscador]");
const filtros = Array.from(document.querySelectorAll("[data-filtro]"));
const botonLimpiar = document.querySelector("[data-limpiar-filtros]");
const resultadoFiltros = document.querySelector("[data-resultado-filtros]");

function guardarSeguimiento() {
  localStorage.setItem(CLAVE_SEGUIMIENTO, JSON.stringify(Array.from(librosLeidos)));
}

function actualizarTarjeta(tarjeta) {
  const idLibro = tarjeta.dataset.bookId;
  const boton = tarjeta.querySelector("[data-read-toggle]");
  const estaLeido = librosLeidos.has(idLibro);

  tarjeta.classList.toggle("is-read", estaLeido);
  boton.textContent = estaLeido ? "Leido" : "Marcar como leido";
  boton.setAttribute("aria-pressed", String(estaLeido));
}

function actualizarResumen() {
  if (contadorResumen) {
    contadorResumen.textContent = String(librosLeidos.size);
  }
}

function obtenerValorFiltro(nombreFiltro) {
  const filtro = filtros.find((selector) => selector.dataset.filtro === nombreFiltro);
  return filtro ? filtro.value : "todos";
}

function coincideConFiltro(tarjeta, nombreFiltro) {
  const valorFiltro = obtenerValorFiltro(nombreFiltro);
  return valorFiltro === "todos" || tarjeta.dataset[nombreFiltro] === valorFiltro;
}

function coincideConBusqueda(tarjeta) {
  const textoBuscado = buscador ? buscador.value.trim().toLowerCase() : "";
  const titulo = tarjeta.dataset.titulo.toLowerCase();

  return textoBuscado === "" || titulo.includes(textoBuscado);
}

function aplicarFiltros() {
  let cantidadVisible = 0;

  tarjetas.forEach((tarjeta) => {
    const debeMostrarse =
      coincideConBusqueda(tarjeta) &&
      coincideConFiltro(tarjeta, "materia") &&
      coincideConFiltro(tarjeta, "grado") &&
      coincideConFiltro(tarjeta, "anio") &&
      coincideConFiltro(tarjeta, "idioma");

    tarjeta.hidden = !debeMostrarse;

    if (debeMostrarse) {
      cantidadVisible += 1;
    }
  });

  if (resultadoFiltros) {
    resultadoFiltros.textContent =
      cantidadVisible === 1
        ? "Mostrando 1 libro."
        : `Mostrando ${cantidadVisible} libros.`;
  }
}

tarjetas.forEach((tarjeta) => {
  const boton = tarjeta.querySelector("[data-read-toggle]");

  actualizarTarjeta(tarjeta);

  boton.addEventListener("click", () => {
    if (boton.disabled) return;

    const idLibro = tarjeta.dataset.bookId;

    if (librosLeidos.has(idLibro)) {
      librosLeidos.delete(idLibro);
    } else {
      librosLeidos.add(idLibro);
    }

    guardarSeguimiento();
    actualizarTarjeta(tarjeta);
    actualizarResumen();

    boton.disabled = true;
    window.setTimeout(() => {
      boton.disabled = false;
    }, TIEMPO_BLOQUEO_MARCAR);
  });
});

if (buscador) {
  buscador.addEventListener("input", aplicarFiltros);
}

filtros.forEach((filtro) => {
  filtro.addEventListener("change", aplicarFiltros);
});

if (botonLimpiar) {
  botonLimpiar.addEventListener("click", () => {
    if (buscador) {
      buscador.value = "";
    }

    filtros.forEach((filtro) => {
      filtro.value = "todos";
    });

    aplicarFiltros();
  });
}

actualizarResumen();
aplicarFiltros();
