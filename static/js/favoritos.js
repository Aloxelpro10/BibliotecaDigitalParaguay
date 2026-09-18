const CLAVE_FAVORITOS = "bdp_favorite_books";
const listaFavoritos = document.getElementById("favorites-list");
const contadorFavoritos = document.getElementById("favorites-count");
const toggleSelectionButton = document.getElementById("toggle-favorite-selection");
const deleteSelectedButton = document.getElementById("delete-selected-favorites");
const selectAllCheckbox = document.getElementById("select-all-favorites");
const selectAllWrapper = document.getElementById("select-all-wrapper");
const modal = document.getElementById("favorites-confirm-modal");
const modalMessage = document.getElementById("favorites-confirm-message");
const modalCancelButton = document.getElementById("favorites-confirm-cancel");
const modalAcceptButton = document.getElementById("favorites-confirm-accept");

let selectionMode = false;
let idsSeleccionados = new Set();
let accionConfirmada = null;

function obtenerFavoritos() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_FAVORITOS) || "[]");
  } catch (error) {
    return [];
  }
}

function guardarFavoritos(libros) {
  localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(libros));
}

function cerrarModal() {
  if (modal) {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    modal.classList.remove("is-open");
  }
  accionConfirmada = null;
}

function mostrarConfirmacion(mensaje, callback) {
  if (!modal || !modalMessage) {
    callback?.();
    return;
  }

  modalMessage.textContent = mensaje;
  accionConfirmada = callback || null;
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  modal.classList.add("is-open");
}

function actualizarToolbar() {
  const controlsVisible = selectionMode;

  if (toggleSelectionButton) {
    toggleSelectionButton.textContent = controlsVisible ? "Cancelar" : "Eliminar de favoritos";
  }

  if (selectAllWrapper) {
    selectAllWrapper.hidden = !controlsVisible;
    selectAllWrapper.style.display = controlsVisible ? "inline-flex" : "none";
  }

  if (deleteSelectedButton) {
    const cantidad = idsSeleccionados.size;
    deleteSelectedButton.hidden = !controlsVisible;
    deleteSelectedButton.style.display = controlsVisible ? "inline-flex" : "none";
    deleteSelectedButton.disabled = controlsVisible ? cantidad === 0 : true;
    deleteSelectedButton.textContent = cantidad > 0 ? `Eliminar (${cantidad})` : "Eliminar";
  }

  if (selectAllCheckbox) {
    const totalLibros = document.querySelectorAll(".favorite-select").length;
    const seleccionados = idsSeleccionados.size;
    selectAllCheckbox.checked = controlsVisible && totalLibros > 0 && seleccionados === totalLibros;
    selectAllCheckbox.indeterminate = controlsVisible && seleccionados > 0 && seleccionados < totalLibros;
    selectAllCheckbox.hidden = !controlsVisible;
  }
}

function resetSelectionState() {
  selectionMode = false;
  idsSeleccionados = new Set();
  cerrarModal();

  if (selectAllCheckbox) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
    selectAllCheckbox.hidden = true;
  }

  if (selectAllWrapper) {
    selectAllWrapper.hidden = true;
    selectAllWrapper.style.display = "none";
  }

  if (deleteSelectedButton) {
    deleteSelectedButton.hidden = true;
    deleteSelectedButton.style.display = "none";
    deleteSelectedButton.disabled = true;
    deleteSelectedButton.textContent = "Eliminar";
  }

  if (toggleSelectionButton) {
    toggleSelectionButton.textContent = "Eliminar de favoritos";
  }
}

function aplicarModoSeleccion(valor) {
  selectionMode = valor;
  cerrarModal();

  if (!selectionMode) {
    idsSeleccionados.clear();
  }

  actualizarToolbar();
}

function renderizarFavoritos() {
  const libros = obtenerFavoritos();

  if (!listaFavoritos) return;

  if (contadorFavoritos) {
    contadorFavoritos.textContent = String(libros.length);
  }

  if (!selectionMode) {
    idsSeleccionados = new Set();
  }

  actualizarToolbar();

  if (libros.length === 0) {
    listaFavoritos.innerHTML = `
      <div class="favorites-empty">
        <h2>No tienes libros marcados como favoritos.</h2>
        <p>Haz clic en “Añadir a favoritos” desde la tarjeta del libro para guardar el resumen aquí.</p>
        <a class="primary-button" href="Inicio.html">Ir a recomendados</a>
      </div>
    `;
    actualizarToolbar();
    return;
  }

  listaFavoritos.innerHTML = libros
    .map(
      (libro) => `
        <article class="favorite-card" data-book-id="${libro.id}">
          <label class="favorite-select-option" aria-label="Seleccionar libro">
            <input
              type="checkbox"
              class="favorite-select"
              data-select-book-id="${libro.id}"
              ${idsSeleccionados.has(libro.id) ? "checked" : ""}
              ${selectionMode ? "" : "hidden"}
            >
          </label>
          <img src="${libro.imagen || "biblioteca_libros/portadas/Fundamentos de la programación 5.webp"}" alt="Portada de ${libro.titulo}">
          <div class="favorite-card-content">
            <p class="book-category">${libro.categoria || "Libro"}</p>
            <h2>${libro.titulo}</h2>
            <p>${libro.descripcion || "Libro guardado por el usuario en la colección de favoritos."}</p>
            <ul class="tag-list">
              <li>${libro.materia || "General"}</li>
              <li>${libro.grado || "Sin grado"}</li>
              <li>${libro.anio || "Sin año"}</li>
              <li>${libro.idioma || "Español"}</li>
            </ul>
            <div class="favorite-actions">
              <a class="secondary-button" href="${libro.href || "Inicio.html"}">Ver libro</a>
              <button type="button" class="favorite-button is-favorite" data-remove-favorite="${libro.id}">Quitar de favoritos</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  document.querySelectorAll(".favorite-select").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const { selectBookId } = event.target.dataset;

      if (event.target.checked) {
        idsSeleccionados.add(selectBookId);
      } else {
        idsSeleccionados.delete(selectBookId);
      }

      actualizarToolbar();
    });
  });

  document.querySelectorAll("[data-remove-favorite]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const libroId = boton.dataset.removeFavorite;
      mostrarConfirmacion(
        "¿Estas seguro de que quieres eliminar este libro de la sección de favoritos? Esta elección no se puede desacer.",
        () => {
          const librosActualizados = obtenerFavoritos().filter((libro) => libro.id !== libroId);
          guardarFavoritos(librosActualizados);
          idsSeleccionados.delete(libroId);
          renderizarFavoritos();
        }
      );
    });
  });

  actualizarToolbar();
}

resetSelectionState();

if (toggleSelectionButton) {
  toggleSelectionButton.addEventListener("click", () => {
    cerrarModal();
    selectionMode = !selectionMode;

    if (!selectionMode) {
      idsSeleccionados.clear();
    }

    actualizarToolbar();
    renderizarFavoritos();
  });
}

if (selectAllCheckbox) {
  selectAllCheckbox.addEventListener("change", (event) => {
    const favoritos = obtenerFavoritos();

    if (event.target.checked) {
      favoritos.forEach((libro) => idsSeleccionados.add(libro.id));
    } else {
      favoritos.forEach((libro) => idsSeleccionados.delete(libro.id));
    }

    renderizarFavoritos();
  });
}

if (deleteSelectedButton) {
  deleteSelectedButton.addEventListener("click", () => {
    const cantidad = idsSeleccionados.size;
    if (cantidad === 0) return;

    mostrarConfirmacion(
      `¿Estas seguro de esto? Se eliminaran ${cantidad} libros de tu catalogo de favoritos`,
      () => {
        const librosActualizados = obtenerFavoritos().filter((libro) => !idsSeleccionados.has(libro.id));
        guardarFavoritos(librosActualizados);
        idsSeleccionados.clear();
        selectionMode = false;
        renderizarFavoritos();
      }
    );
  });
}

if (modalCancelButton) {
  modalCancelButton.addEventListener("click", cerrarModal);
}

if (modalAcceptButton) {
  modalAcceptButton.addEventListener("click", () => {
    if (typeof accionConfirmada === "function") {
      accionConfirmada();
    }
    cerrarModal();
  });
}

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-modal='true']")) {
      cerrarModal();
    }
  });
}

window.addEventListener("pageshow", () => {
  resetSelectionState();
  renderizarFavoritos();
});

renderizarFavoritos();
