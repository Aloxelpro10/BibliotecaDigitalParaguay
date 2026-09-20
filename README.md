# Biblioteca Digital Paraguay

Proyecto web estático para gestionar una pequeña biblioteca estudiantil con catálogo, filtros, favoritos y páginas de detalle por libro. La aplicación funciona completamente en el front-end y guarda el estado del usuario en `localStorage`; no hay backend ni base de datos en producción.

## Estado actual del proyecto

El repositorio está funcionando como una biblioteca web estática orientada a HTML, CSS y JavaScript.

- No hay servidor de aplicación ni API.
- La persistencia de datos se hace en el navegador usando `localStorage`.
- La navegación principal es por páginas estáticas y archivos del proyecto.
- Hay un caso real de libro cargado, mientras que otros libros del catálogo son ejemplos o placeholders.

> Para probarlo no hace falta Flask ni dependencias de Python. Basta con abrir `index.html` o servir la carpeta local con un servidor simple.

## Estructura real del proyecto

```text
Digital_Library_Projects/
├── index.html
├── Inicio.html
├── favoritos.html
├── README.md
├── biblioteca_libros/
│   └── portadas/
│       ├── Fundamentos de la programación 5.webp
│       ├── placeholder-cover.svg
│       └── README.md
├── static/
│   ├── css/
│   │   ├── Libro.css
│   │   ├── lector-pdf.css
│   │   └── styles.css
│   ├── img/
│   │   ├── Back-button.png
│   │   ├── fondo_pag.png
│   │   ├── logo-de-pagina.png
│   │   └── README.md
│   └── js/
│       ├── book-detail.js
│       ├── favoritos.js
│       ├── lector-pdf.js
│       └── library.js
└── templestes/
    ├── Libro-Fundamentos-de-la-programacion.html
    └── Libro.html
```

## Qué hace cada parte

### Páginas principales

- `index.html`: landing page de entrada a la biblioteca.
- `Inicio.html`: catálogo principal con búsqueda y filtros.
- `favoritos.html`: lista de libros marcados como favoritos y eliminación en lote.

### Carpeta `templestes/`

- `Libro-Fundamentos-de-la-programacion.html`: detalle del libro real del proyecto.
- `Libro.html`: plantilla base reutilizable para crear nuevas páginas de detalle.

### Carpeta `static/`

#### CSS

- `styles.css`: estilos generales del sitio, catálogo, filtros y favoritos.
- `Libro.css`: estilo de la vista de detalle del libro, incluyendo la modal de información y el scroll interno.
- `lector-pdf.css`: estilos del visor PDF modal.

#### JavaScript

- `library.js`: gestiona búsqueda, filtros, lectura y favoritos en `Inicio.html`.
- `favoritos.js`: renderiza la colección de favoritos y permite borrado masivo.
- `book-detail.js`: sincroniza la página de detalle con el catálogo, crea el QR y renderiza la información secundaria del libro.
- `lector-pdf.js`: abre un visor PDF con la URL del documento remoto.

#### Imágenes

- `static/img/`: recursos visuales del sitio como fondo, botones y logo.
- `mosaico-libros.jpg` no aparece en la estructura actual del repo; si se usa en CSS, debe agregarse manualmente.

### Carpeta `biblioteca_libros/`

- `biblioteca_libros/portadas/`: imágenes de portadas.

## Modal de información del libro

La página de detalle incluye una modal de información secundaria reutilizable para cualquier libro. Esta modal muestra datos básicos como:

- nombre del libro
- editorial
- autor
- fecha de publicación
- páginas
- capítulos que abarcan el contenido

La ventaja importante es que no requiere que el usuario edite esos datos en la pantalla. En cambio, la información se guarda en un bloque oculto dentro del HTML principal, en un script tipo JSON, y el JavaScript la interpreta para mostrarla al usuario.

### Patrón recomendado

```html
<script id="book-capitulos-data" type="application/json" aria-hidden="true">
  [
    {"tipo":"texto","texto":"Prólogo a la quinta edición"},
    {"tipo":"parte","titulo":"PARTE I. ALGORITMOS Y HERRAMIENTAS DE PROGRAMACIÓN","items":[...]}
  ]
</script>
```

Esto permite:

- mantener la información dentro del mismo archivo HTML principal
- no exponer datos técnicos al usuario
- reutilizar la estructura para otros libros
- estructurar capítulos con texto libre, partes y listas largas sin complicar el código

## Cómo funciona la vista de detalle

Cada detalle de libro usa `data-book-id` en el `body` y luego `book-detail.js` busca el libro en el catálogo local para sincronizar datos y favoritos.

La vista incluye:

- portada del libro
- sinopsis
- botón para guardar en favoritos
- botón para ver más información
- modal con datos generales y capítulos
- QR de la página
- botón para abrir el PDF
- enlace de descarga

## PDF y descarga

El proyecto usa un visor PDF que apunta a un servicio remoto de Cloudflare R2.

El patrón actual es:

```text
https://biblioteca-r2.williandesiderio3.workers.dev/[ruta]/[archivo.pdf]
```

En el detalle real del libro se usa esta idea:

```html
<button class="open-book-button" type="button" data-pdf="informatica/Fundamentos%20de%20programacio%CC%81n%205.pdf">Leer</button>
```

Y el script `static/js/lector-pdf.js` construye la URL completa al hacer clic.

### Importante sobre nombres de archivo

El archivo real del PDF se llama:

```text
Fundamentos de programación 5.pdf
```

El nombre tiene un acento combinado/variado en la palabra “programación”, y eso puede producir problemas si se reutiliza de forma literal en varias rutas. Para evitar errores, conviene:

- usar nombres más simples y consistentes
- normalizar acentos y caracteres raros
- aplicar codificación URL cuando sea necesario
- preferir nombres sin espacios problemáticos si se van a consumir en scripts o enlaces

## Cómo levantar el proyecto localmente

Como es una web estática, existe más de una forma:

### Opción 1: abrir directamente

Abre `index.html` desde el navegador.

### Opción 2: servirlo localmente

Desde la raíz del proyecto:

```bash
python -m http.server 8000
```

Y luego accede a:

```text
http://localhost:8000
```

## Qué está funcionando y qué debe corregirse

### Estado real del proyecto

Actualmente hay un libro de ejemplo realmente integrado al sistema:

- `Fundamentos de la Programación`
- portada: `biblioteca_libros/portadas/Fundamentos de la programación 5.webp`
- detalle: `templestes/Libro-Fundamentos-de-la-programacion.html`

### Problemas habituales que ya existen en el código

Los siguientes puntos están documentados porque son los que más suelen romper la app:

- Hay tarjetas en `Inicio.html` que apuntan a rutas tipo `/libros/...` que no existen en este repositorio.
- Algunos ejemplos son placeholders y no corresponden a archivos reales del proyecto.
- El catálogo actual tiene más ejemplos que libros reales.
- Los nombres de archivo con caracteres especiales pueden generar errores reales en enlaces y en la lectura del PDF.
- Los `data-book-id` deben mantenerse consistentes entre la tarjeta del catálogo y la página de detalle.
- La información secundaria del libro debe mantenerse en un bloque estructurado y reutilizable para no complejizar el mantenimiento por parte de personas no técnicas.

## Guía para agregar un nuevo libro

1. Crear la portada dentro de `biblioteca_libros/portadas/`.
2. Subir el PDF a `biblioteca_libros/pdfs/` si se va a abrir en la app.
3. Agregar una tarjeta en `Inicio.html` con `class="book-card"` y los atributos `data-*` correctos.
4. Usar un `data-book-id` único y normalizado.
5. Crear o duplicar la vista detalle en `templestes/` con el mismo identificador del libro.
6. Incluir dentro del `body` un bloque `data-book-info` con la información básica del libro.
7. Añadir un bloque `script id="book-capitulos-data" type="application/json"` con la estructura de capítulos del libro.
8. Verificar que el PDF y la imagen existan realmente.
9. Revisar que los filtros y el buscador puedan encontrar el libro.

### Estructura mínima de una tarjeta

```html
<article
  class="book-card"
  data-book-id="nombre-del-libro"
  data-titulo="Nombre del Libro"
  data-materia="informatica"
  data-grado="3a"
  data-anio="2024"
  data-idioma="espanol"
>
</article>
```

### Estructura mínima para la información del libro

```html
<body data-book-id="nombre-del-libro" data-book-info='{"nombre":"Nombre del libro","editorial":"Editorial","autor":"Autor","fecha":"2024","paginas":"300 páginas"}'>
  <script id="book-capitulos-data" type="application/json" aria-hidden="true">
    [{"tipo":"texto","texto":"Prólogo"},{"tipo":"parte","titulo":"PARTE I. TÍTULO","items":["Capítulo 1. ...","Capítulo 2. ..."]}]
  </script>
</body>
```

### Recomendaciones

- Mantener un solo identificador consistente entre catálogo y detalle.
- Usar rutas relativas, no rutas absolutas tipo `/libros/...` salvo que exista dicha carpeta.
- Usar nombres simples y evitar caracteres raros si es posible.
- Revisar que el valor de `data-materia`, `data-grado`, `data-anio` y `data-idioma` coincida con los selectores del filtro.
- Mantener la información de capítulos en un formato estructurado para facilitar su edición por personas no técnicas.

## Checklist rápido antes de publicar un libro nuevo

- [ ] El `data-book-id` es único.
- [ ] El `data-titulo` coincide con el título visible.
- [ ] La portada existe y la ruta está bien.
- [ ] El PDF existe y la ruta apuntada es válida.
- [ ] La página de detalle usa el mismo identificador.
- [ ] La información básica del libro está en `data-book-info`.
- [ ] Los capítulos están en `script#book-capitulos-data` tipo JSON.
- [ ] El libro aparece en el buscador y en los filtros.
- [ ] Se puede guardar como favorito.
- [ ] Se puede marcar como leído.

## Resumen

La biblioteca actual es una app front-end sin backend, con almacenamiento local y un catálogo de ejemplo muy simple. La documentación debe mantenerse alineada con eso: un sitio estático, con una colección real pequeña, una estructura modular y varios placeholders que sirven como referencia para ampliar la biblioteca.

La innovación reciente es la estructura reutilizable de la modal de información, donde la data se mantiene en un bloque oculto dentro del HTML principal y se reutiliza para generar la vista sin requerir intervención manual del usuario final.

Si se desea escalar el proyecto, el siguiente paso lógico sería reemplazar `localStorage` por una API o base de datos real, manteniendo la misma arquitectura visual y de catálogo.

## Cómo funciona el catálogo

La lógica del catálogo está basada en artículos con atributos `data-*` en `Inicio.html`.

Los principales son:

- `data-book-id`: identificador único del libro.
- `data-titulo`: nombre que se usa para la búsqueda.
- `data-materia`: materia (por ejemplo `informatica`, `literatura`, `matematica`).
- `data-grado`: nivel (por ejemplo `3a`, `9`, `2`).
- `data-anio`: año del material.
- `data-idioma`: idioma (`espanol`, `guarani`, `ingles`).

El archivo `static/js/library.js` usa esos datos para filtrar y buscar en tiempo real.

## Estado persistente

Los datos se guardan en el navegador con estas claves:

- `bdp_read_books`: libros marcados como leídos.
- `bdp_favorite_books`: libros guardados como favoritos.
- `bdp_book_catalog`: snapshot del catálogo para sincronizar detalle y favoritos.

## Cómo funciona la vista de detalle

Cada detalle de libro usa `data-book-id` en el `body` y luego `book-detail.js` busca el libro en el catálogo local para sincronizar datos y favoritos.

La vista incluye:

- portada del libro
- sinopsis
- botón para guardar en favoritos
- QR de la página
- botón para abrir el PDF
- enlace de descarga

## PDF y descarga

El proyecto usa un visor PDF que apunta a un servicio remoto de Cloudflare R2.

El patrón actual es:

```text
https://biblioteca-r2.williandesiderio3.workers.dev/[ruta]/[archivo.pdf]
```

En el detalle real del libro se usa esta idea:

```html
<button class="open-book-button" type="button" data-pdf="informatica/Fundamentos%20de%20programacio%CC%81n%205.pdf">Leer</button>
```

Y el script `static/js/lector-pdf.js` construye la URL completa al hacer clic.

### Importante sobre nombres de archivo

El archivo real del PDF se llama:

```text
Fundamentos de programación 5.pdf
```

El nombre tiene un acento combinado/variado en la palabra “programación”, y eso puede producir problemas si se reutiliza de forma literal en varias rutas. Para evitar errores, conviene:

- usar nombres más simples y consistentes
- normalizar acentos y caracteres raros
- aplicar codificación URL cuando sea necesario
- preferir nombres sin espacios problemáticos si se van a consumir en scripts o enlaces

## Cómo levantar el proyecto localmente

Como es una web estática, existe más de una forma:

### Opción 1: abrir directamente

Abre `index.html` desde el navegador.

### Opción 2: servirlo localmente

Desde la raíz del proyecto:

```bash
python -m http.server 8000
```

Y luego accede a:

```text
http://localhost:8000
```

## Qué está funcionando y qué debe corregirse

### Estado real del proyecto

Actualmente hay un libro de ejemplo realmente integrado al sistema:

- `Fundamentos de la Programación`
- portada: `biblioteca_libros/portadas/Fundamentos de la programación 5.webp`
- detalle: `templestes/Libro-Fundamentos-de-la-programacion.html`

### Problemas habituales que ya existen en el código

Los siguientes puntos están documentados porque son los que más suelen romper la app:

- Hay tarjetas en `Inicio.html` que apuntan a rutas tipo `/libros/...` que no existen en este repositorio.
- Algunos ejemplos son placeholders y no corresponden a archivos reales del proyecto.
- El catálogo actual tiene más ejemplos que libros reales.
- Los nombres de archivo con caracteres especiales pueden generar errores reales en enlaces y en la lectura del PDF.
- Los `data-book-id` deben mantenerse consistentes entre la tarjeta del catálogo y la página de detalle.

## Guía para agregar un nuevo libro

1. Crear la portada dentro de `biblioteca_libros/portadas/`.
2. Subir el PDF a `biblioteca_libros/pdfs/` si se va a abrir en la app.
3. Agregar una tarjeta en `Inicio.html` con `class="book-card"` y los atributos `data-*` correctos.
4. Usar un `data-book-id` único y normalizado.
5. Crear o duplicar la vista detalle en `templestes/` con el mismo identificador del libro.
6. Verificar que el PDF y la imagen existan realmente.
7. Revisar que los filtros y el buscador puedan encontrar el libro.

### Estructura mínima de una tarjeta

```html
<article
  class="book-card"
  data-book-id="nombre-del-libro"
  data-titulo="Nombre del Libro"
  data-materia="informatica"
  data-grado="3a"
  data-anio="2024"
  data-idioma="espanol"
>
</article>
```

### Recomendaciones

- Mantener un solo identificador consistente entre catálogo y detalle.
- Usar rutas relativas, no rutas absolutas tipo `/libros/...` salvo que exista dicha carpeta.
- Usar nombres simples y evitar caracteres raros si es posible.
- Revisar que el valor de `data-materia`, `data-grado`, `data-anio` y `data-idioma` coincida con los selectores del filtro.

## Checklist rápido antes de publicar un libro nuevo

- [ ] El `data-book-id` es único.
- [ ] El `data-titulo` coincide con el título visible.
- [ ] La portada existe y la ruta está bien.
- [ ] El PDF existe y la ruta apuntada es válida.
- [ ] La página de detalle usa el mismo identificador.
- [ ] El libro aparece en el buscador y en los filtros.
- [ ] Se puede guardar como favorito.
- [ ] Se puede marcar como leído.

## Resumen

La biblioteca actual es una app front-end sin backend, con almacenamiento local y un catálogo de ejemplo muy simple. La documentación debe mantenerse alineada con eso: un sitio estático, con una colección real pequeña, una estructura modular y varios placeholders que sirven como referencia para ampliar la biblioteca.

Si se desea escalar el proyecto, el siguiente paso lógico sería reemplazar `localStorage` por una API o base de datos real, manteniendo la misma arquitectura visual y de catálogo.
