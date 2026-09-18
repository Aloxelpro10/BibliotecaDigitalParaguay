document.addEventListener("DOMContentLoaded", () => {
  const pageUrl = window.location.href;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(pageUrl)}`;
  const qrImage = document.getElementById("qrImage");
  const qrModal = document.getElementById("qrModal");
  const qrModalImage = document.getElementById("qrModalImage");
  const downloadBtn = document.getElementById("downloadQrBtn");
  const downloadModalBtn = document.getElementById("downloadModalQrBtn");
  const openQrBtn = document.getElementById("openQrBtn");
  const closeQrBtn = document.getElementById("closeQrBtn");
  const favoriteButton = document.querySelector(".favorite-button");

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

  const obtenerIdLibro = () => {
    const idDesdeBody = document.body?.dataset?.bookId || "";
    const textoTitulo = document.querySelector(".eyebrow")?.textContent?.trim() || document.title.trim();
    return normalizarIdLibro(idDesdeBody || textoTitulo);
  };

  const buscarLibroEnInicio = (idLibro) => {
    try {
      const catalogo = JSON.parse(localStorage.getItem("bdp_book_catalog") || "{}");
      const libroCatalogado = catalogo[idLibro];

      if (libroCatalogado) {
        return {
          ...libroCatalogado,
          id: normalizarIdLibro(libroCatalogado.id || idLibro),
          descripcion: libroCatalogado.descripcion || "Libro guardado en favoritos."
        };
      }
    } catch (error) {
      // Ignora error y usa el fallback del detalle.
    }

    const tarjetasInicio = Array.from(document.querySelectorAll(".book-card"));
    const tarjeta = tarjetasInicio.find((item) => normalizarIdLibro(item.dataset.bookId || item.dataset.titulo || "") === idLibro);

    if (!tarjeta) return null;

    const imageElement = tarjeta.querySelector("img");
    const titulo = tarjeta.dataset.titulo || tarjeta.querySelector("h2")?.textContent?.trim() || "Sin título";

    return {
      id: normalizarIdLibro(idLibro || tarjeta.dataset.bookId || titulo),
      titulo,
      categoria: tarjeta.querySelector(".book-category")?.textContent?.trim() || "",
      materia: tarjeta.dataset.materia || "",
      grado: tarjeta.dataset.grado || "",
      anio: tarjeta.dataset.anio || "",
      idioma: tarjeta.dataset.idioma || "",
      descripcion: tarjeta.querySelector("p")?.textContent?.trim() || "",
      imagen: imageElement ? imageElement.src : "",
      href: tarjeta.querySelector("a")?.href || pageUrl,
      origen: "recomendados"
    };
  };

  const obtenerFavoritos = () => {
    try {
      return normalizarFavoritos(JSON.parse(localStorage.getItem("bdp_favorite_books") || "[]"));
    } catch (error) {
      return [];
    }
  };

  const guardarFavoritos = (libros) => {
    localStorage.setItem("bdp_favorite_books", JSON.stringify(normalizarFavoritos(libros)));
  };

  const actualizarEstadoFavorito = () => {
    if (!favoriteButton) return;

    const favoritos = obtenerFavoritos();
    const bookId = obtenerIdLibro();
    const estaFavorito = favoritos.some((libro) => normalizarIdLibro(libro.id) === bookId);

    favoriteButton.classList.toggle("is-favorite", estaFavorito);
    favoriteButton.textContent = estaFavorito ? "Favorito ✓" : "Agregar a favoritos";
    favoriteButton.setAttribute("aria-pressed", String(estaFavorito));
  };

  if (favoriteButton) {
    favoriteButton.addEventListener("click", () => {
      const idLibro = obtenerIdLibro();
      const libroDesdeInicio = buscarLibroEnInicio(idLibro);
      const titulo = document.querySelector(".eyebrow")?.textContent?.trim() || document.title.trim();
      const image = document.querySelector(".book-cover img")?.src || "";

      const libro = libroDesdeInicio || {
        id: idLibro,
        titulo,
        descripcion: "Libro guardado en favoritos.",
        imagen: image,
        href: pageUrl
      };

      if (window.bdpToggleFavorito) {
        window.bdpToggleFavorito(idLibro, libro);
      } else {
        const favoritos = obtenerFavoritos();
        const indice = favoritos.findIndex((item) => normalizarIdLibro(item.id) === idLibro);

        if (indice >= 0) {
          favoritos.splice(indice, 1);
        } else {
          favoritos.unshift(libro);
        }

        guardarFavoritos(favoritos);
      }

      actualizarEstadoFavorito();
    });

    actualizarEstadoFavorito();
  }

  if (!qrImage) return;

  const qrImages = [qrImage, qrModalImage].filter(Boolean);
  let qrIsReady = false;

  const markQrAsReady = () => {
    qrIsReady = true;
    if (downloadBtn) downloadBtn.disabled = false;
    if (downloadModalBtn) downloadModalBtn.disabled = false;
  };

  const downloadQr = async () => {
    if (!qrIsReady) return;

    try {
      const response = await fetch(qrSrc, { mode: "cors", cache: "no-store" });
      if (!response.ok) throw new Error(`No se pudo obtener el QR (${response.status})`);

      const qrBlob = await response.blob();
      const downloadUrl = URL.createObjectURL(qrBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "qr-libro.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error al descargar el QR:", error);
      window.open(qrSrc, "_blank", "noopener,noreferrer");
    }
  };

  qrImages.forEach((image) => {
    image.src = qrSrc;
    image.addEventListener("load", markQrAsReady, { once: true });
  });

  if (downloadBtn) downloadBtn.addEventListener("click", downloadQr);
  if (downloadModalBtn) downloadModalBtn.addEventListener("click", downloadQr);

  if (openQrBtn && qrModal) {
    openQrBtn.addEventListener("click", () => qrModal.showModal());
  }

  if (closeQrBtn && qrModal) {
    closeQrBtn.addEventListener("click", () => qrModal.close());
  }

  if (qrModal) {
    qrModal.addEventListener("click", (event) => {
      if (event.target === qrModal) qrModal.close();
    });
  }
});
