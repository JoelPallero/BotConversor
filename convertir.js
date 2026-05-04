const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Asegurar dependencias necesarias
function ensureDependencies() {
    for (const dep of ['fs-extra', 'archiver', 'cheerio']) {
        try {
            require(dep);
        } catch (e) {
            console.log(`Instalando dependencia necesaria (${dep})...`);
            execSync(`npm install ${dep}`, { stdio: 'inherit' });
        }
    }
}
ensureDependencies();

const fse = require('fs-extra');

// ===== Manejo de assets externos (CSS, JS, imágenes, fuentes, etc.) =====

const ASSET_EXTENSIONS = new Set([
    '.css', '.js', '.mjs',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.avif', '.bmp', '.tiff',
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    '.mp4', '.webm', '.ogg', '.mp3', '.wav',
    '.pdf', '.json', '.xml', '.map'
]);

function isLocalAssetUrl(url) {
    if (!url) return false;
    url = url.trim();
    if (url.startsWith('http://') || url.startsWith('https://') ||
        url.startsWith('//') || url.startsWith('data:') ||
        url.startsWith('#') || url.startsWith('mailto:') ||
        url.startsWith('tel:') || url.startsWith('javascript:')) return false;
    const clean = url.split('?')[0].split('#')[0].trim();
    const ext = path.extname(clean).toLowerCase();
    return ASSET_EXTENSIONS.has(ext);
}

function cleanUrl(url) {
    return url.split('?')[0].split('#')[0].trim();
}

function collectHtmlAssets(html) {
    const assets = new Set();
    let m;

    const hrefRegex = /\shref\s*=\s*(["'])(.*?)\1/gi;
    while ((m = hrefRegex.exec(html)) !== null) {
        const url = cleanUrl(m[2]);
        if (isLocalAssetUrl(url)) assets.add(url);
    }

    const srcRegex = /\ssrc\s*=\s*(["'])(.*?)\1/gi;
    while ((m = srcRegex.exec(html)) !== null) {
        const url = cleanUrl(m[2]);
        if (isLocalAssetUrl(url)) assets.add(url);
    }

    const srcsetRegex = /\ssrcset\s*=\s*(["'])(.*?)\1/gi;
    while ((m = srcsetRegex.exec(html)) !== null) {
        for (const part of m[2].split(',')) {
            const url = cleanUrl(part.trim().split(/\s+/)[0]);
            if (isLocalAssetUrl(url)) assets.add(url);
        }
    }

    return [...assets];
}

function collectCssAssets(cssContent) {
    const assets = new Set();
    const urlRegex = /url\s*\(\s*(["']?)(.*?)\1\s*\)/gi;
    let m;
    while ((m = urlRegex.exec(cssContent)) !== null) {
        const url = cleanUrl(m[2]);
        if (isLocalAssetUrl(url)) assets.add(url);
    }
    return [...assets];
}

function copyExternalAssets(htmlAssets, inputDir, newThemeDir) {
    const copied = new Set();
    const queue = htmlAssets.map(a => ({ assetPath: a, baseDir: '' }));

    while (queue.length > 0) {
        const { assetPath, baseDir } = queue.shift();
        const resolvedPath = baseDir
            ? path.join(baseDir, assetPath).replace(/\\/g, '/')
            : assetPath;

        if (copied.has(resolvedPath)) continue;

        const sourcePath = path.join(inputDir, resolvedPath);
        if (!fs.existsSync(sourcePath)) continue;

        const destPath = path.join(newThemeDir, resolvedPath);
        fse.ensureDirSync(path.dirname(destPath));
        fse.copySync(sourcePath, destPath);
        copied.add(resolvedPath);

        if (resolvedPath.endsWith('.css')) {
            const cssContent = fs.readFileSync(sourcePath, 'utf8');
            const cssDir = path.dirname(resolvedPath);
            for (const cssAsset of collectCssAssets(cssContent)) {
                queue.push({ assetPath: cssAsset, baseDir: cssDir });
            }
        }
    }

    return [...copied];
}

function rewriteHtmlAssetPaths(html, copiedAssets) {
    if (copiedAssets.length === 0) return html;
    const copiedSet = new Set(copiedAssets.map(p => p.replace(/\\/g, '/')));

    const wpUri = (p) => `<?php echo get_template_directory_uri(); ?>/${p}`;

    html = html.replace(/(\shref\s*=\s*)(["'])(.*?)\2/gi, (match, prefix, quote, href) => {
        const clean = cleanUrl(href);
        return (isLocalAssetUrl(clean) && copiedSet.has(clean))
            ? `${prefix}${quote}${wpUri(clean)}${quote}`
            : match;
    });

    html = html.replace(/(\ssrc\s*=\s*)(["'])(.*?)\2/gi, (match, prefix, quote, src) => {
        const clean = cleanUrl(src);
        return (isLocalAssetUrl(clean) && copiedSet.has(clean))
            ? `${prefix}${quote}${wpUri(clean)}${quote}`
            : match;
    });

    html = html.replace(/(\ssrcset\s*=\s*)(["'])(.*?)\2/gi, (_match, prefix, quote, srcset) => {
        const parts = srcset.split(',').map(part => {
            const trimmed = part.trim();
            const spaceIdx = trimmed.search(/\s/);
            if (spaceIdx === -1) {
                const clean = cleanUrl(trimmed);
                return (isLocalAssetUrl(clean) && copiedSet.has(clean)) ? wpUri(clean) : trimmed;
            }
            const url = trimmed.substring(0, spaceIdx);
            const descriptor = trimmed.substring(spaceIdx);
            const clean = cleanUrl(url);
            return (isLocalAssetUrl(clean) && copiedSet.has(clean))
                ? wpUri(clean) + descriptor
                : trimmed;
        });
        return `${prefix}${quote}${parts.join(', ')}${quote}`;
    });

    return html;
}

// ===== Revisión de calidad del tema generado =====

function getAllPhpFiles(dir) {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) results.push(...getAllPhpFiles(fullPath));
        else if (entry.isFile() && entry.name.endsWith('.php')) results.push(fullPath);
    }
    return results;
}

function reviewGeneratedTheme(themeDir) {
    const critical = [];
    const important = [];
    const minor = [];

    // style.css: campos obligatorios
    const styleCssFile = path.join(themeDir, 'style.css');
    if (fs.existsSync(styleCssFile)) {
        const css = fs.readFileSync(styleCssFile, 'utf8');
        for (const field of ['Theme Name', 'Version', 'Author', 'Text Domain']) {
            if (!new RegExp(`^${field}:`, 'm').test(css)) {
                critical.push(`style.css: falta campo obligatorio "${field}"`);
            }
        }
        if (!/^License:/m.test(css)) minor.push('style.css: falta campo "License" (recomendado)');
        if (!/^Domain Path:/m.test(css)) minor.push('style.css: falta campo "Domain Path" (recomendado)');
    } else {
        critical.push('style.css: no existe');
    }

    // header.php
    const headerFile = path.join(themeDir, 'header.php');
    if (fs.existsSync(headerFile)) {
        const h = fs.readFileSync(headerFile, 'utf8');
        if (!/wp_head\s*\(\s*\)/.test(h)) critical.push('header.php: falta wp_head()');
        if (!/wp_body_open\s*\(\s*\)/.test(h)) important.push('header.php: falta wp_body_open()');
        if (!/DOCTYPE/i.test(h)) important.push('header.php: falta DOCTYPE');
        if (!/language_attributes\s*\(\s*\)/.test(h)) important.push('header.php: falta language_attributes()');
    } else {
        critical.push('header.php: no existe');
    }

    // footer.php
    const footerFile = path.join(themeDir, 'footer.php');
    if (fs.existsSync(footerFile)) {
        const f = fs.readFileSync(footerFile, 'utf8');
        if (!/wp_footer\s*\(\s*\)/.test(f)) critical.push('footer.php: falta wp_footer()');
    } else {
        critical.push('footer.php: no existe');
    }

    // functions.php
    const functionsFile = path.join(themeDir, 'functions.php');
    if (fs.existsSync(functionsFile)) {
        const fn = fs.readFileSync(functionsFile, 'utf8');
        if (!/wp_enqueue_scripts/.test(fn)) critical.push('functions.php: falta hook wp_enqueue_scripts');
        if (!/after_setup_theme/.test(fn)) critical.push('functions.php: falta hook after_setup_theme');
    } else {
        critical.push('functions.php: no existe');
    }

    // templates: get_header / get_footer
    const templateFiles = ['index.php', 'front-page.php', 'page.php', '404.php', 'archive.php', 'search.php', 'single.php'];
    for (const tpl of templateFiles) {
        const tplPath = path.join(themeDir, tpl);
        if (!fs.existsSync(tplPath)) continue;
        const content = fs.readFileSync(tplPath, 'utf8');
        if (!/get_header\s*\(/.test(content)) important.push(`${tpl}: falta get_header()`);
        if (!/get_footer\s*\(/.test(content)) important.push(`${tpl}: falta get_footer()`);
    }

    // page-{slug}.php generados dinámicamente
    for (const entry of fs.readdirSync(themeDir)) {
        if (/^page-.+\.php$/.test(entry)) {
            const content = fs.readFileSync(path.join(themeDir, entry), 'utf8');
            if (!/get_header\s*\(/.test(content)) important.push(`${entry}: falta get_header()`);
            if (!/get_footer\s*\(/.test(content)) important.push(`${entry}: falta get_footer()`);
        }
    }

    // ABSPATH en todos los PHP (confirmación post-inyección)
    for (const phpFile of getAllPhpFiles(themeDir)) {
        const content = fs.readFileSync(phpFile, 'utf8');
        if (!/defined\s*\(\s*['"]ABSPATH['"]\s*\)/.test(content)) {
            critical.push(`${path.relative(themeDir, phpFile).replace(/\\/g, '/')}: falta check ABSPATH`);
        }
    }

    return { critical, important, minor };
}

// ===== Generador de base Hello Trompo (modo Elementor) =====

function generateHelloTrompoBase(themeDir, clientName, themeName) {
    fse.ensureDirSync(themeDir);
    fse.ensureDirSync(path.join(themeDir, 'assets', 'css'));
    fse.ensureDirSync(path.join(themeDir, 'assets', 'js'));
    fse.ensureDirSync(path.join(themeDir, 'assets', 'images'));
    fse.ensureDirSync(path.join(themeDir, 'assets', 'fonts'));
    fse.ensureDirSync(path.join(themeDir, 'inc'));

    fs.writeFileSync(path.join(themeDir, 'style.css'),
`/*
Theme Name: ${themeName}
Theme URI: https://trompoagencia.com
Author: Trompo Agencia
Author URI: https://trompoagencia.com
Description: Tema personalizado para ${clientName}.
Version: 1.0.0
License: GNU General Public License v2 or later
License URI: LICENSE
Text Domain: hello-trompo
Domain Path: /languages
*/
`);

    fs.writeFileSync(path.join(themeDir, 'functions.php'),
`<?php
if (!defined('ABSPATH')) { exit; }

function hello_trompo_setup() {
    add_theme_support('automatic-feed-links');
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'script', 'style'));
    add_theme_support('custom-logo');
    add_theme_support('align-wide');
}
add_action('after_setup_theme', 'hello_trompo_setup');

function hello_trompo_scripts() {
    $theme_version = wp_get_theme()->get('Version');
    wp_enqueue_style('hello-trompo-style', get_template_directory_uri() . '/assets/css/main.css', array(), $theme_version);
}
add_action('wp_enqueue_scripts', 'hello_trompo_scripts');

// Incluir auto-setup si fue generado por BotConversor
$auto_setup_file = get_template_directory() . '/inc/auto-setup.php';
if (file_exists($auto_setup_file)) {
    require_once $auto_setup_file;
}
`);

    fs.writeFileSync(path.join(themeDir, 'index.php'),
`<?php
if (!defined('ABSPATH')) { exit; }
get_header();
if (have_posts()) :
    while (have_posts()) : the_post();
        the_content();
    endwhile;
endif;
get_footer();
`);

    fs.writeFileSync(path.join(themeDir, 'assets', 'css', 'main.css'),
`/* Estilos del tema ${themeName} */\n`);
}

// ===== Convertidor HTML → widgets nativos de Elementor =====

function elId() {
    const chars = '0123456789abcdef';
    let id = '';
    for (let i = 0; i < 7; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
}

// Modern Elementor: container-based structure (replaces legacy section/column)
function elContainer(elements, settings, isInner) {
    return {
        id: elId(),
        elType: 'container',
        settings: Object.assign({ content_width: 'full', flex_direction: 'column', flex_wrap: 'nowrap', content_position: 'top' }, settings || {}),
        elements: elements || [],
        isInner: !!isInner
    };
}

function elWidget(type, settings) {
    return { id: elId(), elType: 'widget', widgetType: type, settings: settings || {}, elements: [], isInner: false };
}

const COLUMN_CLS = /\bcol\b|col-[a-z0-9]|\bcolumn\b|\bgrid-item\b|\bcell\b/i;
const ROW_CLS    = /\brow\b|\bgrid\b|\bcolumns\b/i;
const SKIP_CLS   = /\bcursor\b|\bpreloader\b|\bloader\b|\boverlay\b|\bmodal\b|\bbackdrop\b|\boffcanvas\b/i;
const SKIP_ID    = /^(cursor|preloader|loader|overlay|modal|sidebar)/i;

function shouldSkipEl($, el) {
    const cls = $(el).attr('class') || '';
    const id  = $(el).attr('id') || '';
    return SKIP_CLS.test(cls) || SKIP_ID.test(id);
}

// ---- CSS utilities ----

function parseCSSForElementor(cssText) {
    const vars  = {};
    const rules = {};

    const rootM = cssText.match(/:root\s*\{([^}]+)\}/);
    if (rootM) {
        for (const line of rootM[1].split(';')) {
            const m = line.match(/--([a-zA-Z0-9-]+)\s*:\s*(.+)/);
            if (m) vars[`--${m[1].trim()}`] = m[2].trim();
        }
    }

    const ruleRe = /([^{}]+)\{([^}]+)\}/g;
    let m;
    while ((m = ruleRe.exec(cssText)) !== null) {
        const props = {};
        for (const decl of m[2].split(';')) {
            const idx = decl.indexOf(':');
            if (idx === -1) continue;
            const prop = decl.substring(0, idx).trim();
            const val  = decl.substring(idx + 1).trim();
            if (prop) props[prop] = val;
        }
        for (const sel of m[1].trim().split(',')) {
            const s = sel.trim();
            if (!s || s === ':root') continue;
            if (!rules[s]) rules[s] = {};
            Object.assign(rules[s], props);
        }
    }

    return { vars, rules };
}

function resolveVar(value, vars) {
    if (!value || !value.includes('var(')) return value;
    return value.replace(/var\(([^,)]+)(?:,([^)]+))?\)/g, (_, name, fallback) => {
        const v = vars[name.trim()];
        if (v) return resolveVar(v, vars);
        return fallback ? fallback.trim() : '';
    });
}

function getElStyles($el, cssData) {
    if (!cssData) return {};
    const { vars, rules } = cssData;
    const merged = {};
    const tag = ($el[0] && $el[0].tagName) ? $el[0].tagName.toLowerCase() : '';
    const cls = ($el.attr('class') || '').split(/\s+/).filter(Boolean);

    if (rules[tag]) Object.assign(merged, rules[tag]);
    for (const c of cls) {
        if (rules[`.${c}`]) Object.assign(merged, rules[`.${c}`]);
    }
    for (const [k, v] of Object.entries(merged)) {
        merged[k] = resolveVar(v, vars);
    }
    return merged;
}

function parseSizeVal(val) {
    if (!val) return null;
    const clampM = val.match(/clamp\([^,]+,\s*([^,]+),\s*[^)]+\)/);
    if (clampM) val = clampM[1].trim();
    const match = val.match(/^([\d.]+)(px|em|rem|vw|vh|%)?$/);
    if (!match) return null;
    const size = parseFloat(match[1]);
    const unit = match[2] === 'rem' ? 'em' : (match[2] || 'px');
    return { unit, size: unit === 'px' ? Math.round(size) : size, sizes: [] };
}

function firstFontFamily(val) {
    if (!val) return null;
    return val.split(',')[0].trim().replace(/['"]/g, '');
}

// Applies CSS typography/color to an Elementor settings object.
// prefix: 'typography_' for widgets, 'title_typography_' / 'description_typography_' for icon-box/image-box
function applyTypoWithPrefix(styles, settings, prefix, colorKey) {
    if (styles['color'] && colorKey) settings[colorKey] = styles['color'];
    if (styles['font-family']) {
        settings[prefix + 'typography'] = 'custom';
        settings[prefix + 'font_family'] = firstFontFamily(styles['font-family']);
    }
    const fsz = parseSizeVal(styles['font-size']);
    if (fsz) {
        settings[prefix + 'typography'] = 'custom';
        settings[prefix + 'font_size']        = fsz;
        settings[prefix + 'font_size_tablet'] = fsz;
        settings[prefix + 'font_size_mobile'] = fsz;
    }
    if (styles['font-weight']) {
        settings[prefix + 'typography'] = 'custom';
        settings[prefix + 'font_weight'] = styles['font-weight'];
    }
    if (styles['font-style'] && styles['font-style'] !== 'normal') {
        settings[prefix + 'typography'] = 'custom';
        settings[prefix + 'font_style'] = styles['font-style'];
    }
    if (styles['text-transform'] && styles['text-transform'] !== 'none') {
        settings[prefix + 'typography'] = 'custom';
        settings[prefix + 'text_transform'] = styles['text-transform'];
    }
    const ls = parseSizeVal(styles['letter-spacing']);
    if (ls) { settings[prefix + 'typography'] = 'custom'; settings[prefix + 'letter_spacing'] = ls; }
    const lh = parseSizeVal(styles['line-height']);
    if (lh) { settings[prefix + 'typography'] = 'custom'; settings[prefix + 'line_height'] = lh; }
}

function applyTypo(styles, settings, colorKey) {
    applyTypoWithPrefix(styles, settings, 'typography_', colorKey || 'text_color');
}

function getContainerBgSettings(styles) {
    const s = {};
    if (styles['background-color']) {
        s['background_color'] = styles['background-color'];
    } else if (styles['background']) {
        const bgCol = styles['background'].match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/);
        if (bgCol) s['background_color'] = bgCol[0];
    }
    const pt = parseSizeVal(styles['padding-top']    || '');
    const pb = parseSizeVal(styles['padding-bottom'] || '');
    const pl = parseSizeVal(styles['padding-left']   || '');
    const pr = parseSizeVal(styles['padding-right']  || '');
    if (styles['padding'] && !pt && !pb) {
        const pv = parseSizeVal(styles['padding'].split(' ')[0]);
        if (pv) s['padding'] = { unit: pv.unit, top: String(pv.size), right: String(pv.size), bottom: String(pv.size), left: String(pv.size), isLinked: true };
    } else if (pt || pb || pl || pr) {
        s['padding'] = { unit: 'px', top: String(pt ? pt.size : 0), right: String(pr ? pr.size : 0), bottom: String(pb ? pb.size : 0), left: String(pl ? pl.size : 0), isLinked: false };
    }
    if (styles['border-radius']) {
        const r = parseSizeVal(styles['border-radius'].split(' ')[0]);
        if (r) s['border_radius'] = { unit: r.unit, top: String(r.size), right: String(r.size), bottom: String(r.size), left: String(r.size), isLinked: true };
    }
    return s;
}

// ---- Layout helpers ----

function drillDown($, el) {
    let cur = el;
    for (let i = 0; i < 8; i++) {
        const children = $(cur).children().toArray().filter(c => c.type === 'tag');
        if (children.length !== 1) break;
        const child = children[0];
        const tag = child.tagName ? child.tagName.toLowerCase() : '';
        const cls = $(child).attr('class') || '';
        if (['div', 'main', 'article'].includes(tag) && !COLUMN_CLS.test(cls)) {
            cur = child;
        } else break;
    }
    return cur;
}

function detectCols($, el) {
    const children = $(el).children().toArray().filter(c => c.type === 'tag');
    if (children.length < 2) return [];
    const colKids = children.filter(c => COLUMN_CLS.test($(c).attr('class') || ''));
    if (colKids.length >= 2) return colKids;
    const rowKid = children.find(c => ROW_CLS.test($(c).attr('class') || ''));
    if (rowKid) {
        const rowCols = $(rowKid).children().toArray().filter(c => c.type === 'tag');
        if (rowCols.length >= 2) return rowCols;
    }
    return [];
}

// ---- Widget / section builders ----

function nodeToWidget($, el, cssData) {
    if (!el || el.type !== 'tag') return null;
    if (shouldSkipEl($, el)) return null;
    const $el  = $(el);
    const tag  = el.tagName ? el.tagName.toLowerCase() : '';
    const inner = ($el.html() || '').trim();
    const text  = $el.text().trim();
    const cls   = $el.attr('class') || '';
    if (!inner && !text) return null;

    const styles = getElStyles($el, cssData);

    function getAlign() {
        if (styles['text-align']) return styles['text-align'];
        if (/text-center|center-align|\bcenter\b/i.test(cls)) return 'center';
        if (/text-right|right-align|\bright\b/i.test(cls)) return 'right';
        return '';
    }

    // Headings
    if (/^h[1-6]$/.test(tag)) {
        const s = { title: inner, header_size: tag };
        const al = getAlign(); if (al) s.align = al;
        applyTypo(styles, s, 'title_color');
        return elWidget('heading', s);
    }

    // Paragraph
    if (tag === 'p') {
        const s = { editor: inner };
        const al = getAlign(); if (al) s.align = al;
        applyTypo(styles, s, 'text_color');
        return elWidget('text-editor', s);
    }

    // Image
    if (tag === 'img') {
        const s = { image: { url: $el.attr('src') || '', alt: $el.attr('alt') || '', id: '' } };
        const al = getAlign(); if (al) s.align = al;
        return elWidget('image', s);
    }

    // Button / CTA link
    if (tag === 'button' || (tag === 'a' && /\bbtn\b|\bbutton\b|\bcta\b/i.test(cls))) {
        const s = { text: text || 'Ver más', link: { url: $el.attr('href') || '#', is_external: '', nofollow: '' } };
        const al = getAlign(); if (al) s.align = al;
        applyTypo(styles, s, 'button_text_color');
        return elWidget('button', s);
    }

    // Divider
    if (tag === 'hr') return elWidget('divider', {});

    // Lists / blockquote → rich text
    if (['ul', 'ol', 'blockquote'].includes(tag)) {
        const s = { editor: $.html(el) };
        applyTypo(styles, s, 'text_color');
        return elWidget('text-editor', s);
    }

    // Container elements
    if (['div', 'section', 'article', 'aside', 'figure', 'main', 'span'].includes(tag)) {
        const kids = $(el).children().toArray().filter(c => c.type === 'tag');

        // Single img wrapper → image widget
        if (kids.length === 1 && kids[0].tagName && kids[0].tagName.toLowerCase() === 'img') {
            const $img = $(kids[0]);
            const s = { image: { url: $img.attr('src') || '', alt: $img.attr('alt') || '', id: '' } };
            const al = getAlign(); if (al) s.align = al;
            return elWidget('image', s);
        }

        // figure con img → image con caption
        if (tag === 'figure') {
            const $img = $el.find('img').first();
            if ($img.length) {
                return elWidget('image', {
                    image: { url: $img.attr('src') || '', alt: $img.attr('alt') || '', id: '' },
                    caption: $el.find('figcaption').first().text().trim()
                });
            }
        }

        const $hd = $el.find('h1,h2,h3,h4,h5,h6').first();
        const $im = $el.find('img').first();
        const $pa = $el.find('p').first();
        const $ic = $el.find('i[class*="icon"],i[class*="fa"],svg,.icon,.fas,.far,.fal,.fab').first();

        // Icon-box pattern: icon/svg + heading + (optional) paragraph
        if ($hd.length && $ic.length && !$im.length) {
            const hSt = getElStyles($hd, cssData);
            const pSt = getElStyles($pa, cssData);
            const s = {
                title_text: $hd.text().trim(),
                description_text: $pa.html() || '',
                position: 'top',
                selected_icon: { value: $ic.attr('class') || '', library: 'fa-solid' }
            };
            applyTypoWithPrefix(hSt, s, 'title_typography_', 'title_color');
            applyTypoWithPrefix(pSt, s, 'description_typography_', 'description_color');
            return elWidget('icon-box', s);
        }

        // Image-box: img + heading + (optional) paragraph
        if ($im.length && $hd.length) {
            const hSt = getElStyles($hd, cssData);
            const pSt = getElStyles($pa, cssData);
            const s = {
                image: { url: $im.attr('src') || '', alt: $im.attr('alt') || '', id: '' },
                title_text: $hd.text().trim(),
                description_text: $pa.html() || ''
            };
            applyTypoWithPrefix(hSt, s, 'title_typography_', 'title_color');
            applyTypoWithPrefix(pSt, s, 'description_typography_', 'description_color');
            return elWidget('image-box', s);
        }

        // All simple children → let caller process individually
        const SIMPLE_TAGS = /^(h[1-6]|p|img|hr|ul|ol|a|button|span|br|strong|em|blockquote)$/;
        const allSimple = kids.every(c => SIMPLE_TAGS.test(c.tagName ? c.tagName.toLowerCase() : ''));
        if (allSimple && kids.length > 0 && kids.length <= 8) return null;

        // Complex → html fallback
        return elWidget('html', { html: $.html(el) });
    }

    return elWidget('html', { html: $.html(el) });
}

function extractWidgets($, el, cssData) {
    const kids = $(el).children().toArray().filter(c => c.type === 'tag');
    if (kids.length === 0) {
        const t = $(el).text().trim();
        return t ? [elWidget('text-editor', { editor: t })] : [];
    }
    const widgets = [];
    for (const kid of kids) {
        if (shouldSkipEl($, kid)) continue;
        const tag = kid.tagName ? kid.tagName.toLowerCase() : '';

        if (/^(h[1-6]|p|img|hr|ul|ol|blockquote|button)$/.test(tag)) {
            const w = nodeToWidget($, kid, cssData); if (w) widgets.push(w); continue;
        }
        if (tag === 'a' && /\bbtn\b|\bbutton\b|\bcta\b/i.test($(kid).attr('class') || '')) {
            const w = nodeToWidget($, kid, cssData); if (w) widgets.push(w); continue;
        }
        if (['div', 'article', 'aside', 'figure', 'section'].includes(tag)) {
            const w = nodeToWidget($, kid, cssData);
            if (w === null) {
                const subKids = $(kid).children().toArray().filter(c => c.type === 'tag');
                for (const sk of subKids) {
                    if (shouldSkipEl($, sk)) continue;
                    const sw = nodeToWidget($, sk, cssData); if (sw) widgets.push(sw);
                }
            } else if (w) {
                widgets.push(w);
            }
            continue;
        }
        const w = nodeToWidget($, kid, cssData); if (w) widgets.push(w);
    }
    return widgets;
}

function buildSection($, el, cssData) {
    if (!el || el.type !== 'tag') return null;
    if (shouldSkipEl($, el)) return null;
    const content = drillDown($, el);
    const $c      = $(content);
    if (!$c.text().trim() && !($c.html() || '').trim()) return null;

    const sStyles = getElStyles($c, cssData);
    const bgSet   = getContainerBgSettings(sStyles);

    // Multi-column → Elementor grid container
    const colEls = detectCols($, content);
    if (colEls.length >= 2) {
        const frac = Array(colEls.length).fill('1fr').join(' ');
        const innerCols = colEls.map(c => {
            const colSt = getElStyles($(c), cssData);
            const colBg = getContainerBgSettings(colSt);
            return elContainer(extractWidgets($, drillDown($, c), cssData), colBg, true);
        });
        return elContainer(innerCols, Object.assign({
            container_type: 'grid',
            grid_columns_grid: { unit: 'custom', size: frac, sizes: [] }
        }, bgSet));
    }

    // Nested row element
    const rowEl = $c.children().toArray().find(c => ROW_CLS.test($(c).attr('class') || ''));
    if (rowEl) {
        const rowCols = $(rowEl).children().toArray().filter(c => c.type === 'tag');
        if (rowCols.length >= 2) {
            const frac = Array(rowCols.length).fill('1fr').join(' ');
            const innerCols = rowCols.map(c => elContainer(extractWidgets($, drillDown($, c), cssData), {}, true));
            return elContainer(innerCols, Object.assign({
                container_type: 'grid',
                grid_columns_grid: { unit: 'custom', size: frac, sizes: [] }
            }, bgSet));
        }
    }

    // Single column
    const widgets = extractWidgets($, content, cssData);
    if (widgets.length === 0) {
        const inner = ($c.html() || '').trim();
        return inner ? elContainer([elContainer([elWidget('html', { html: inner })], {}, true)], bgSet) : null;
    }
    return elContainer([elContainer(widgets, {}, true)], bgSet);
}

function convertHtmlToElementorData(html, cssText) {
    const cheerio = require('cheerio');
    const cssData = cssText ? parseCSSForElementor(cssText) : null;
    const $ = cheerio.load('<div id="el-root">' + html + '</div>', { decodeEntities: false });
    const sections = [];
    const BLOCK = ['section', 'article', 'aside', 'main', 'div', 'figure'];

    $('#el-root').children().each(function () {
        const el = this;
        if (el.type !== 'tag') return;
        const tag = el.tagName ? el.tagName.toLowerCase() : '';
        if (['nav', 'header', 'footer'].includes(tag)) return;
        if (shouldSkipEl($, el)) return;

        if (BLOCK.includes(tag)) {
            const s = buildSection($, el, cssData);
            if (s) sections.push(s);
        } else if (/^h[1-6]$/.test(tag) || ['p', 'ul', 'ol', 'hr', 'blockquote'].includes(tag)) {
            const w = nodeToWidget($, el, cssData);
            if (w) sections.push(elContainer([elContainer([w], {}, true)]));
        } else {
            const ih = $.html(el);
            if (ih.trim()) sections.push(elContainer([elContainer([elWidget('html', { html: ih })], {}, true)]));
        }
    });

    if (sections.length === 0) sections.push(elContainer([elContainer([elWidget('html', { html })], {}, true)]));
    return sections;
}

function countElWidgets(sections) {
    let n = 0;
    function walk(els) { for (const e of els) { if (e.elType === 'widget') n++; if (e.elements) walk(e.elements); } }
    walk(sections);
    return n;
}

const clientName = process.argv[2];
if (!clientName) {
    console.error('\n❌ Error: Debes proporcionar el nombre del cliente. Ejemplo: node convertir.js "Mi Cliente"');
    process.exit(1);
}

const botDir = __dirname;
const inputDir = path.join(botDir, 'input_html');

// Permitir elegir el modelo, por defecto 'Trompo-Theme'
// Modo especial: si se pasa 'elementor' como tercer argumento, se genera un tema compatible con Elementor
const rawModelArg = process.argv[3] || 'Trompo-Theme';
const isElementorMode = rawModelArg.toLowerCase() === 'elementor';
const modelName = isElementorMode ? 'Hello-Trompo' : rawModelArg;
const baseThemeDir = path.join(botDir, 'Models', modelName);

const folderName = clientName
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const outputDir = path.join(botDir, 'output');
fse.ensureDirSync(outputDir);
const newThemeDir = path.join(outputDir, `${modelName}-${folderName}`);

if (!isElementorMode && !fs.existsSync(baseThemeDir)) {
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

console.log(`\n🚀 Iniciando creación de tema para: ${clientName} usando modelo: ${modelName}${isElementorMode ? ' (modo Elementor)' : ''}`);

// 1. Copiar el tema base o generar base Hello Trompo (modo Elementor)
if (isElementorMode) {
    generateHelloTrompoBase(newThemeDir, clientName, modelName);
    console.log('📝 Base Hello Trompo generada para Elementor.');
} else {
    fse.copySync(baseThemeDir, newThemeDir, {
        filter: (src, _dest) => {
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

    // 2b. Asegurar que functions.php incluya auto-setup.php
    const functionsPath = path.join(newThemeDir, 'functions.php');
    if (fs.existsSync(functionsPath)) {
        let functionsContent = fs.readFileSync(functionsPath, 'utf8');

        if (!/require_once\s+\$auto_setup_file/.test(functionsContent)) {
            const autoSetupSnippet = `\n// Incluir auto-setup si fue generado por BotConversor\n$auto_setup_file = get_template_directory() . '/inc/auto-setup.php';\n\nif (file_exists($auto_setup_file)) {\n    require_once $auto_setup_file;\n}\n`;
            functionsContent = functionsContent.trimEnd() + '\n' + autoSetupSnippet;
            fs.writeFileSync(functionsPath, functionsContent);
            console.log('📝 functions.php actualizado con require de auto-setup.php.');
        } else {
            console.log('📝 functions.php ya contiene require de auto-setup.php. OK.');
        }
    }
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
    let pageCssText = '';
    html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_match, p1) => {
        cssRules.push(`/* Estilos extraídos de <style> en ${file} */`);
        cssRules.push(p1.trim());
        pageCssText += p1.trim() + '\n';
        return '';
    });

    // Extraer estilos inline (style="...")
    html = html.replace(/<([a-zA-Z0-9\-]+)([^>]*?)\bstyle\s*=\s*(["'])([\s\S]*?)\3([^>]*?)>/gi, (_match, tagName, beforeStyle, _quote, styleContent, afterStyle) => {
        let className = `tc-inline-${folderName}-${styleCounter++}`;
        cssRules.push(`/* Extraído de ${file} */\n.${className} { ${styleContent} }`);

        let restOfTag = beforeStyle + afterStyle;
        if (/class\s*=\s*["']/i.test(restOfTag)) {
            restOfTag = restOfTag.replace(/class\s*=\s*(["'])(.*?)\1/i, (_matchCls, q, existingClasses) => {
                let classes = existingClasses.trim();
                return classes ? `class=${q}${classes} ${className}${q}` : `class=${q}${className}${q}`;
            });
        } else {
            restOfTag += ` class="${className}"`;
        }
        return `<${tagName}${restOfTag}>`;
    });

    // Detectar, copiar y reescribir assets externos (CSS, JS, imágenes, fuentes, etc.)
    const htmlAssets = collectHtmlAssets(html);
    if (htmlAssets.length > 0) {
        const copiedAssets = copyExternalAssets(htmlAssets, inputDir, newThemeDir);
        if (copiedAssets.length > 0) {
            console.log(`    📦 Copiados ${copiedAssets.length} archivo(s) de assets externos.`);
            html = rewriteHtmlAssetPaths(html, copiedAssets);
            console.log(`    🔗 Rutas de assets reescritas con get_template_directory_uri().`);
        }
    }

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
        // Asegurar wp_footer() antes de </body>
        if (/<\/body>/i.test(footerContent)) {
            if (!/wp_footer/i.test(footerContent)) {
                footerContent = footerContent.replace(/<\/body>/i, '<?php wp_footer(); ?>\n</body>');
            }
        } else {
            // No hay </body>, agregamos cierre completo
            footerContent += '\n<?php wp_footer(); ?>\n</body>\n</html>';
        }
        bodyContent = bodyContent.substring(0, footerMatch.index);
    } else {
        const scriptRegex = /(<script[\s\S]*<\/html>)/i;
        const scriptMatch = bodyContent.match(scriptRegex);
        if (scriptMatch) {
            footerContent = scriptMatch[0];
            if (/<\/body>/i.test(footerContent)) {
                if (!/wp_footer/i.test(footerContent)) {
                    footerContent = footerContent.replace(/<\/body>/i, '<?php wp_footer(); ?>\n</body>');
                }
            } else {
                footerContent += '\n<?php wp_footer(); ?>\n</body>\n</html>';
            }
            bodyContent = bodyContent.substring(0, scriptMatch.index);
        } else {
            // FIX #4: No <footer> found at all → force a minimal footer
            footerContent = '<?php wp_footer(); ?>\n</body>\n</html>';
        }
    }

    // Limpiar restos HTML
    bodyContent = bodyContent.replace(/<\/body>\s*<\/html>/gi, '').trim();

    // Solo creamos header.php y footer.php una vez usando el primer HTML como referencia
    if (isFirstFile) {
        const globalHeaderPath = path.join(newThemeDir, 'header.php');
        const globalFooterPath = path.join(newThemeDir, 'footer.php');

        // FIX #4: Fallback header — if no <head> was found, generate a valid one
        if (!headContent.trim()) {
            headContent = `<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <?php wp_head(); ?>
</head>`;
            console.log('    ⚠️ No se encontró <head> en el HTML. Se generó un head de fallback con wp_head().');
        } else {
            // Inyectar language_attributes() en el tag <html> si no está presente
            if (/<html(?![^>]*language_attributes)/i.test(headContent)) {
                headContent = headContent.replace(/<html([^>]*)>/i, (_m, attrs) => {
                    return `<html${attrs} <?php language_attributes(); ?>>`;
                });
            }
        }

        // FIX #4: Fallback header content — if no <body>/<nav>/<header> was found
        if (!headerContent.trim()) {
            headerContent = `<body <?php body_class(); ?>>\n<?php wp_body_open(); ?>`;
            console.log('    ⚠️ No se encontró <body>/<header>/<nav>. Se generó body tag de fallback.');
        }

        // Prefixar ABSPATH guard (header.php y footer.php son HTML, no empiezan con <?php)
        const abspathGuardInline = `<?php if (!defined('ABSPATH')) { exit; } ?>\n`;
        fs.writeFileSync(globalHeaderPath, abspathGuardInline + headContent + '\n' + headerContent);
        fs.writeFileSync(globalFooterPath, abspathGuardInline + footerContent);
        console.log('    ✔️ Creados header.php y footer.php globales.');
        isFirstFile = false;
    }

    // Normalizar nombres para DB
    let rawName = file.replace(/\.html$/i, '').replace(/[-_]/g, ' ');
    let cleanName = rawName.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '').replace(/\s+/g, ' ').trim();

    // Normalizar slugs para identificar si es home
    let normalizedName = cleanName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // FIX #3: Home detection — flexible regex supporting compound names
    let isHome = htmlFiles.length === 1 || /(^|[-_\s])(home|index|inicio|frontpage|front-page)([-_\s]|$)/i.test(normalizedName);

    // Usamos base64 para evitar todos los problemas de escape en strings PHP
    let encodedContent = Buffer.from(bodyContent).toString('base64');

    // En modo Elementor: convertir HTML a widgets nativos
    let elementorB64 = null;
    if (isElementorMode) {
        try {
            const elData = convertHtmlToElementorData(bodyContent, pageCssText);
            elementorB64 = Buffer.from(JSON.stringify(elData)).toString('base64');
            console.log(`    🔧 Convertido a ${countElWidgets(elData)} widgets de Elementor.`);
        } catch (e) {
            console.warn(`    ⚠️ Error convirtiendo a Elementor: ${e.message}. Se usará HTML widget de fallback.`);
            const fallback = [elContainer([elContainer([elWidget('html', { html: bodyContent })], {}, true)])];
            elementorB64 = Buffer.from(JSON.stringify(fallback)).toString('base64');
        }
    }

    let slug;
    if (isHome) {
        slug = 'inicio';
        createdPages.push({ slug: slug, title: 'Inicio', is_home: true, content_b64: encodedContent, bodyContent: bodyContent, elementor_b64: elementorB64 });
        console.log(`    ✔️ Identificada como página de Inicio.`);
    } else {
        slug = normalizedName.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        createdPages.push({ slug: slug, title: cleanName, is_home: false, content_b64: encodedContent, bodyContent: bodyContent, elementor_b64: elementorB64 });
        console.log(`    ✔️ Identificada como página interna: ${cleanName}`);
    }
}

// 3. Generar PHP templates
console.log(`\n⚙️  Generando templates PHP...`);

if (isElementorMode) {
    // Modo Elementor: templates mínimos — el contenido lo gestiona Elementor vía _elementor_data meta
    const elementorTpl = `<?php
if (!defined('ABSPATH')) { exit; }
get_header();
if (have_posts()) :
    while (have_posts()) : the_post();
        the_content();
    endwhile;
endif;
get_footer();
`;
    fs.writeFileSync(path.join(newThemeDir, 'front-page.php'), elementorTpl);
    fs.writeFileSync(path.join(newThemeDir, 'page.php'), elementorTpl);
    console.log('    ✔️ Creados front-page.php y page.php mínimos para Elementor.');
} else {
    for (const page of createdPages) {
        let templateFileName;
        if (page.is_home) {
            templateFileName = 'front-page.php';
        } else {
            templateFileName = `page-${page.slug}.php`;
        }

        const templateContent = `<?php
/**
 * Template: ${templateFileName}
 * Generado automáticamente por BotConversor para: ${page.title}
 *
 * @package hello-trompo
 */
get_header(); ?>

${page.bodyContent}

<?php get_footer(); ?>
`;

        const templatePath = path.join(newThemeDir, templateFileName);
        fs.writeFileSync(templatePath, templateContent);
        console.log(`    ✔️ Creado template: ${templateFileName}`);
    }

    // Also generate a generic page.php fallback with the_content() loop
    const pageFallbackPath = path.join(newThemeDir, 'page.php');
    const pageFallbackContent = `<?php
/**
 * Fallback genérico para páginas sin template específico (page-{slug}.php)
 * Renderiza el contenido desde la base de datos de WordPress
 *
 * @package hello-trompo
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
    fs.writeFileSync(pageFallbackPath, pageFallbackContent);
    console.log('    ✔️ Creado page.php genérico (fallback con the_content()).');
}

// 4. Inyectar CSS si es necesario
if (cssRules.length > 0) {
    fse.ensureDirSync(path.dirname(mainCssPath));
    let mainCssContent = fs.existsSync(mainCssPath) ? fs.readFileSync(mainCssPath, 'utf8') : '';
    mainCssContent += `\n\n/* ESTILOS AUTOMÁTICOS BOTCONVERSOR */\n` + cssRules.join('\n\n');
    fs.writeFileSync(mainCssPath, mainCssContent);
    console.log(`🎨 Estilos inyectados en assets/css/main.css`);
}

// 5. Generar script auto-setup.php con fallback admin_init
console.log(`\n⚙️  Generando lógica de importación en inc/auto-setup.php...`);
const incDir = path.join(newThemeDir, 'inc');
fse.ensureDirSync(incDir);
const autoSetupPath = path.join(incDir, 'auto-setup.php');

let phpPagesArray = createdPages.map(p => {
    if (isElementorMode) {
        return `        array(
            'slug'           => '${p.slug}',
            'title'          => '${p.title}',
            'is_home'        => ${p.is_home ? 'true' : 'false'},
            'is_elementor'   => true,
            'content'        => base64_decode('${p.content_b64}'),
            'elementor_json' => base64_decode('${p.elementor_b64 || ''}')
        )`;
    }
    return `        array(
            'slug'    => '${p.slug}',
            'title'   => '${p.title}',
            'is_home' => ${p.is_home ? 'true' : 'false'},
            'content' => base64_decode('${p.content_b64}')
        )`;
}).join(',\n');

const elementorSetupCode = isElementorMode ? `
        // Configurar la página para ser editable con Elementor (widgets nativos)
        if (!empty($p['is_elementor']) && !empty($p['elementor_json']) && $page_id && !is_wp_error($page_id)) {
            $elementor_json = $p['elementor_json'];
            // Reemplazar el placeholder de URI del tema por la URL real
            $elementor_json = str_replace(
                '<?php echo get_template_directory_uri(); ?>',
                get_template_directory_uri(),
                $elementor_json
            );
            update_post_meta($page_id, '_elementor_data', wp_slash($elementor_json));
            update_post_meta($page_id, '_elementor_edit_mode', 'builder');
            update_post_meta($page_id, '_elementor_version', '3.0.0');
            update_post_meta($page_id, '_elementor_template_type', 'wp-page');
            file_put_contents($log_file, "Elementor configurado para: {$p['title']}\\n", FILE_APPEND);
        }` : '';

const autoSetupContent = `<?php
/**
 * Auto Setup: Importa HTML a la DB y configura Home automáticamente
 * Generado por BotConversor
 *
 * Ejecuta en after_switch_theme (activación) y admin_init (fallback único).
 */

// Hook principal: se ejecuta al activar el tema
add_action('after_switch_theme', 'hello_trompo_auto_setup_pages');

// FIX #2: Fallback — se ejecuta UNA vez en admin_init si el setup no se completó
add_action('admin_init', 'hello_trompo_run_auto_setup_once');

function hello_trompo_run_auto_setup_once() {
    if (!current_user_can('manage_options')) return;

    if (!get_option('hello_trompo_auto_setup_done')) {
        hello_trompo_auto_setup_pages();
        update_option('hello_trompo_auto_setup_done', 1);
    }
}

function hello_trompo_auto_setup_pages() {
    $log_file = WP_CONTENT_DIR . '/theme-setup-log.txt';
    file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Iniciando importacion de paginas BotConversor...\\n", FILE_APPEND);

    $pages = array(
${phpPagesArray}
    );

    // Setear nombre del sitio y limpiar descripción
    update_option('blogname', '${clientName}');
    update_option('blogdescription', '');

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
                file_put_contents($log_file, "Creada pagina: {$p['title']} (Slug: {$p['slug']}, ID: {$page_id})\\n", FILE_APPEND);
            } else {
                file_put_contents($log_file, "Error creando {$p['slug']}: " . $page_id->get_error_message() . "\\n", FILE_APPEND);
            }
        } else {
            // FIX #5: La página existe — actualizar con slug, post_type y contenido completo
            $page_id = $existing->ID;
            $update_result = wp_update_post(array(
                'ID'           => $page_id,
                'post_title'   => $p['title'],
                'post_name'    => $p['slug'],
                'post_status'  => 'publish',
                'post_type'    => 'page',
                'post_content' => $p['content']
            ));
            
            if (!is_wp_error($update_result)) {
                file_put_contents($log_file, "Actualizada pagina: {$p['title']} (Slug: {$p['slug']}, ID: {$page_id})\\n", FILE_APPEND);
            } else {
                file_put_contents($log_file, "Error actualizando {$p['slug']}: " . $update_result->get_error_message() . "\\n", FILE_APPEND);
            }
        }

${elementorSetupCode}

        // Si es la home declarada, guardamos el ID para setearla como front-page
        if ($p['is_home'] && $page_id && !is_wp_error($page_id)) {
            $home_id = $page_id;
        }
    }

    // Configurar la portada del sitio
    if ($home_id) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $home_id);
        file_put_contents($log_file, "Exito: Front-page configurada con la pagina ID: {$home_id}\\n", FILE_APPEND);
    } else {
        file_put_contents($log_file, "Aviso: No se identifico ninguna pagina como Inicio.\\n", FILE_APPEND);
    }
    
    // Marcar como completado
    update_option('hello_trompo_auto_setup_done', 1);
    
    file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] Importacion finalizada.\\n\\n", FILE_APPEND);
}
`;

fs.writeFileSync(autoSetupPath, autoSetupContent);
console.log('    ✔️ Creado auto-setup.php con fallback admin_init y wp_update_post robusto.');

// 6. Inyectar ABSPATH en todos los archivos PHP del tema generado
console.log(`\n🔒 Verificando protección ABSPATH en archivos PHP...`);
let abspathInjected = 0;
for (const phpFile of getAllPhpFiles(newThemeDir)) {
    let content = fs.readFileSync(phpFile, 'utf8');
    if (!/defined\s*\(\s*['"]ABSPATH['"]\s*\)/.test(content)) {
        // Si el archivo comienza con <?php, inyectar después del tag de apertura
        if (/^\s*<\?php/i.test(content)) {
            content = content.replace(/^(\s*<\?php[^\n]*\n)/i, `$1if (!defined('ABSPATH')) { exit; }\n\n`);
        } else {
            // El archivo es HTML puro (ej. header.php, footer.php) — prepend un bloque PHP inline
            content = `<?php if (!defined('ABSPATH')) { exit; } ?>\n` + content;
        }
        fs.writeFileSync(phpFile, content);
        abspathInjected++;
    }
}
if (abspathInjected > 0) {
    console.log(`   🔐 ABSPATH guard inyectado en ${abspathInjected} archivo(s) PHP.`);
} else {
    console.log(`   ✔️ Todos los archivos PHP ya tenían protección ABSPATH.`);
}

// 7. Revisión de calidad del tema generado
console.log(`\n🔍 Revisando calidad del tema generado...`);
const review = reviewGeneratedTheme(newThemeDir);

if (review.critical.length > 0) {
    console.log(`\n   ❌ CRÍTICOS (${review.critical.length}):`);
    for (const issue of review.critical) console.log(`      • ${issue}`);
}
if (review.important.length > 0) {
    console.log(`\n   ⚠️  IMPORTANTES (${review.important.length}):`);
    for (const issue of review.important) console.log(`      • ${issue}`);
}
if (review.minor.length > 0) {
    console.log(`\n   💡 MENORES (${review.minor.length}):`);
    for (const issue of review.minor) console.log(`      • ${issue}`);
}

const reviewPassed = review.critical.length === 0;

if (!reviewPassed) {
    console.log(`\n   ❌ Revisión fallida: hay problemas críticos. El tema NO se comprimirá.`);
    console.log(`\n✅ Proceso completado con advertencias.`);
    console.log(`   El tema sin comprimir está en: ${newThemeDir}`);
    console.log(`   Una vez activado el tema, revisá los logs en wp-content/theme-setup-log.txt`);
    process.exit(0);
}

if (review.important.length === 0 && review.minor.length === 0) {
    console.log(`\n   ✅ Revisión completada: Todo OK.`);
} else {
    console.log(`\n   ✅ Revisión completada: sin bloqueos críticos.`);
}

// 8. Comprimir el tema en .zip
console.log(`\n📦 Comprimiendo tema...`);
const archiver = require('archiver');
const zipFileName = `${path.basename(newThemeDir)}.zip`;
const zipPath = path.join(outputDir, zipFileName);

const zipOutput = fs.createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

zipOutput.on('close', () => {
    const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log(`   ✔️ ZIP creado: ${zipFileName} (${sizeMB} MB)`);
    console.log(`\n✅ Proceso completado exitosamente.`);
    console.log(`   Tema generado en:  ${newThemeDir}`);
    console.log(`   ZIP listo para subir: ${zipPath}`);
    console.log(`   Una vez activado el tema, revisá los logs en wp-content/theme-setup-log.txt`);
});

archive.on('error', (err) => {
    console.error(`\n❌ Error al comprimir el tema: ${err.message}`);
    console.log(`\n✅ Proceso completado (sin ZIP).`);
    console.log(`   El tema está en: ${newThemeDir}`);
});

archive.pipe(zipOutput);
archive.directory(newThemeDir, path.basename(newThemeDir));
archive.finalize();
