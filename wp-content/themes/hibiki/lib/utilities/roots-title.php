<?php

// --------------------------------------------------------------------------
//
//   Roots Title function
//
// --------------------------------------------------------------------------

function roots_title() {
  if (is_home()) {
    if (get_option('page_for_posts', true)) {
      echo get_the_title(get_option('page_for_posts', true));
    } else {
      _e('Latest Posts', 'roots');
    }
  } elseif (is_archive()) {
    $term = get_term_by('slug', get_query_var('term'), get_query_var('taxonomy'));
    if ($term) {
      echo $term->name;
    } elseif (is_post_type_archive()) {
      echo get_queried_object()->labels->name;
    } elseif (is_day()) {
      printf('Daily Archives: %s', get_the_date());
    } elseif (is_month()) {
      printf('Monthly Archives: %s', get_the_date('F Y'));
    } elseif (is_year()) {
      printf('Yearly Archives: %s', get_the_date('Y'));
    } elseif (is_author()) {
      global $post;
      $author_id = $post->post_author;
      printf('Author Archives: %s', get_the_author_meta('display_name', $author_id));
    } else {
      single_cat_title();
    }
  } elseif (is_search()) {
    printf('Search Results for %s', get_search_query());
  } elseif (is_404()) {
    _e('File Not Found', 'roots');
  } else {
    the_title();
  }
}
