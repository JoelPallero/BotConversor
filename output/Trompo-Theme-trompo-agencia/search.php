<?php get_header(); ?>

<main id="content" class="site-main">
  <div class="container content-layout">
    <div class="content-area">
      <header class="page-header">
        <h1 class="page-title">
          <?php
          printf(
            /* translators: %s: search query */
            esc_html__('Resultados de búsqueda para: %s', 'hello-trompo'),
            '<span>' . esc_html(get_search_query()) . '</span>'
          );
          ?>
        </h1>
      </header>

      <?php if (have_posts()) : ?>
        <?php while (have_posts()) : the_post(); ?>
          <article <?php post_class('entry'); ?>>
            <header class="entry-header">
              <h2 class="entry-title">
                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
              </h2>
            </header>
            <div class="entry-content">
              <?php the_excerpt(); ?>
            </div>
          </article>
        <?php endwhile; ?>

        <nav class="pagination">
          <?php the_posts_pagination(); ?>
        </nav>
      <?php else : ?>
        <p><?php esc_html_e('No se encontraron resultados.', 'hello-trompo'); ?></p>
        <?php get_search_form(); ?>
      <?php endif; ?>
    </div>

    <aside class="sidebar">
      <?php get_sidebar(); ?>
    </aside>
  </div>
</main>

<?php get_footer(); ?>

