<?php get_header(); ?>

<main id="content" class="site-main">
  <div class="container content-layout">
    <div class="content-area">
      <header class="page-header">
        <h1 class="page-title"><?php the_archive_title(); ?></h1>
        <div class="archive-description"><?php the_archive_description(); ?></div>
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
        <p><?php esc_html_e('No hay publicaciones para mostrar.', 'hello-trompo'); ?></p>
      <?php endif; ?>
    </div>

    <aside class="sidebar">
      <?php get_sidebar(); ?>
    </aside>
  </div>
</main>

<?php get_footer(); ?>

