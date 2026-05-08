# Cómo Convertir un HTML Estático a WordPress con Elementor

> **Fuente original:** [Elementor Blog — How to Convert HTML to WordPress](https://elementor.com/blog/how-to-convert-html-to-wordpress/)

---

## ¿Por qué migrar de HTML a WordPress?

Un sitio HTML estático es rápido, pero es una reliquia en términos de funcionalidad. La diferencia clave es:

- **Sitio estático:** cada página es un archivo separado y hardcodeado.
- **Sitio dinámico (WordPress):** el contenido vive en una base de datos y se muestra a través de templates.

### Ventajas de pasarse a WordPress

| Ventaja | Descripción |
|---|---|
| **Gestión de contenido fácil** | Publicás páginas y posts sin tocar código ni FTP |
| **Plugins** | Miles de plugins para SEO, seguridad, eCommerce, formularios, etc. |
| **Roles de usuario** | Podés dar acceso a editores sin que puedan romper el diseño |
| **Escalabilidad** | Un sitio WordPress puede crecer hasta ser una tienda o un portal de membresías |
| **Flexibilidad de diseño** | Podés cambiar el theme completo sin perder el contenido |

---

## Antes de empezar: planificación

Una migración exitosa es 90% planificación.

### Paso 1 — Hacé un backup completo de tu HTML

1. Conectate al servidor con un cliente FTP (FileZilla, Cyberduck).
2. Navegá al directorio raíz (generalmente `public_html` o `www`).
3. Seleccioná todos los archivos y carpetas.
4. Descargalos a una carpeta local de tu computadora.

> [!IMPORTANT]
> Este backup es tu red de seguridad. Si algo sale mal, podés restaurar el sitio original en cualquier momento.

### Paso 2 — Instalá WordPress

Tenés dos opciones:

- **Local (desarrollo privado):** usá [LocalWP](https://localwp.com/) o XAMPP para instalar WordPress en tu máquina. Migrás al servidor cuando esté listo.
- **En el servidor en un subdirectorio:** instalá WordPress en `tudominio.com/wordpress` para no bajar el sitio mientras trabajás.

Una vez que tengas hosting, usá el instalador "one-click" de tu proveedor para instalar WordPress.

### Paso 3 — Analizá la estructura de tu HTML

Identificá dos tipos de contenido en tu sitio actual:

**Elementos repetidos** (aparecen en todas las páginas):
- Header (logo, menú de navegación)
- Footer (información de copyright, links)
- Sidebar (si tenés)

**Layouts únicos por página:**
- Homepage (generalmente tiene un layout especial)
- Páginas estándar (About, Servicios)
- Página de Contacto (tiene un formulario)
- Página de Blog Post (layout para un artículo)
- Página de índice de Blog (lista de artículos)

---

## Métodos de conversión

Hay 4 métodos. A continuación se explica cada uno, de mayor a menor recomendación práctica.

---

## ⭐ Método 2 (Recomendado): Rebuild Visual con Elementor

> **El más popular, práctico y eficiente para la gran mayoría de usuarios.**

La filosofía es simple: en lugar de convertir código viejo y sucio, reconstruís el diseño visualmente, más rápido y mejor.

- **Ideal para:** dueños de negocios, freelancers, agencias, DIY-ers.
- **Requiere:** saber arrastrar y soltar. Nada más.

### ¿Por qué reconstruir en lugar de convertir?

Convertir manualmente (Método 1) es como desarmar un auto viejo y reutilizar sus piezas para construir uno nuevo. Reconstruir con un builder es como conseguir un auto nuevo y moderno y pintarlo para que se parezca al anterior.

El método de rebuild te da una base limpia, moderna y con buen rendimiento que podés actualizar fácilmente durante años.

---

### Paso a Paso: Rebuild con Elementor

#### Paso 1 — Instalá los cimientos

1. En tu WordPress, andá a **Apariencia > Temas > Añadir nuevo**.
2. Buscá e instalá el tema **"Hello Elementor"** — es un canvas en blanco, perfecto como base liviana.
3. Andá a **Plugins > Añadir nuevo**.
4. Buscá e instalá **"Elementor"**.
5. Se recomienda fuertemente tener **Elementor Pro**, ya que su Theme Builder es lo que hace a este método tan potente.

---

#### Paso 2 — Configurá los estilos globales

Antes de construir nada, igualá el branding de tu sitio viejo.

1. En el dashboard de WordPress, andá a **Elementor > Configuración > Site Settings**.
2. **Colores globales:** creá y nombrá los colores que coincidan con la paleta de tu HTML (ej. "Azul Marca", "Texto Oscuro").
3. **Fuentes globales:** configurá las fuentes para body, H1, H2, H3, etc., para que coincidan con tu sitio viejo.

> [!TIP]
> Este paso de 10 minutos te ahorra horas de trabajo. Cualquier widget que arrastres ya tendrá automáticamente la fuente y el color correcto de tu marca.

---

#### Paso 3 — Recreá el Header y Footer

Aquí es donde brilla el **Theme Builder de Elementor Pro**. En lugar de codear `header.php` y `footer.php`, lo hacés visualmente.

1. Andá a **Templates > Theme Builder**.
2. Hacé clic en "Añadir nuevo" y seleccioná **"Header"**.
3. Construí el header visualmente: arrastrá el widget Site Logo, Nav Menu, y los botones que tenías.
4. Cuando termines, hacé clic en **"Publicar"** y configurá la condición de visualización a **"Todo el sitio"**.
5. Repetí el proceso para el **Footer**.

> [!NOTE]
> En 15 minutos replicaste las dos partes más complejas de una conversión manual.

---

#### Paso 4 — Reconstruí las páginas

1. Andá a **Páginas > Añadir nueva**. Llamala "Homepage".
2. Hacé clic en el botón **"Editar con Elementor"**.
3. Con tu sitio HTML viejo abierto en una pantalla, reconstruilo visualmente en la otra.
4. Arrastrá una Sección (ícono "+"). Configurá las columnas.
5. Arrastrá widgets: Heading, Text Editor, Image, Button.
6. Copiá y pegá el texto de tu sitio viejo al nuevo. Subí las imágenes a la Biblioteca de Medios.

---

#### Paso 5 — Recreá los formularios

Tu `contact.html` probablemente tenía un formulario HTML complejo. Podés recrearlo en minutos:

1. Editá tu página "Contacto" con Elementor.
2. Arrastrá el widget **Form**.
3. Agregá, quitá y etiquetá tus campos (ej. "Nombre", "Email", "Mensaje").
4. En "Acciones After Submit", configurá "Email" (para que te llegue un mail) y "Collect Submissions" (para guardar en el dashboard de WordPress).

> [!TIP]
> Acabás de crear un formulario seguro y funcional sin tocar una línea de PHP.

---

#### Bonus: Acelerá con IA

Podés hacer todo esto aún más rápido con **Elementor AI**, integrado directamente en el builder:

- **Contenido:** Click derecho en el Text Editor y pedile a la IA que reescriba o mejore el texto.
- **Imágenes:** Usá el generador de imágenes AI para crear una imagen hero desde un prompt de texto.
- **Planificación:** Usá el [AI Site Planner](https://elementor.com/ai-site-planner) antes de empezar para obtener una estructura recomendada del sitio.

---

## Método 1: Creación Manual de Tema (Para Desarrolladores)

> **El método más profesional y técnico. Recomendado solo para developers.**

- **Ideal para:** desarrolladores, puristas del código, quienes necesitan control total.
- **Requiere:** HTML, CSS y al menos PHP básico.

### Archivos que necesitás crear

| Archivo | Función |
|---|---|
| `style.css` | Header del tema (nombre, autor, versión) + todo el CSS |
| `index.php` | Archivo de fallback principal |
| `header.php` | Parte superior del HTML (hasta el área de contenido) |
| `footer.php` | Parte inferior del HTML (footer hasta `</html>`) |
| `functions.php` | Centro de control: encola CSS/JS y registra menús |
| `page.php` | Template por defecto para páginas estáticas |

### Paso 1 — Creá la carpeta del tema y el `style.css`

1. En tu WordPress, navegá a `wp-content/themes/`.
2. Creá una carpeta nueva, ej. `mi-nuevo-tema`.
3. Dentro, creá `style.css` con el siguiente header obligatorio:

```css
/*
Theme Name: Mi Nuevo Tema
Theme URI: https://misitiio.com
Author: Tu Nombre
Author URI: https://misitiio.com
Description: Tema personalizado construido desde mi sitio HTML.
Version: 1.0
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Tags: custom-theme
Text Domain: minuevotema
*/

/* — Pegá todo tu CSS original debajo de esta línea — */
```

### Paso 2 — Creá `header.php`, `footer.php` e `index.php`

**`header.php`:** Copiá la parte superior de tu `index.html` (desde `<!DOCTYPE html>` hasta antes del contenido principal). Antes del cierre de `</head>` agregá:

```php
<?php wp_head(); ?>
```

**`footer.php`:** Copiá la parte inferior de tu HTML (desde `<footer>` hasta `</html>`). Antes del cierre de `</body>` agregá:

```php
<?php wp_footer(); ?>
```

**`index.php`** — Ejemplo básico:

```php
<?php get_header(); ?>

<main class="main-content">
  <?php if ( have_posts() ) : ?>
    <?php while ( have_posts() ) : the_post(); ?>
      <article <?php post_class(); ?> id="post-<?php the_ID(); ?>">
        <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
        <div class="entry-content">
          <?php the_content(); ?>
        </div>
      </article>
    <?php endwhile; ?>
  <?php else : ?>
    <h2><?php _e('Nada encontrado', 'minuevotema'); ?></h2>
  <?php endif; ?>
</main>

<?php get_footer(); ?>
```

### Paso 3 — Encolar estilos y scripts en `functions.php`

> [!WARNING]
> **No** uses una etiqueta `<link>` en `header.php` para cargar el CSS. La forma correcta en WordPress es encolarlo desde `functions.php`.

```php
<?php
function minuevotema_enqueue_scripts() {
    wp_enqueue_style(
        'minuevotema-style',
        get_stylesheet_uri(),
        array(),
        '1.0'
    );
}
add_action( 'wp_enqueue_scripts', 'minuevotema_enqueue_scripts' );

function minuevotema_setup() {
    register_nav_menus( array(
        'primary' => __( 'Menú Principal', 'minuevotema' ),
    ) );
}
add_action( 'after_setup_theme', 'minuevotema_setup' );
?>
```

### Paso 4 — Activar y finalizar

1. Comprimí la carpeta del tema en un `.zip`.
2. Andá a **Apariencia > Temas > Añadir nuevo > Subir tema**.
3. Activalo.
4. Andá a **Apariencia > Menús**, creá el "Menú Principal" y asignalo.
5. En `header.php`, reemplazá el menú HTML estático con:

```php
<?php wp_nav_menu( array( 'theme_location' => 'primary' ) ); ?>
```

---

## Método 3: Child Theme (Híbrido)

> **Combinación de código propio con un framework como Elementor.**

- **Ideal para:** desarrolladores que quieren usar el framework de Elementor pero también escribir PHP personalizado.
- **Ventaja:** podés personalizar el tema padre sin perder los cambios cuando se actualiza.

### Pasos rápidos

1. **Instalá el tema padre:** Instalá "Hello Elementor". **No lo actives.**
2. **Creá la carpeta del child theme:** En `wp-content/themes/`, creá `hello-elementor-child`.
3. **Creá `style.css`** con este header:

```css
/*
Theme Name:   Hello Elementor Child
Description:  Hello Elementor Child Theme
Template:     hello-elementor
Version:      1.0.0
*/
/* — Tu CSS personalizado abajo — */
```

4. **Creá `functions.php`** para cargar los estilos del padre y del hijo:

```php
<?php
function hello_elementor_child_enqueue_styles() {
    wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );
    wp_enqueue_style( 'child-style',  get_stylesheet_directory_uri() . '/style.css', array('parent-style') );
}
add_action( 'wp_enqueue_scripts', 'hello_elementor_child_enqueue_styles' );
?>
```

5. **Activá el child theme** desde **Apariencia > Temas**.
6. Ahora podés copiar archivos del tema padre a tu child theme para sobreescribirlos (ej. copiar `header.php` y modificarlo).

---

## Método 4: Plugins de Importación (No recomendado como solución completa)

> **El que todos buscan primero. El menos efectivo.**

Plugins como "HTML Import 2" o "WP Siteimporter" son **scrapers de contenido**, no convertidores de diseño. Lo que hacen:

✅ Importan el texto e imágenes de tus archivos HTML.
❌ **NO** crean un tema de WordPress.
❌ **NO** convierten tu diseño — el sitio va a verse como el tema activo por defecto.

Podés usarlo para ahorrarte el copy-paste de contenido, pero igual vas a necesitar el **Método 1 o 2** para recuperar el diseño.

---

## ✅ Checklist Post-Migración

Una vez que tu sitio nuevo está construido, **no terminaste**. Este checklist es esencial para no perder el SEO y no frustrar a los usuarios.

### 1. Configurar Permalinks

- Andá a **Configuración > Enlaces Permanentes**.
- Cambiá de "Simple" a **"Nombre de la entrada"**.
- Esto genera URLs amigables como `tudominio.com/sobre-nosotros`.

### 2. Configurar Navegación

- Andá a **Apariencia > Menús**.
- Creá tu nuevo menú y asignalo a la ubicación correcta del tema.

### 3. Testear todo

- [ ] Hacer clic en cada link del sitio.
- [ ] Completar y enviar cada formulario.
- [ ] Probar el sitio en celular, tablet y escritorio.

### 4. Instalar plugins esenciales

| Plugin | Para qué sirve |
|---|---|
| Yoast SEO / Rank Math | Gestionar sitemaps y meta descripciones |
| Wordfence / Sucuri | Seguridad del sitio |
| WP Rocket | Caché para mayor velocidad |
| UpdraftPlus | Backups automáticos programados |

### 5. Configurar Redirecciones 301 (¡CRÍTICO!)

> [!CAUTION]
> Tu sitio viejo tenía URLs como `tudominio.com/sobre-nosotros.html`. Tu sitio nuevo tiene `tudominio.com/sobre-nosotros/`. Los motores de búsqueda las ven como páginas distintas. **Si no redirigís, perdés todo el SEO acumulado.**

**Cómo hacerlo:**
1. Instalá el plugin **"Redirection"**.
2. Recorrí cada URL vieja y creá un redirect 301 a su nueva URL de WordPress.

```
/sobre-nosotros.html  →  /sobre-nosotros/
/contacto.html        →  /contacto/
/servicios.html       →  /servicios/
```

### 6. Eliminar el sitio HTML viejo

Una vez que hayas testeado todo y estés 100% seguro, podés eliminar los archivos HTML originales del servidor y mover WordPress al directorio raíz.

---

## Preguntas Frecuentes (FAQ)

**¿Puedo convertir HTML a WordPress gratis?**
Sí. Podés usar el Método 1 con un editor de texto gratuito, o el Método 2 con el tema gratuito Hello Elementor y la versión gratuita de Elementor. Sin embargo, las versiones Pro aceleran mucho el trabajo.

**¿Afecta al SEO la migración?**
Puede afectar tanto positiva como negativamente:
- **Negativamente:** si no configurás los redirects 301, perdés el posicionamiento.
- **Positivamente:** WordPress hace mucho más fácil gestionar el SEO, crear un blog y administrar meta descripciones.

**¿Cuánto tiempo lleva?**

| Método | Tiempo estimado (sitio de 5-10 páginas) |
|---|---|
| Método 1 (Manual) | 15-30 horas para un desarrollador profesional |
| Método 2 (Rebuild) | 2-4 horas con Elementor |
| Método 4 (Plugin) | 5 minutos de importación, pero el resultado está roto |

**¿Necesito saber PHP?**
- Método 1 (Manual): Sí, es obligatorio.
- Método 2 (Rebuild): No, ni una línea.
- Método 3 (Child Theme): Sí, PHP básico para `functions.php`.

**¿Elementor puede importar mis archivos HTML directamente?**
No. Elementor es un builder visual para crear layouts, no un convertidor de archivos. Se usa para recrear el diseño visualmente, lo cual es más limpio y estable que importar código viejo.

**¿Qué pasa con mi sitio HTML viejo?**
Permanece en el servidor hasta que lo eliminés. Por eso es mejor construir el nuevo WordPress en un subdirectorio, testear, y recién entonces eliminar los archivos HTML y mover WordPress al directorio principal.

**¿Puedo convertir un sitio de una sola página?**
Sí. Es un caso de uso perfecto para el Método 2. Creás una sola Página en WordPress, la construís con Elementor y usás Anchor Links en el menú para scrollear a las distintas secciones.

---

## Resumen: ¿Qué método elegir?

```
¿Sos desarrollador y necesitás control total?
  → Método 1 (Manual) o Método 3 (Child Theme)

¿Sos dueño de negocio, freelancer o diseñador?
  → Método 2 (Rebuild con Elementor) ✅ RECOMENDADO

¿Solo querés importar el contenido (texto e imágenes) rápido?
  → Método 4 (Plugin), pero igual necesitarás el Método 2 para el diseño.
```

> [!NOTE]
> Para el **90% de los casos**, el **Método 2 (Rebuild Visual con Elementor)** es la opción óptima: es exponencialmente más rápido que el método manual, no requiere código, y el resultado es un sitio limpio, responsive y fácil de mantener a largo plazo.
