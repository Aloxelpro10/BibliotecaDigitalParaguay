# Biblioteca Digital Paraguay

Base inicial para una biblioteca digital estudiantil.

## Estructura

- `templestes/`: paginas HTML.
- `static/css/`: estilos del sitio.
- `static/js/`: comportamiento del sitio y seguimiento local.
- `static/img/`: imagenes generales, como el mosaico de libros del inicio.
- `biblioteca_libros/portadas/`: imagenes de portada de cada libro.
- `biblioteca_libros/pdfs/`: archivos PDF de los libros.

## Abrir localmente con Flask

Instala las dependencias si todavia no las tienes:

```powershell
pip install -r requirements.txt
```

Luego inicia el servidor desde la carpeta del proyecto:

```powershell
python app.py
```

Abre `http://localhost:8000`.

Para publicarlo temporalmente con ngrok u otra herramienta similar, apunta ngrok al puerto `8000`.

## Seguimiento de lectura

La pagina de recomendados guarda los libros marcados como leidos usando almacenamiento local del navegador. Si mas adelante se agrega inicio de sesion, esa misma accion puede conectarse a una base de datos en la nube.

## Etiquetas y busqueda

Cada libro de `templestes/recomendados.html` puede filtrarse con estos atributos:

- `data-titulo`: nombre usado por el buscador.
- `data-materia`: materia del libro.
- `data-grado`: grado o curso.
- `data-anio`: año del material.
- `data-idioma`: idioma del material.

El libro `Matematica de Prueba` queda como ejemplo para copiar y crear nuevos libros con etiquetas.
