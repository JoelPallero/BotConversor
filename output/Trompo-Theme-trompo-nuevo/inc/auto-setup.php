<?php
/**
 * Auto Setup: Crea páginas automáticamente al activar el tema.
 */

function hello_trompo_auto_setup_pages() {
    $pages = array(
        array('slug' => 'inicio', 'title' => 'Inicio', 'is_home' => true, 'template' => '')
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
