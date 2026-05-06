<?php
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
