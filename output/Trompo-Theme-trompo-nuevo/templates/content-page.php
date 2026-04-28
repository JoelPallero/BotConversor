<?php
/**
 * Template Name: Contenido de Página
 * Template part for displaying page content
 *
 * @package hello-trompo
 */
?>

<article <?php post_class('entry entry-page'); ?>>
  <header class="entry-header">
    <h1 class="entry-title"><?php the_title(); ?></h1>
  </header>

  <div class="entry-content">
    <?php
    the_content();

    wp_link_pages(array(
      'before' => '<nav class="page-links">' . esc_html__('Páginas:', 'hello-trompo'),
      'after'  => '</nav>',
    ));
    ?>
  </div>
</article>
