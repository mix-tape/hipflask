
  <div class="wrapper page-content">

    <?php while (have_posts()) : the_post(); ?>

      <article <?php post_class('container article') ?> id="post-<?php the_ID(); ?>">

        <header class="article-header">

          <h1><?php echo roots_title(); ?></h1>

          <?php get_template_part('templates/modules/entry-meta'); ?>

        </header>

        <div class="article-content">

          <?php the_content(); ?>

        </div>

        <footer class="article-footer">

          <?php the_tags('<ul class="entry-tags"><li>','</li><li>','</li></ul>'); ?>

        </footer>

        <?php comments_template('/templates/modules/comments.php'); ?>

      </article>

    <?php endwhile; ?>

  </div>
