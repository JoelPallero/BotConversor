# Cómo usar el BotConversor

## 1. Preparar los archivos

Copiá todos los archivos HTML y sus recursos (imágenes, CSS, JS, etc.) dentro de la carpeta **`input_html`**.

Nombrá los archivos así:
- La página de inicio puede llamarse `index.html`, `home.html` o `inicio.html`
- El resto de las páginas con su nombre tal cual, por ejemplo: `nosotros.html`, `contacto.html`, `servicios.html`

---

## 2. Abrir la terminal

Desde esta pantalla, abrí la terminal con **Ctrl + Ñ** o **Ctrl + J**.

---

## 3. Ejecutar el comando

Escribí esto y presioná Enter, reemplazando el nombre por el del cliente:

```
node convertir "Nombre del cliente"
```

---

## 4. Subir a WordPress

Cuando termine, abrí la carpeta **`output`** y vas a encontrar el archivo `.zip` listo.

En WordPress: **Apariencia → Temas → Añadir nuevo → Subir tema** → seleccionás el `.zip` → Instalar → Activar.
