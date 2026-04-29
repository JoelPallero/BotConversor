# Reglas del Agente (BotConversor)

Este documento define las reglas estrictas bajo las cuales debe operar el BotConversor para generar nuevos temas a partir del `Trompo-Theme` base.

## 1. Responsabilidad Principal
- Generar una nueva carpeta de tema WordPress basada exactamente en `Trompo-Theme`, pero personalizada para un cliente específico.
- Convertir archivos `.html` crudos en archivos `.php` de plantillas (templates) de WordPress.
- Extraer estilos (etiquetas `<style>` y atributos en línea `style="..."`) de los archivos HTML y centralizarlos en el CSS del tema.

## 2. Restricciones Críticas (HTML)
- **No modificar la estructura del HTML:** El código fuente original, la indentación, el orden de los elementos, las mayúsculas/minúsculas y la sintaxis deben mantenerse IDÉNTICOS, a excepción de:
  - Eliminar las etiquetas `<style>` y su contenido.
  - Eliminar los atributos `style="..."` de las etiquetas.
  - Añadir clases a los elementos para reemplazar sus estilos en línea.
- No se deben inyectar etiquetas automáticas (`<html>`, `<head>`, `<body>`) si no existen en el archivo original.
- No se deben alterar los atributos existentes (por ejemplo, corregir comillas faltantes o convertir valores a minúsculas).

## 3. Manejo de Estilos (CSS)
- Todo el CSS extraído (de etiquetas `<style>` y atributos `style="..."`) debe ir concatenado al final del archivo `assets/css/main.css` (o el equivalente donde corresponda) del nuevo tema.
- Se deben usar nombres de clases autogenerados para reemplazar estilos en línea (ej. `.tc-inline-1`, `.tc-inline-2`).
- Las etiquetas `<style>` incrustadas se remueven del HTML y su contenido pasa directamente al CSS principal.

## 4. Estructura de Directorios
- Se parte de un tema base (Ej. `Trompo-Theme`).
- Se crea el nuevo tema en el mismo nivel, nombrado con sufijo: `Trompo-Theme-[Nombre-Cliente]`.
- Se copian todos los archivos y carpetas del tema base **excepto** el contenido de la carpeta `/templates/`.
- Los HTML procesados se guardan con extensión `.php` en la carpeta `/templates/` del nuevo tema.

## 5. Metadatos del Tema
- En el archivo `style.css` de la raíz del nuevo tema, el nombre del tema (ej. `Theme Name: Trompo Theme`) se debe mantener idéntico (para no romper configuraciones).
- Se debe modificar la **Descripción** para reflejar que es para el cliente específico: `Description: Tema Trompo personalizado para [Nombre Cliente].`
## El nombre del sitio tiene que ser `[Nombre Cliente]` y se debe insertar en el archivo `functions.php` dentro de la funcion `setup_site_identity` y cambiar el valor de `site_title`.

## 6. Autonomía
- El bot debe ejecutarse de forma independiente, comprobando sus propias dependencias y creándolas / instalándolas si faltan, sin requerir intervención extra del usuario.

---

## 7. Reglas de Ejecución WordPress (🔴 OBLIGATORIO)

- `auto-setup.php` **DEBE** siempre ser requerido desde `functions.php` usando el patrón con variable:
  ```php
  $auto_setup_file = get_template_directory() . '/inc/auto-setup.php';
  if (file_exists($auto_setup_file)) {
      require_once $auto_setup_file;
  }
  ```
- El sistema **NO DEBE** depender solamente de `after_switch_theme`.
- Una ejecución de fallback vía `admin_init` es **OBLIGATORIA** para garantizar que el setup se complete aunque el hook de activación falle.

## 8. Reglas de Renderizado de Templates (🔴 OBLIGATORIO)

- El HTML **DEBE** ser convertido en templates PHP reales (`front-page.php`, `page-{slug}.php`).
- Usar solamente `the_content()` **NO** es suficiente para producción.
- `front-page.php` **DEBE** existir si se detecta una página de inicio.
- `page-{slug}.php` **DEBE** ser generado para cada archivo HTML procesado.
- Cada template debe incluir `<?php get_header(); ?>` al inicio y `<?php get_footer(); ?>` al final.

## 9. Reglas de Robustez (🔴 OBLIGATORIO)

- `header.php` **DEBE** siempre incluir `wp_head()`.
- `footer.php` **DEBE** siempre incluir `wp_footer()`.
- Si no se encuentran en el HTML original, **DEBEN** ser inyectados como fallback.
- Si existe `<footer>` pero no tiene `wp_footer()`, debe inyectarse antes de `</body>`.
- Si no existe `<head>`, debe generarse un `<head>` completo válido con `wp_head()`.

## 10. Reglas de Detección de Home (🔴 OBLIGATORIO)

- La detección de página de inicio debe ser flexible y basada en regex.
- Debe soportar los siguientes patrones (incluyendo compuestos como `front-page-v2`):
  - `home`
  - `index`
  - `inicio`
  - `front-page`
  - `frontpage`
- Si solo hay un archivo HTML, se asume como home automáticamente.

## 11. Reglas de Sincronización con Base de Datos (🔴 OBLIGATORIO)

- Las páginas **DEBEN** ser creadas O actualizadas (nunca omitidas).
- Los slugs **DEBEN** ser aplicados en la actualización (`post_name`).
- `post_type` **DEBE** ser siempre `'page'` en `wp_update_post`.
- `post_status` **DEBE** ser siempre `'publish'`.
