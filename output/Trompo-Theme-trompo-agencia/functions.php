<?php
/**
 * Hello Trompo – functions.php
 *
 * Tema base para BotConversor. Este archivo se copia al tema generado
 * y el conversor lo actualiza con el require de auto-setup.php.
 *
 * @package hello-trompo
 */

// ──────────────────────────────────────────────
// 1. THEME SETUP
// ──────────────────────────────────────────────
function hello_trompo_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo', array(
        'height'      => 80,
        'width'       => 260,
        'flex-height' => true,
        'flex-width'  => true,
    ));
    add_theme_support('menus');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script'
    ));
    add_theme_support('align-wide');
    add_theme_support('responsive-embeds');
    add_theme_support('automatic-feed-links');

    register_nav_menus(array(
        'primary' => __('Menú principal', 'hello-trompo'),
        'footer'  => __('Menú footer', 'hello-trompo'),
    ));
}
add_action('after_setup_theme', 'hello_trompo_setup');

// ──────────────────────────────────────────────
// 2. ENQUEUE SCRIPTS & STYLES
// ──────────────────────────────────────────────
function hello_trompo_assets() {
    // CSS principal del tema base
    $css_path = get_template_directory() . '/assets/css/main.css';
    if (file_exists($css_path)) {
        wp_enqueue_style(
            'hello-trompo-main',
            get_template_directory_uri() . '/assets/css/main.css',
            array(),
            (string) filemtime($css_path)
        );
    }

    // CSS generado por BotConversor (estilos extraídos del HTML)
    $gen_css_path = get_template_directory() . '/assets/css/generated.css';
    if (file_exists($gen_css_path)) {
        wp_enqueue_style(
            'hello-trompo-generated',
            get_template_directory_uri() . '/assets/css/generated.css',
            array('hello-trompo-main'),
            (string) filemtime($gen_css_path)
        );
    }

    // JS principal del tema base
    $js_path = get_template_directory() . '/assets/js/main.js';
    if (file_exists($js_path)) {
        wp_enqueue_script(
            'hello-trompo-main',
            get_template_directory_uri() . '/assets/js/main.js',
            array(),
            (string) filemtime($js_path),
            true
        );
    }

    // JS generado por BotConversor (scripts extraídos del HTML)
    $gen_js_path = get_template_directory() . '/assets/js/generated.js';
    if (file_exists($gen_js_path)) {
        wp_enqueue_script(
            'hello-trompo-generated',
            get_template_directory_uri() . '/assets/js/generated.js',
            array(),
            (string) filemtime($gen_js_path),
            true
        );
    }
}
add_action('wp_enqueue_scripts', 'hello_trompo_assets');

// ──────────────────────────────────────────────
// 3. WIDGETS
// ──────────────────────────────────────────────
function hello_trompo_widgets_init() {
    register_sidebar(array(
        'name'          => __('Sidebar', 'hello-trompo'),
        'id'            => 'sidebar-1',
        'description'   => __('Widgets de la barra lateral.', 'hello-trompo'),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h2 class="widget-title">',
        'after_title'   => '</h2>',
    ));
}
add_action('widgets_init', 'hello_trompo_widgets_init');

// ──────────────────────────────────────────────
// 4. HELPERS
// ──────────────────────────────────────────────

/**
 * Devuelve permalink de una página por slug, con fallback.
 */
function hello_trompo_page_url($slug, $fallback_path = '/') {
    $page = get_page_by_path($slug);
    if ($page instanceof WP_Post) {
        return get_permalink($page);
    }
    return home_url($fallback_path);
}

/**
 * Menú de fallback si no hay menú asignado a 'primary'.
 */
function hello_trompo_primary_fallback_menu() {
    echo '<ul class="main-menu">';
    echo '<li><a href="' . esc_url(home_url('/')) . '">' . esc_html__('Inicio', 'hello-trompo') . '</a></li>';
    echo '</ul>';
}

// ──────────────────────────────────────────────
// 5. AUTO-SETUP (generado por BotConversor)
// ──────────────────────────────────────────────
$auto_setup_file = get_template_directory() . '/inc/auto-setup.php';

if (file_exists($auto_setup_file)) {
    require_once $auto_setup_file;
}
