const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
    console.error('\n❌ Error: Debes proporcionar el nombre del cliente.');
    console.error('Uso: node convertir "Nombre del Cliente"');
    console.error('Ejemplo: node convertir "Bodegas López"\n');
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
    fs.mkdirSync(inputDir);
    console.log(`\n⚠️  Carpeta 'input_html' creada en ${botDir}.`);
    console.log(`Por favor, coloca allí los archivos HTML y vuelve a ejecutar.\n`);
    process.exit(0);
}

const htmlFiles = fs.readdirSync(inputDir).filter(f => f.endsWith('.html'));

if (htmlFiles.length === 0) {
    console.log(`\n⚠️  No se encontraron archivos HTML en ${inputDir}.`);
    console.log(`Por favor, colócalos y vuelve a ejecutar.\n`);
    process.exit(0);
}

console.log(`\n🚀 Iniciando creación de tema para: ${clientName}`);
console.log(`--------------------------------------------------`);

fse.copySync(baseThemeDir, newThemeDir, {
    filter: (src, dest) => {
        const relPath = path.relative(baseThemeDir, src);
        if (relPath.startsWith(`page-templates${path.sep}`) && relPath !== 'page-templates') return false;
        if (relPath.startsWith(`templates${path.sep}`) && relPath !== 'templates') return false;
        if (relPath.includes('.git') || relPath.includes('.DS_Store')) return false;
        return true;
    }
});

const newTemplatesDir = path.join(newThemeDir, 'page-templates');
fse.ensureDirSync(newTemplatesDir);

const styleCssPath = path.join(newThemeDir, 'style.css');
if (fs.existsSync(styleCssPath)) {
    let styleCss = fs.readFileSync(styleCssPath, 'utf8');
    styleCss = styleCss.replace(/^Description:.*$/m, `Description: Tema Trompo personalizado para ${clientName}.`);
    fs.writeFileSync(styleCssPath, styleCss);
    console.log(`📝 Metadatos del tema actualizados (style.css).`);
}

const mainCssPath = path.join(newThemeDir, 'assets', 'css', 'main.css');
let cssRules = [];
let styleCounter = 1;

console.log(`\n⚙️  Procesando y convirtiendo HTMLs (Separando Header, Footer, Head, Body, CSS)...`);

let isFirstFile = true;
let createdPages = [];

for (const file of htmlFiles) {
    const filePath = path.join(inputDir, file);
    let html = fs.readFileSync(filePath, 'utf8');

    console.log(`  -> Convirtiendo y separando: ${file}`);

    // Extraer etiquetas <style>
    html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, p1) => {
        cssRules.push(`/* Estilos extraídos de <style> en ${file} */`);
        cssRules.push(p1.trim());
        return '';
    });

    // Extraer estilos en línea
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

    // ----- SPLIT LOGIC -----
    let headContent = '';
    let headerContent = '';
    let footerContent = '';
    let bodyContent = html;

    const headRegex = /(<head[\s\S]*?>)([\s\S]*?)(<\/head>)/i;
    const headMatch = bodyContent.match(headRegex);
    if (headMatch) {
        let fullHead = bodyContent.substring(0, headMatch.index + headMatch[0].length);
        fullHead = fullHead.replace(/<\/head>/i, '    <?php wp_head(); ?>\n</head>');
        headContent = fullHead;
        bodyContent = bodyContent.substring(headMatch.index + headMatch[0].length);
    }

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

    bodyContent = bodyContent.replace(/<\/body>\s*<\/html>/i, '');

    if (isFirstFile) {
        const globalHeaderPath = path.join(newThemeDir, 'header.php');
        const globalFooterPath = path.join(newThemeDir, 'footer.php');
        fs.writeFileSync(globalHeaderPath, headContent + '\n' + headerContent);
        fs.writeFileSync(globalFooterPath, footerContent);
        isFirstFile = false;
        console.log(`    ✔️ Creados header.php y footer.php globales.`);
    }

    let rawName = file.replace(/\.html$/i, '');
    let cleanName = rawName.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    let isHome = htmlFiles.length === 1 || /^(home|index|inicio)/i.test(rawName);
    
    let templatePath, fileName;
    if (isHome) {
        fileName = 'front-page.php';
        templatePath = path.join(newThemeDir, fileName); // A la raíz
        createdPages.push({ slug: 'inicio', title: 'Inicio', is_home: true });
    } else {
        fileName = rawName + '.php';
        templatePath = path.join(newTemplatesDir, fileName); // A page-templates
        createdPages.push({ slug: rawName, title: cleanName, is_home: false, template: 'page-templates/' + fileName });
    }
    
    let finalTemplate = `<?php\n/* Template Name: ${cleanName} */\nget_header();\n?>\n\n`;
    finalTemplate += bodyContent.trim() + '\n\n';
    finalTemplate += `<?php\nget_footer();\n?>`;

    fs.writeFileSync(templatePath, finalTemplate);
    console.log(`    ✔️ Creado template: ${fileName}`);
}

if (cssRules.length > 0) {
    fse.ensureDirSync(path.dirname(mainCssPath));
    let mainCssContent = fs.existsSync(mainCssPath) ? fs.readFileSync(mainCssPath, 'utf8') : '';
    
    mainCssContent += `\n\n/* ================================================== */\n`;
    mainCssContent += `/* ESTILOS AUTOMÁTICOS EXTRAÍDOS POR BOTCONVERSOR     */\n`;
    mainCssContent += `/* Cliente: ${clientName} */\n`;
    mainCssContent += `/* ================================================== */\n\n`;
    mainCssContent += cssRules.join('\n\n');
    
    fs.writeFileSync(mainCssPath, mainCssContent);
    console.log(`\n🎨 Estilos inyectados en assets/css/main.css`);
}

// 9. Generar auto-setup.php
const incDir = path.join(newThemeDir, 'inc');
fse.ensureDirSync(incDir);
const autoSetupPath = path.join(incDir, 'auto-setup.php');

let phpArray = createdPages.map(p => {
    return `        array('slug' => '${p.slug}', 'title' => '${p.title}', 'is_home' => ${p.is_home ? 'true' : 'false'}, 'template' => '${p.template || ''}')`;
}).join(',\n');

const autoSetupContent = `<?php
/**
 * Auto Setup: Crea páginas automáticamente al activar el tema.
 */

function hello_trompo_auto_setup_pages() {
    $pages = array(
${phpArray}
    );

    $home_id = 0;

    foreach ($pages as $p) {
        $existing = get_page_by_path($p['slug']);
        $page_id = 0;

        if (!$existing) {
            $page_id = wp_insert_post(array(
                'post_title'   => $p['title'],
                'post_name'    => $p['slug'],
                'post_status'  => 'publish',
                'post_type'    => 'page',
                'post_content' => ''
            ));

            if (!is_wp_error($page_id) && $p['template']) {
                update_post_meta($page_id, '_wp_page_template', $p['template']);
            }
        } else {
            $page_id = $existing->ID;
            if ($p['template']) {
                update_post_meta($page_id, '_wp_page_template', $p['template']);
            }
        }

        if ($p['is_home'] && $page_id && !is_wp_error($page_id)) {
            $home_id = $page_id;
        }
    }

    if ($home_id) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $home_id);
    }
    
    // Configurar menú temporal si hace falta (opcional)
    if (!has_nav_menu('primary')) {
        $menu_name = 'Menú Principal';
        $menu_exists = wp_get_nav_menu_object($menu_name);
        if (!$menu_exists) {
            $menu_id = wp_create_nav_menu($menu_name);
            foreach ($pages as $p) {
                $page = get_page_by_path($p['slug']);
                if ($page) {
                    wp_update_nav_menu_item($menu_id, 0, array(
                        'menu-item-title'  => $p['title'],
                        'menu-item-object-id' => $page->ID,
                        'menu-item-object' => 'page',
                        'menu-item-status' => 'publish',
                        'menu-item-type'   => 'post_type',
                    ));
                }
            }
            $locations = get_theme_mod('nav_menu_locations');
            $locations['primary'] = $menu_id;
            set_theme_mod('nav_menu_locations', $locations);
        }
    }
}

// Correr en la activación del tema
add_action('after_switch_theme', 'hello_trompo_auto_setup_pages');
`;

fs.writeFileSync(autoSetupPath, autoSetupContent);
console.log(`\n⚙️  Generado inc/auto-setup.php para crear las páginas en WP automáticamente.`);

console.log(`\n✅ Proceso completado exitosamente.`);
console.log(`   El nuevo tema se encuentra en: ${newThemeDir}\n`);


