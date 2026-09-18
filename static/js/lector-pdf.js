// ═══ Lector PDF Universal ═══
(function () {
  // ─── Crear el modal dinámicamente ───
  const overlay = document.createElement('div');
  overlay.className = 'pdf-reader-overlay';
  overlay.id = 'pdfReader';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="pdf-reader-header">
      <span class="pdf-reader-title">Lector de PDF</span>
      <button class="pdf-reader-close" type="button">✕ Cerrar</button>
    </div>
    <iframe class="pdf-reader-frame" title="Visor de PDF"></iframe>
  `;
  document.body.appendChild(overlay);

  const frame = overlay.querySelector('.pdf-reader-frame');
  const closeBtn = overlay.querySelector('.pdf-reader-close');

  const BASE = 'https://biblioteca-r2.williandesiderio3.workers.dev/';

  const openBtn = document.querySelector('.open-book-button');
  if (!openBtn) return;

  function abrirLector() {
    const pdfPath = openBtn.getAttribute('data-pdf');
    if (!pdfPath) return;
    frame.src = BASE + pdfPath;  // ← ÚNICA petición a Cloudflare (al hacer clic)
    overlay.classList.add('activo');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function cerrarLector() {
    overlay.classList.remove('activo');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    frame.src = '';
  }

  openBtn.addEventListener('click', abrirLector);
  closeBtn.addEventListener('click', cerrarLector);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) cerrarLector();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('activo')) cerrarLector();
  });
})();
