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
