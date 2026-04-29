<?php
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
