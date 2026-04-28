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

## 6. Autonomía
- El bot debe ejecutarse de forma independiente, comprobando sus propias dependencias y creándolas / instalándolas si faltan, sin requerir intervención extra del usuario.
