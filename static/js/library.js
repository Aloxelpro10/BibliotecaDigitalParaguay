const CLAVE_SEGUIMIENTO = "bdp_read_books";
const CLAVE_FAVORITOS = "bdp_favorite_books";
const CLAVE_CATALOGO_LIBROS = "bdp_book_catalog";
const TIEMPO_BLOQUEO_MARCAR = 1000;

const normalizarIdLibro = (valor) => {
  const texto = String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return texto || "libro";
};

const normalizarFavoritos = (libros) => {
  const vistos = new Set();

  return (Array.isArray(libros) ? libros : []).reduce((resultado, libro) => {
    const id = normalizarIdLibro(libro?.id || libro?.titulo || "");

    if (!vistos.has(id)) {
      vistos.add(id);
      resultado.push({ ...libro, id });
    }

    return resultado;
  }, []);
};

const librosGuardados = JSON.parse(localStorage.getItem(CLAVE_SEGUIMIENTO) || "[]");
const librosLeidos = new Set(librosGuardados);
const tarjetas = Array.from(document.querySelectorAll("[data-book-id]"));
const contadorResumen = document.querySelector("[data-summary-count]");
const botonEstadisticas = document.querySelector("[data-open-reading-stats]");
const modalEstadisticas = document.getElementById("reading-stat-modal");
const modalEstadisticasTotal = document.querySelector("[data-modal-total]");
const modalEstadisticasLista = document.querySelector("[data-modal-stats]");
const modalEstadisticasCerrar = document.getElementById("reading-stat-close");
const buscador = document.querySelector("[data-buscador]");
const filtros = Array.from(document.querySelectorAll("[data-filtro]"));
const botonFiltrar = document.querySelector("[data-aplicar-filtros]");
const resultadoFiltros = document.querySelector("[data-resultado-filtros]");

function guardarSeguimiento() {
  localStorage.setItem(CLAVE_SEGUIMIENTO, JSON.stringify(Array.from(librosLeidos)));
}

function guardarFavoritos(librosFavoritos) {
  localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(normalizarFavoritos(librosFavoritos)));
}

function obtenerFavoritos() {
  try {
    return normalizarFavoritos(JSON.parse(localStorage.getItem(CLAVE_FAVORITOS) || "[]"));
  } catch (error) {
    return [];
  }
}

function guardarCatalogoLibros(catalogo) {
  localStorage.setItem(CLAVE_CATALOGO_LIBROS, JSON.stringify(catalogo));
}

function obtenerCatalogoLibros() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CATALOGO_LIBROS) || "{}");
  } catch (error) {
    return {};
  }
}

function sincronizarCatalogoDesdeInicio() {
  const catalogo = {};

  tarjetas.forEach((tarjeta) => {
    const datosLibro = construirDatosLibro(tarjeta);
    catalogo[normalizarIdLibro(datosLibro.id)] = datosLibro;
  });

  guardarCatalogoLibros(catalogo);
}

function alternarFavoritoPorId(bookId, datosLibro) {
  const idObjetivo = normalizarIdLibro(bookId || datosLibro?.id || "");
  const catalogo = obtenerCatalogoLibros();
  const datosBase = catalogo[idObjetivo] || datosLibro || {};
  const favoritos = obtenerFavoritos();
  const indice = favoritos.findIndex((libro) => normalizarIdLibro(libro.id) === idObjetivo);

  if (indice >= 0) {
    favoritos.splice(indice, 1);
  } else {
    favoritos.unshift({
      ...datosBase,
      id: idObjetivo,
      titulo: datosBase?.titulo || datosLibro?.titulo || "Sin título",
      descripcion: datosBase?.descripcion || datosLibro?.descripcion || "Libro guardado en favoritos."
    });
  }

  guardarFavoritos(favoritos);
  return obtenerFavoritos();
}

window.bdpToggleFavorito = alternarFavoritoPorId;

function construirDatosLibro(tarjeta) {
  const imageElement = tarjeta.querySelector("img");
  const titulo = tarjeta.dataset.titulo || tarjeta.querySelector("h2")?.textContent?.trim() || "Sin título";
  const descripcion = tarjeta.querySelector(".book-info p:not(.book-category)")?.textContent?.trim() || "";

  return {
    id: normalizarIdLibro(tarjeta.dataset.bookId || titulo),
    titulo,
    categoria: tarjeta.querySelector(".book-category")?.textContent?.trim() || "",
    materia: tarjeta.dataset.materia || "",
    grado: tarjeta.dataset.grado || "",
    anio: tarjeta.dataset.anio || "",
    idioma: tarjeta.dataset.idioma || "",
    descripcion,
    imagen: imageElement ? imageElement.src : "",
    href: tarjeta.querySelector("a")?.href || window.location.href,
    origen: "recomendados"
  };
}

function actualizarEstadoFavorito(tarjeta) {
  const botonFavorito = tarjeta.querySelector(".favorite-button");
  if (!botonFavorito) return;

  const favoritos = obtenerFavoritos();
  const idActual = normalizarIdLibro(tarjeta.dataset.bookId || tarjeta.dataset.titulo || "");
  const estaFavorito = favoritos.some((libro) => normalizarIdLibro(libro.id) === idActual);

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

function obtenerEtiquetaMateria(materia) {
  const valor = String(materia || "general").trim();

  if (!valor) {
    return "General";
  }

  return valor
    .split("-")
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
}

function obtenerDistribucionLectura() {
  const materias = new Map();
  const librosTotalesLeidos = Array.from(librosLeidos).filter((idLibro) =>
    tarjetas.some((tarjeta) => String(tarjeta.dataset.bookId) === String(idLibro))
  );

  librosTotalesLeidos.forEach((idLibro) => {
    const tarjeta = tarjetas.find((item) => String(item.dataset.bookId) === String(idLibro));
    const materia = String(tarjeta?.dataset?.materia || "general").trim() || "general";
    const etiqueta = obtenerEtiquetaMateria(materia);

    if (!materias.has(materia)) {
      materias.set(materia, { etiqueta, total: 0 });
    }

    materias.get(materia).total += 1;
  });

  const filas = Array.from(materias.values()).sort((a, b) => b.total - a.total);

  return {
    total: librosTotalesLeidos.length,
    filas
  };
}

function actualizarProgresoAcademico() {
  const { total, filas } = obtenerDistribucionLectura();

  if (contadorResumen) {
    contadorResumen.textContent = String(total);
  }

  if (modalEstadisticasTotal) {
    modalEstadisticasTotal.textContent = String(total);
  }

  if (modalEstadisticasLista) {
    modalEstadisticasLista.innerHTML = filas.length
      ? filas.map((fila) => {
          const porcentaje = total === 0 ? 0 : Math.round((fila.total / total) * 100);
          return `
            <div class="stat-row">
              <div class="stat-row-top">
                <span>${fila.etiqueta}</span>
                <strong>${porcentaje}% Total: ${fila.total}</strong>
              </div>
              <div class="progress-meter mini-meter" aria-hidden="true">
                <span class="progress-bar" style="width: ${porcentaje}%;"></span>
              </div>
            </div>
          `;
        }).join("")
      : '<div class="stat-row-empty">Aún no has marcado libros como leídos.</div>';
  }
}

function abrirEstadisticasLectura() {
  if (!modalEstadisticas) {
    return;
  }

  actualizarProgresoAcademico();
  modalEstadisticas.hidden = false;
  modalEstadisticas.setAttribute("aria-hidden", "false");
  modalEstadisticas.classList.add("is-open");
}

function cerrarEstadisticasLectura() {
  if (!modalEstadisticas) {
    return;
  }

  modalEstadisticas.hidden = true;
  modalEstadisticas.setAttribute("aria-hidden", "true");
  modalEstadisticas.classList.remove("is-open");
}

function actualizarResumen() {
  actualizarProgresoAcademico();
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
      const datosLibro = construirDatosLibro(tarjeta);
      alternarFavoritoPorId(datosLibro.id, datosLibro);
      actualizarEstadoFavorito(tarjeta);
    });
  }
});

if (botonFiltrar) {
  botonFiltrar.addEventListener("click", aplicarFiltros);
}

if (botonEstadisticas) {
  botonEstadisticas.addEventListener("click", abrirEstadisticasLectura);
}

if (modalEstadisticasCerrar) {
  modalEstadisticasCerrar.addEventListener("click", cerrarEstadisticasLectura);
}

if (modalEstadisticas) {
  modalEstadisticas.addEventListener("click", (evento) => {
    if (evento.target && evento.target.matches(".favorites-confirm-backdrop")) {
      cerrarEstadisticasLectura();
    }
  });
}

const formularioPedido = document.querySelector("#pedido-subida-form");
const estadoPedido = document.querySelector("#pedido-status");
const botonCorreoAviso = document.querySelector("[data-open-email-request]");
const DESTINO_CORREO = "juaneolearybibliotecadigital@gmail.com";

function crearEnlaceCorreo({ destinatario = DESTINO_CORREO, asunto = "", cuerpo = "" } = {}) {
  const url = new URL(`mailto:${destinatario}`);

  if (asunto) {
    url.searchParams.set("subject", asunto);
  }

  if (cuerpo) {
    url.searchParams.set("body", cuerpo);
  }

  return url.toString();
}

function abrirCorreo({ destinatario = DESTINO_CORREO, asunto = "", cuerpo = "" } = {}) {
  const mailtoLink = crearEnlaceCorreo({ destinatario, asunto, cuerpo });
  const gmailLink = new URL("https://mail.google.com/mail/");
  gmailLink.searchParams.set("view", "cm");
  gmailLink.searchParams.set("fs", "1");
  gmailLink.searchParams.set("to", destinatario);

  if (asunto) {
    gmailLink.searchParams.set("su", asunto);
  }

  if (cuerpo) {
    gmailLink.searchParams.set("body", cuerpo);
  }

  const nuevaVentana = window.open(gmailLink.toString(), "_blank", "noopener,noreferrer");

  if (nuevaVentana) {
    nuevaVentana.opener = null;
  }

  setTimeout(() => {
    window.location.href = mailtoLink;
  }, 250);
}

const pedidoModal = document.getElementById("pedido-confirm-modal");
const pedidoModalMessage = document.getElementById("pedido-confirm-message");
const pedidoModalCloseButton = document.getElementById("pedido-confirm-close");

function cerrarPedidoModal() {
  if (!pedidoModal) {
    return;
  }

  pedidoModal.hidden = true;
  pedidoModal.style.display = "none";
  pedidoModal.setAttribute("aria-hidden", "true");
  pedidoModal.classList.remove("is-open");
}

function mostrarConfirmacionPedido({ correo, nombreLibro, asunto, mensaje }) {
  if (!pedidoModal || !pedidoModalMessage) {
    return;
  }

  const resumen = [
    "Su pedido a sido enviado correctamente, este sera analizado para posteriormente subirlo a la pagina, este proceso se realizara en fines de semana para evitar problemas en la pagina web",
    "",
    "Resumen de la petición",
    "El cuestionario que se envio",
    `Correo: ${correo}`,
    `Libro: ${nombreLibro}`,
    `Asunto: ${asunto}`,
    `Detalles: ${mensaje || "Sin detalles adicionales."}`
  ].join("\n");

  pedidoModalMessage.textContent = resumen;
  pedidoModal.hidden = false;
  pedidoModal.style.display = "grid";
  pedidoModal.setAttribute("aria-hidden", "false");
  pedidoModal.classList.add("is-open");

  requestAnimationFrame(() => {
    pedidoModal.hidden = false;
    pedidoModal.style.display = "grid";
    pedidoModal.classList.add("is-open");
  });
}

async function enviarFormularioPedido(formulario) {
  const correo = formulario.elements.email.value.trim();
  const nombreLibro = formulario.elements.book_title.value.trim();
  const asunto = formulario.elements.subject.value.trim();
  const archivoInput = formulario.elements.pdf;
  const archivo = archivoInput ? archivoInput.files[0] : null;
  const mensaje = formulario.elements.message.value.trim();

  if (!correo || !nombreLibro) {
    if (estadoPedido) {
      estadoPedido.textContent = "Completa el correo y el nombre del libro para continuar.";
    }
    return { ok: false, motivo: "campos-invalidos" };
  }

  const asuntoFinal = asunto || "Petición de subida de contenido faltante";

  if (estadoPedido) {
    estadoPedido.textContent = "Enviando la solicitud...";
  }

  try {
    const formData = new FormData(formulario);
    formData.set("subject", asuntoFinal);
    formData.set("email", correo);
    formData.set("book_title", nombreLibro);
    formData.set("message", mensaje || "Sin detalles adicionales.");

    const respuesta = await fetch(formulario.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    });

    const textoRespuesta = await respuesta.text();
    let payload = null;

    try {
      payload = textoRespuesta ? JSON.parse(textoRespuesta) : null;
    } catch (error) {
      payload = null;
    }

    const envioCorrecto = respuesta.ok && (!payload || payload.ok !== false);

    if (envioCorrecto) {
      return {
        ok: true,
        correo,
        nombreLibro,
        asunto: asuntoFinal,
        mensaje: mensaje || "Sin detalles adicionales."
      };
    }

    return {
      ok: false,
      motivo: "respuesta-fallida",
      correo,
      nombreLibro,
      asunto: asuntoFinal,
      mensaje: mensaje || "Sin detalles adicionales.",
      archivo
    };
  } catch (error) {
    return {
      ok: false,
      motivo: "error-red",
      correo,
      nombreLibro,
      asunto: asuntoFinal,
      mensaje: mensaje || "Sin detalles adicionales.",
      archivo
    };
  }
}

if (botonCorreoAviso) {
  botonCorreoAviso.addEventListener("click", () => {
    abrirCorreo({
      destinatario: DESTINO_CORREO,
      asunto: "Petición de subida de contenido faltante",
      cuerpo: [
        "Por favor, adjunte el material o proporcione la referencia del libro solicitado.",
        "",
        "Nombre del libro:",
        "",
        "Detalles adicionales:"
      ].join("\n")
    });
  });
}

if (pedidoModalCloseButton) {
  pedidoModalCloseButton.addEventListener("click", cerrarPedidoModal);
}

if (pedidoModal) {
  pedidoModal.addEventListener("click", (evento) => {
    if (evento.target instanceof HTMLElement && evento.target.dataset.closeModal === "true") {
      cerrarPedidoModal();
    }
  });
}

if (formularioPedido) {
  formularioPedido.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const resultado = await enviarFormularioPedido(formularioPedido);

    if (resultado.ok) {
      if (estadoPedido) {
        estadoPedido.textContent = "Formulario enviado.";
      }

      mostrarConfirmacionPedido({
        correo: resultado.correo,
        nombreLibro: resultado.nombreLibro,
        asunto: resultado.asunto,
        mensaje: resultado.mensaje
      });

      formularioPedido.reset();
      return;
    }

    if (estadoPedido) {
      estadoPedido.textContent = "No se pudo enviar automáticamente. Se abrirá tu correo para completar la solicitud.";
    }

    const cuerpo = [
      "Correo del solicitante: " + resultado.correo,
      "Nombre del libro: " + resultado.nombreLibro,
      "Asunto: " + resultado.asunto,
      resultado.archivo ? "PDF adjunto: " + resultado.archivo.name : "PDF: No se adjuntó",
      "",
      "Detalles adicionales:",
      resultado.mensaje || "Sin detalles adicionales."
    ].join("\n");

    abrirCorreo({
      destinatario: DESTINO_CORREO,
      asunto: resultado.asunto,
      cuerpo
    });

    formularioPedido.reset();
  });
}

Array.from(document.querySelectorAll('[data-email-link], a[href^="mailto:"]')).forEach((enlace) => {
  enlace.addEventListener("click", (evento) => {
    evento.preventDefault();

    const href = enlace.getAttribute("href");

    try {
      const mailtoUrl = new URL(href);
      const gmailUrl = new URL("https://mail.google.com/mail/");
      const destinatario = mailtoUrl.pathname || mailtoUrl.searchParams.get("to") || DESTINO_CORREO;
      const asunto = mailtoUrl.searchParams.get("subject") || "";
      const cuerpo = mailtoUrl.searchParams.get("body") || "";

      gmailUrl.searchParams.set("view", "cm");
      gmailUrl.searchParams.set("fs", "1");
      gmailUrl.searchParams.set("to", destinatario);

      if (asunto) {
        gmailUrl.searchParams.set("su", asunto);
      }

      if (cuerpo) {
        gmailUrl.searchParams.set("body", cuerpo);
      }

      const ventanaGmail = window.open(gmailUrl.toString(), "_blank", "noopener,noreferrer");

      if (ventanaGmail) {
        ventanaGmail.opener = null;
      }

      setTimeout(() => {
        window.location.href = href;
      }, 250);
    } catch (error) {
      window.location.href = href;
    }
  });
});

  sincronizarCatalogoDesdeInicio();
