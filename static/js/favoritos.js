const CLAVE_FAVORITOS = "bdp_favorite_books";
const listaFavoritos = document.getElementById("favorites-list");
const contadorFavoritos = document.getElementById("favorites-count");
const botonLimpiar = document.getElementById("clear-favorites");

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

function renderizarFavoritos() {
  const libros = obtenerFavoritos();

  if (!listaFavoritos) return;

  if (contadorFavoritos) {
    contadorFavoritos.textContent = String(libros.length);
  }

  if (libros.length === 0) {
    listaFavoritos.innerHTML = `
      <div class="favorites-empty">
        <h2>No tienes libros marcados como favoritos.</h2>
        <p>Haz clic en “Favoritos” desde la sección de recomendados para guardar un libro aquí.</p>
        <a class="primary-button" href="Inicio.html">Ir a recomendados</a>
      </div>
    `;
    return;
  }

  listaFavoritos.innerHTML = libros
    .map(
      (libro) => `
        <article class="favorite-card" data-book-id="${libro.id}">
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
              <a class="secondary-button" href="${libro.href || "Inicio.html"}">Ver detalle</a>
              <button type="button" class="favorite-button is-favorite" data-remove-favorite="${libro.id}">Quitar</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  document.querySelectorAll("[data-remove-favorite]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const librosActualizados = obtenerFavoritos().filter((libro) => libro.id !== boton.dataset.removeFavorite);
      guardarFavoritos(librosActualizados);
      renderizarFavoritos();
    });
  });
}

if (botonLimpiar) {
  botonLimpiar.addEventListener("click", () => {
    guardarFavoritos([]);
    renderizarFavoritos();
  });
}

renderizarFavoritos();
