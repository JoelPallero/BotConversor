<?php
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
