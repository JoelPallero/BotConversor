<?php
// Habilitar errores temporalmente para diagnosticar pantalla en blanco
error_reporting(E_ALL);
ini_set('display_errors', 1);
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

function hello_trompo_assets() {
    $css_path = get_template_directory() . '/assets/css/main.css';
    $js_path  = get_template_directory() . '/assets/js/main.js';

    wp_enqueue_style(
        'hello-trompo-main',
        get_template_directory_uri() . '/assets/css/main.css',
        array(),
        file_exists($css_path) ? (string) filemtime($css_path) : '1.0'
    );

    wp_enqueue_script(
        'hello-trompo-main',
        get_template_directory_uri() . '/assets/js/main.js',
        array(),
        file_exists($js_path) ? (string) filemtime($js_path) : '1.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'hello_trompo_assets');

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

function hello_trompo_page_url($slug, $fallback_path = '/') {
    $page = get_page_by_path($slug);
    if ($page instanceof WP_Post) {
        return get_permalink($page);
    }
    return home_url($fallback_path);
}

function hello_trompo_primary_fallback_menu() {
    echo '<ul class="main-menu">';
    echo '<li><a href="' . esc_url(home_url('/')) . '">' . esc_html__('Inicio', 'hello-trompo') . '</a></li>';
    echo '</ul>';
}

// Incluir auto-setup si fue generado por BotConversor
if (file_exists(get_template_directory() . '/inc/auto-setup.php')) {
    require_once get_template_directory() . '/inc/auto-setup.php';
}
