const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Asegurar que fs-extra esté instalado
function ensureDependencies() {
    try {
        require('fs-extra');
    } catch (e) {
        console.log("Instalando dependencias necesarias (fs-extra)...");
        execSync('npm install fs-extra', { stdio: 'inherit' });
    }
}
ensureDependencies();

const fse = require('fs-extra');

const clientName = process.argv[2];
if (!clientName) {
    console.error('\n❌ Error: Debes proporcionar el nombre del cliente. Ejemplo: node convertir.js "Mi Cliente"');
    process.exit(1);
}

const botDir = __dirname;
const inputDir = path.join(botDir, 'input_html');

// Permitir elegir el modelo, por defecto 'Trompo-Theme'
const modelName = process.argv[3] || 'Trompo-Theme';
const baseThemeDir = path.join(botDir, 'Models', modelName);

const folderName = clientName
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const outputDir = path.join(botDir, 'output');
fse.ensureDirSync(outputDir);
const newThemeDir = path.join(outputDir, `${modelName}-${folderName}`);

if (!fs.existsSync(baseThemeDir)) {
    console.error(`\n❌ Error: No se encontró el tema base en ${baseThemeDir}\n`);
    process.exit(1);
}

if (!fs.existsSync(inputDir)) {
    console.error(`\n❌ Error: No se encontró la carpeta input_html. Creala y poné tus HTML ahí.\n`);
    process.exit(1);
}

const htmlFiles = fs.readdirSync(inputDir).filter(f => f.endsWith('.html'));
if (htmlFiles.length === 0) {
    console.error(`\n❌ Error: No se encontraron archivos HTML en la carpeta input_html.\n`);
    process.exit(1);
}

console.log(`\n🚀 Iniciando creación de tema para: ${clientName} usando modelo: ${modelName}`);

// 1. Copiar el tema base
fse.copySync(baseThemeDir, newThemeDir, {
    filter: (src, dest) => {
        const relPath = path.relative(baseThemeDir, src);
        if (relPath.includes('.git') || relPath.includes('.DS_Store')) return false;
        return true;
    }
});

// 2. Modificar style.css
const styleCssPath = path.join(newThemeDir, 'style.css');
if (fs.existsSync(styleCssPath)) {
    let styleCss = fs.readFileSync(styleCssPath, 'utf8');
    styleCss = styleCss.replace(/^Description:.*$/m, `Description: Tema personalizado para ${clientName}.`);
    fs.writeFileSync(styleCssPath, styleCss);
    console.log('📝 Metadatos del tema actualizados (style.css).');
}

const mainCssPath = path.join(newThemeDir, 'assets', 'css', 'main.css');
let cssRules = [];
let styleCounter = 1;
let isFirstFile = true;
let createdPages = [];

console.log(`\n⚙️  Procesando y convirtiendo HTMLs...`);

for (const file of htmlFiles) {
    const filePath = path.join(inputDir, file);
    let html = fs.readFileSync(filePath, 'utf8');

    console.log(`  -> Procesando: ${file}`);

    // Extraer etiquetas <style> completas
    html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, p1) => {
        cssRules.push(`/* Estilos extraídos de <style> en ${file} */`);
        cssRules.push(p1.trim());
        return '';
    });

    // Extraer estilos inline (style="...")
    html = html.replace(/<([a-zA-Z0-9\-]+)([^>]*?)\bstyle\s*=\s*(["'])([\s\S]*?)\3([^>]*?)>/gi, (match, tagName, beforeStyle, quote, styleContent, afterStyle) => {
        let className = `tc-inline-${folderName}-${styleCounter++}`;
        cssRules.push(`/* Extraído de ${file} */\n.${className} { ${styleContent} }`);
        
        let restOfTag = beforeStyle + afterStyle;
        if (/class\s*=\s*["']/i.test(restOfTag)) {
            restOfTag = restOfTag.replace(/class\s*=\s*(["'])(.*?)\1/i, (matchCls, q, existingClasses) => {
                let classes = existingClasses.trim();
                return classes ? `class=${q}${classes} ${className}${q}` : `class=${q}${className}${q}`;
            });
        } else {
            restOfTag += ` class="${className}"`;
        }
        return `<${tagName}${restOfTag}>`;
    });

    let headContent = '';
    let headerContent = '';
    let footerContent = '';
    let bodyContent = html;

    // Extraer y procesar <head>
    const headRegex = /(<head[\s\S]*?>)([\s\S]*?)(<\/head>)/i;
    const headMatch = bodyContent.match(headRegex);
    if (headMatch) {
        let fullHead = bodyContent.substring(0, headMatch.index + headMatch[0].length);
        fullHead = fullHead.replace(/<\/head>/i, '    <?php wp_head(); ?>\n</head>');
        headContent = fullHead;
        bodyContent = bodyContent.substring(headMatch.index + headMatch[0].length);
    }

    // Extraer y procesar <body> inicial y <nav> / <header>
    const headerRegex = /(<body[\s\S]*?>[\s\S]*?(?:<\/nav>|<\/header>))/i;
    const headerMatch = bodyContent.match(headerRegex);
    if (headerMatch) {
        let hContent = headerMatch[0];
        hContent = hContent.replace(/<body([^>]*)>/i, '<body$1 <?php body_class(); ?>>\n<?php wp_body_open(); ?>');
        headerContent = hContent;
        bodyContent = bodyContent.substring(headerMatch.index + headerMatch[0].length);
    } else {
        const bodyTagRegex = /(<body[^>]*>)/i;
        const bodyMatch = bodyContent.match(bodyTagRegex);
        if (bodyMatch) {
            headerContent = bodyMatch[0].replace(/<body([^>]*)>/i, '<body$1 <?php body_class(); ?>>\n<?php wp_body_open(); ?>');
            bodyContent = bodyContent.substring(bodyMatch.index + bodyMatch[0].length);
        }
    }

    // Extraer y procesar <footer> y final
    const footerRegex = /(<footer[\s\S]*)/i;
    const footerMatch = bodyContent.match(footerRegex);
    if (footerMatch) {
        footerContent = footerMatch[0];
        footerContent = footerContent.replace(/<\/body>/i, '<?php wp_footer(); ?>\n</body>');
        bodyContent = bodyContent.substring(0, footerMatch.index);
    } else {
        const scriptRegex = /(<script[\s\S]*<\/html>)/i;
        const scriptMatch = bodyContent.match(scriptRegex);
        if (scriptMatch) {
            footerContent = scriptMatch[0];
            footerContent = footerContent.replace(/<\/body>/i, '<?php wp_footer(); ?>\n</body>');
            bodyContent = bodyContent.substring(0, scriptMatch.index);
        }
    }

    // Limpiar restos HTML
    bodyContent = bodyContent.replace(/<\/body>\s*<\/html>/gi, '').trim();

    // Solo creamos header.php y footer.php una vez usando el primer HTML como referencia
    if (isFirstFile) {
        const globalHeaderPath = path.join(newThemeDir, 'header.php');
        const globalFooterPath = path.join(newThemeDir, 'footer.php');
        fs.writeFileSync(globalHeaderPath, headContent + '\n' + headerContent);
        fs.writeFileSync(globalFooterPath, footerContent);
        console.log('    ✔️ Creados header.php y footer.php globales.');
        isFirstFile = false;
    }

    // Normalizar nombres para DB
    let rawName = file.replace(/\.html$/i, '').replace(/[-_]/g, ' ');
    let cleanName = rawName.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '').replace(/\s+/g, ' ').trim();
    
    // Normalizar slugs para identificar si es home
    let normalizedName = cleanName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    let isHome = htmlFiles.length === 1 || /^(home|index|inicio)$/i.test(normalizedName);
    
    // Escapar el contenido HTML para que entre correctamente como string en el auto-setup.php
    // Usamos base64 para evitar todos los problemas de escape en strings PHP
    let encodedContent = Buffer.from(bodyContent).toString('base64');
    
    if (isHome) {
        createdPages.push({ slug: 'inicio', title: 'Inicio', is_home: true, content_b64: encodedContent });
        console.log(`    ✔️ Identificada como página de Inicio.`);
    } else {
        let slug = normalizedName.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        createdPages.push({ slug: slug, title: cleanName, is_home: false, content_b64: encodedContent });
        console.log(`    ✔️ Identificada como página interna: ${cleanName}`);
    }
}

// 3. Crear templates genéricos de WordPress
console.log(`\n⚙️  Generando templates de renderizado...`);
const frontPagePath = path.join(newThemeDir, 'front-page.php');
const pagePath = path.join(newThemeDir, 'page.php');

const wpLoopTemplate = `<?php
/**
 * Renderiza el contenido directamente desde la base de datos de WordPress
 */
get_header(); ?>

<main id="content" class="site-main">
    <?php
    if (have_posts()) :
        while (have_posts()) : the_post();
            the_content();
        endwhile;
    endif;
    ?>
</main>

<?php get_footer(); ?>
`;

fs.writeFileSync(frontPagePath, wpLoopTemplate);
fs.writeFileSync(pagePath, wpLoopTemplate);
console.log('    ✔️ Creados front-page.php y page.php dinámicos con the_content().');

// 4. Inyectar CSS si es necesario
if (cssRules.length > 0) {
    fse.ensureDirSync(path.dirname(mainCssPath));
    let mainCssContent = fs.existsSync(mainCssPath) ? fs.readFileSync(mainCssPath, 'utf8') : '';
    mainCssContent += `\n\n/* ESTILOS AUTOMÁTICOS BOTCONVERSOR */\n` + cssRules.join('\n\n');
    fs.writeFileSync(mainCssPath, mainCssContent);
    console.log(`🎨 Estilos inyectados en assets/css/main.css`);
}

// 5. Generar script auto-setup.php
console.log(`\n⚙️  Generando lógica de importación en inc/auto-setup.php...`);
const incDir = path.join(newThemeDir, 'inc');
fse.ensureDirSync(incDir);
const autoSetupPath = path.join(incDir, 'auto-setup.php');

let phpPagesArray = createdPages.map(p => {
    return `        array(
            'slug'    => '${p.slug}', 
            'title'   => '${p.title}', 
            'is_home' => ${p.is_home ? 'true' : 'false'}, 
            'content' => base64_decode('${p.content_b64}')
        )`;
}).join(',\n');

const autoSetupContent = `<?php
/**
 * Auto Setup: Importa HTML a la DB y configura Home automáticamente
 */

function hello_trompo_auto_setup_pages() {
    $log_file = WP_CONTENT_DIR . '/theme-setup-log.txt';
    file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Iniciando importacion de paginas BotConversor...\n", FILE_APPEND);

    $pages = array(
${phpPagesArray}
    );

    $home_id = 0;

    foreach ($pages as $p) {
        $existing = get_page_by_path($p['slug']);
        $page_id = 0;

        if (!$existing) {
            // La página no existe, la creamos
            $page_id = wp_insert_post(array(
                'post_title'   => $p['title'],
                'post_name'    => $p['slug'],
                'post_status'  => 'publish',
                'post_type'    => 'page',
                'post_content' => $p['content']
            ));

            if (!is_wp_error($page_id)) {
                file_put_contents($log_file, "Creada pagina: {$p['title']} (Slug: {$p['slug']}, ID: {$page_id})\n", FILE_APPEND);
            } else {
                file_put_contents($log_file, "Error creando {$p['slug']}: " . $page_id->get_error_message() . "\n", FILE_APPEND);
            }
        } else {
            // La página existe, actualizamos su contenido y forzamos publish
            $page_id = $existing->ID;
            $update_result = wp_update_post(array(
                'ID'           => $page_id,
                'post_title'   => $p['title'],
                'post_status'  => 'publish',
                'post_content' => $p['content']
            ));
            
            if (!is_wp_error($update_result)) {
                file_put_contents($log_file, "Actualizada pagina: {$p['title']} (Slug: {$p['slug']}, ID: {$page_id})\n", FILE_APPEND);
            } else {
                file_put_contents($log_file, "Error actualizando {$p['slug']}: " . $update_result->get_error_message() . "\n", FILE_APPEND);
            }
        }

        // Si es la home declarada, guardamos el ID para setearla como front-page
        if ($p['is_home'] && $page_id && !is_wp_error($page_id)) {
            $home_id = $page_id;
        }
    }

    // Configurar la portada del sitio
    if ($home_id) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $home_id);
        file_put_contents($log_file, "Exito: Front-page configurada con la pagina ID: {$home_id}\n", FILE_APPEND);
    } else {
        file_put_contents($log_file, "Aviso: No se identifico ninguna pagina como Inicio.\n", FILE_APPEND);
    }
    
    file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Importacion finalizada.\n\n", FILE_APPEND);
}
add_action('after_switch_theme', 'hello_trompo_auto_setup_pages');
`;

fs.writeFileSync(autoSetupPath, autoSetupContent);
console.log('    ✔️ Creado auto-setup.php con logs y soporte para db insert/update.');

console.log(`\n✅ Proceso completado exitosamente.`);
console.log(`   El nuevo tema se encuentra en: ${newThemeDir}`);
console.log(`   Una vez activado el tema, revisá los logs en wp-content/theme-setup-log.txt`);
