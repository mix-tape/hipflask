
        <time class="updated" datetime="<?php echo get_the_time('c'); ?>" pubdate><?php echo sprintf('Posted on %s at %s.', get_the_date(), get_the_time()); ?></time>

        <p class="byline"><?php echo 'Written by'; ?> <a href="<?php echo get_author_posts_url(get_the_author_meta('ID')); ?>" rel="author" class="fn"><?php echo get_the_author(); ?></a></p>
