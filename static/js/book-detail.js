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
  const qrUrlBtn = document.getElementById("qrUrlBtn");
  const favoriteButton = document.querySelector(".favorite-button");

  const obtenerIdLibro = () => {
    const textoTitulo = document.querySelector(".eyebrow")?.textContent?.trim() || document.title.trim();
    return (textoTitulo || "libro")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "libro";
  };

  const obtenerFavoritos = () => {
    try {
      return JSON.parse(localStorage.getItem("bdp_favorite_books") || "[]");
    } catch (error) {
      return [];
    }
  };

  const guardarFavoritos = (libros) => {
    localStorage.setItem("bdp_favorite_books", JSON.stringify(libros));
  };

  const actualizarEstadoFavorito = () => {
    if (!favoriteButton) return;

    const favoritos = obtenerFavoritos();
    const bookId = obtenerIdLibro();
    const estaFavorito = favoritos.some((libro) => libro.id === bookId);

    favoriteButton.classList.toggle("is-favorite", estaFavorito);
    favoriteButton.textContent = estaFavorito ? "Favorito ✓" : "Agregar a favoritos";
    favoriteButton.setAttribute("aria-pressed", String(estaFavorito));
  };

  if (favoriteButton) {
    favoriteButton.addEventListener("click", () => {
      const favoritos = obtenerFavoritos();
      const titulo = document.querySelector(".eyebrow")?.textContent?.trim() || document.title.trim();
      const descripcion = "Libro guardado en favoritos.";
      const image = document.querySelector(".book-cover img")?.src || "";
      const libro = {
        id: obtenerIdLibro(),
        titulo,
        categoria: "Informática",
        materia: "informatica",
        grado: "3a",
        anio: "2024",
        idioma: "espanol",
        descripcion,
        imagen: image,
        href: pageUrl,
        origen: "detalle"
      };

      const indice = favoritos.findIndex((item) => item.id === libro.id);

      if (indice >= 0) {
        favoritos.splice(indice, 1);
      } else {
        favoritos.unshift(libro);
      }

      guardarFavoritos(favoritos);
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

  if (qrUrlBtn) {
    qrUrlBtn.textContent = pageUrl;
    qrUrlBtn.addEventListener("click", () => window.open(pageUrl, "_blank", "noopener,noreferrer"));
  }

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
