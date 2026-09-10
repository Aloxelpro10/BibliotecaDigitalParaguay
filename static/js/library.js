const CLAVE_SEGUIMIENTO = "bdp_read_books";
const CLAVE_FAVORITOS = "bdp_favorite_books";
const TIEMPO_BLOQUEO_MARCAR = 1000;

const librosGuardados = JSON.parse(localStorage.getItem(CLAVE_SEGUIMIENTO) || "[]");
const librosLeidos = new Set(librosGuardados);
const tarjetas = Array.from(document.querySelectorAll("[data-book-id]"));
const contadorResumen = document.querySelector("[data-summary-count]");
const buscador = document.querySelector("[data-buscador]");
const filtros = Array.from(document.querySelectorAll("[data-filtro]"));
const botonFiltrar = document.querySelector("[data-aplicar-filtros]");
const resultadoFiltros = document.querySelector("[data-resultado-filtros]");

function guardarSeguimiento() {
  localStorage.setItem(CLAVE_SEGUIMIENTO, JSON.stringify(Array.from(librosLeidos)));
}

function guardarFavoritos(librosFavoritos) {
  localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(librosFavoritos));
}

function obtenerFavoritos() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_FAVORITOS) || "[]");
  } catch (error) {
    return [];
  }
}

function construirDatosLibro(tarjeta) {
  const imageElement = tarjeta.querySelector("img");
  const titulo = tarjeta.dataset.titulo || tarjeta.querySelector("h2")?.textContent?.trim() || "Sin título";

  return {
    id: tarjeta.dataset.bookId,
    titulo,
    categoria: tarjeta.querySelector(".book-category")?.textContent?.trim() || "",
    materia: tarjeta.dataset.materia || "",
    grado: tarjeta.dataset.grado || "",
    anio: tarjeta.dataset.anio || "",
    idioma: tarjeta.dataset.idioma || "",
    descripcion: tarjeta.querySelector("p")?.textContent?.trim() || "",
    imagen: imageElement ? imageElement.src : "",
    href: tarjeta.querySelector("a")?.href || window.location.href,
    origen: "recomendados"
  };
}

function actualizarEstadoFavorito(tarjeta) {
  const botonFavorito = tarjeta.querySelector(".favorite-button");
  if (!botonFavorito) return;

  const favoritos = obtenerFavoritos();
  const estaFavorito = favoritos.some((libro) => libro.id === tarjeta.dataset.bookId);

  botonFavorito.classList.toggle("is-favorite", estaFavorito);
  botonFavorito.textContent = estaFavorito ? "Favorito ✓" : "Añadir a Favoritos";
  botonFavorito.setAttribute("aria-pressed", String(estaFavorito));
  tarjeta.dataset.favorito = estaFavorito ? "si" : "no";
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
  return filtro ? filtro.value.trim().toLowerCase() : "todos";
}

function coincideConFiltro(tarjeta, nombreFiltro) {
  const valorFiltro = obtenerValorFiltro(nombreFiltro);
  const etiquetaLibro = (tarjeta.dataset[nombreFiltro] || "").trim().toLowerCase();

  return valorFiltro === "todos" || etiquetaLibro === valorFiltro;
}

function coincideConBusqueda(tarjeta) {
  const textoBuscado = buscador ? buscador.value.trim().toLowerCase() : "";
  const titulo = (tarjeta.dataset.titulo || "").toLowerCase();

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
    tarjeta.classList.toggle("is-filtered-out", !debeMostrarse);
    tarjeta.style.display = debeMostrarse ? "" : "none";

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
  const botonFavorito = tarjeta.querySelector(".favorite-button");

  actualizarTarjeta(tarjeta);
  actualizarEstadoFavorito(tarjeta);

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

  if (botonFavorito) {
    botonFavorito.addEventListener("click", () => {
      const favoritos = obtenerFavoritos();
      const datosLibro = construirDatosLibro(tarjeta);
      const indice = favoritos.findIndex((libro) => libro.id === datosLibro.id);

      if (indice >= 0) {
        favoritos.splice(indice, 1);
      } else {
        favoritos.unshift(datosLibro);
      }

      guardarFavoritos(favoritos);
      actualizarEstadoFavorito(tarjeta);
    });
  }
});

if (botonFiltrar) {
  botonFiltrar.addEventListener("click", aplicarFiltros);
}

actualizarResumen();
aplicarFiltros();
