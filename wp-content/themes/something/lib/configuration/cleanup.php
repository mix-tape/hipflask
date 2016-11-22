<?php
// --------------------------------------------------------------------------
//
//   Cleanup markup
//
// --------------------------------------------------------------------------


// --------------------------------------------------------------------------
//   Clean up wp_head()
// --------------------------------------------------------------------------

/**
 * Remove unnecessary <link>'s
 * Remove inline CSS used by Recent Comments widget
 * Remove inline CSS used by posts with galleries
 * Remove self-closing tag and change ''s to "'s on rel_canonical()
 * Remove JSON API link
 */

function hibiki_head_cleanup() {

  remove_action('wp_head', 'feed_links', 2);
  remove_action('wp_head', 'feed_links_extra', 3);
  remove_action('wp_head', 'rsd_link');
  remove_action('wp_head', 'wlwmanifest_link');
  remove_action('wp_head', 'adjacent_posts_rel_link_wp_head', 10, 0);
  remove_action('wp_head', 'wp_generator');
  remove_action('wp_head', 'wp_shortlink_wp_head', 10, 0);
  remove_action('wp_head', 'rest_output_link_wp_head');
  remove_action('wp_head', 'wp_oembed_add_discovery_links');
  remove_action('wp_head', 'rel_canonical');


  if (wp_count_posts()->publish > 0){
    add_action('wp_head', 'hibiki_add_back_rss_feed');
    function hibiki_add_back_rss_feed() {
      echo '<link rel="alternate" type="application/rss+xml" title="'.get_bloginfo('name').' Feed" href="'.get_bloginfo('rss2_url').'" />' . "\n";
    }
  }

  // Remove Emoji Support
  remove_action('wp_head', 'wp_resource_hints', 2);
  remove_action('wp_head', 'print_emoji_detection_script', 7);
  remove_action('wp_print_styles', 'print_emoji_styles');

  global $wp_widget_factory;
  remove_action('wp_head', array($wp_widget_factory->widgets['WP_Widget_Recent_Comments'], 'recent_comments_style'));

  add_filter('use_default_gallery_style', '__return_null');

}

add_action('init', 'hibiki_head_cleanup');


// --------------------------------------------------------------------------
//   Remove the WordPress version from RSS feeds
// --------------------------------------------------------------------------

add_filter('the_generator', '__return_false');


// --------------------------------------------------------------------------
//   Remove unnecessary dashboard widgets
// --------------------------------------------------------------------------

function hibiki_remove_dashboard_widgets() {
  remove_meta_box('dashboard_incoming_links', 'dashboard', 'normal');
  remove_meta_box('dashboard_plugins', 'dashboard', 'normal');
  remove_meta_box('dashboard_primary', 'dashboard', 'normal');
  remove_meta_box('dashboard_secondary', 'dashboard', 'normal');
}

add_action('admin_init', 'hibiki_remove_dashboard_widgets');


// --------------------------------------------------------------------------
//   Clean up language_attributes() used in <html> tag
// --------------------------------------------------------------------------

/**
 * Change lang="en-US" to lang="en"
 * Remove dir="ltr"
 */

function hibiki_language_attributes() {
  $attributes = array();
  $output = '';

  if (function_exists('is_rtl')) {
    if (is_rtl() == 'rtl') {
      $attributes[] = 'dir="rtl"';
    }
  }

  $lang = get_bloginfo('language');

  if ($lang && $lang !== 'en-US') {
    $attributes[] = "lang=\"$lang\"";
  } else {
    $attributes[] = 'lang="en"';
  }

  $output = implode(' ', $attributes);
  $output = apply_filters('hibiki_language_attributes', $output);

  return $output;
}

add_filter('language_attributes', 'hibiki_language_attributes');


// --------------------------------------------------------------------------
//   Clean up output of stylesheet <link> tags
// --------------------------------------------------------------------------

function hibiki_clean_style_tag($input) {
  preg_match_all("!<link rel='stylesheet'\s?(id='[^']+')?\s+href='(.*)' type='text/css' media='(.*)' />!", $input, $matches);
  // Only display media if it's print
  $media = $matches[3][0] === 'print' ? ' media="print"' : '';
  return '<link rel="stylesheet" href="' . $matches[2][0] . '"' . $media . '>' . "\n";
}

add_filter('style_loader_tag', 'hibiki_clean_style_tag');



// --------------------------------------------------------------------------
//   Wrap embedded media as suggested by Readability
// --------------------------------------------------------------------------

function hibiki_embed_wrap($cache, $url, $attr = '', $post_ID = '') {
  return '<figure class="entry-content-asset">' . $cache . '</figure>';
}

add_filter('embed_oembed_html', 'hibiki_embed_wrap', 10, 4);
add_filter('embed_googlevideo', 'hibiki_embed_wrap', 10, 2);


// --------------------------------------------------------------------------
//   Add class="thumbnail" to attachment items
// --------------------------------------------------------------------------

function hibiki_attachment_link_class($html) {
  $postid = get_the_ID();
  $html = str_replace('<a', '<a class="thumbnail"', $html);
  return $html;
}

add_filter('wp_get_attachment_link', 'hibiki_attachment_link_class', 10, 1);


// --------------------------------------------------------------------------
//   Clean up the_excerpt()
// --------------------------------------------------------------------------

function hibiki_excerpt_length($length) {
  return 25;
}

function hibiki_excerpt_more($more) {
  return ' &hellip; <a href="' . get_permalink() . '">' . __('Continued', 'hibiki') . '</a>';
}

add_filter('excerpt_length', 'hibiki_excerpt_length');
add_filter('excerpt_more', 'hibiki_excerpt_more');


// --------------------------------------------------------------------------
//   Remove unnecessary self-closing tags
// --------------------------------------------------------------------------

function hibiki_remove_self_closing_tags($input) {
  return str_replace(' />', '>', $input);
}

add_filter('get_avatar',          'hibiki_remove_self_closing_tags'); // <img />
add_filter('comment_id_fields',   'hibiki_remove_self_closing_tags'); // <input />
add_filter('post_thumbnail_html', 'hibiki_remove_self_closing_tags'); // <img />


// --------------------------------------------------------------------------
//   Don't return the default description in the RSS feed if it hasn't been changed
// --------------------------------------------------------------------------

function hibiki_remove_default_description($bloginfo) {
  $default_tagline = 'Just another WordPress site';

  return ($bloginfo === $default_tagline) ? '' : $bloginfo;
}

add_filter('get_bloginfo_rss', 'hibiki_remove_default_description');


// --------------------------------------------------------------------------
//   Allow more tags in TinyMCE including <iframe> and <script>
// --------------------------------------------------------------------------

function hibiki_change_mce_options($options) {
  $ext = 'pre[id|name|class|style],iframe[align|longdesc|name|width|height|frameborder|scrolling|marginheight|marginwidth|src],script[charset|defer|language|src|type]';

  if (isset($initArray['extended_valid_elements'])) {
    $options['extended_valid_elements'] .= ',' . $ext;
  } else {
    $options['extended_valid_elements'] = $ext;
  }

  return $options;
}

add_filter('tiny_mce_before_init', 'hibiki_change_mce_options');


// --------------------------------------------------------------------------
//   Add additional classes onto widgets
// --------------------------------------------------------------------------

function hibiki_widget_first_last_classes($params) {
  global $my_widget_num;

  $this_id = $params[0]['id'];
  $arr_registered_widgets = wp_get_sidebars_widgets();

  if (!$my_widget_num) {
    $my_widget_num = array();
  }

  if (!isset($arr_registered_widgets[$this_id]) || !is_array($arr_registered_widgets[$this_id])) {
    return $params;
  }

  if (isset($my_widget_num[$this_id])) {
    $my_widget_num[$this_id] ++;
  } else {
    $my_widget_num[$this_id] = 1;
  }

  $class = 'class="widget-' . $my_widget_num[$this_id] . ' ';

  if ($my_widget_num[$this_id] == 1) {
    $class .= 'widget-first ';
  } elseif ($my_widget_num[$this_id] == count($arr_registered_widgets[$this_id])) {
    $class .= 'widget-last ';
  }

  $params[0]['before_widget'] = preg_replace('/class=\"/', "$class", $params[0]['before_widget'], 1);

  return $params;
}

add_filter('dynamic_sidebar_params', 'hibiki_widget_first_last_classes');


// --------------------------------------------------------------------------
//   Redirects search results from /?s=query to /search/query/, converts %20 to +
// --------------------------------------------------------------------------

function hibiki_nice_search_redirect() {
  global $wp_rewrite;
  if (!isset($wp_rewrite) || !is_object($wp_rewrite) || !$wp_rewrite->using_permalinks()) {
    return;
  }

  $search_base = $wp_rewrite->search_base;
  if (is_search() && !is_admin() && strpos($_SERVER['REQUEST_URI'], "/{$search_base}/") === false) {
    wp_redirect(home_url("/{$search_base}/" . urlencode(get_query_var('s'))));
    exit();
  }
}

add_action('template_redirect', 'hibiki_nice_search_redirect');


// --------------------------------------------------------------------------
//   Tell WordPress to use searchform.php from the templates/ directory
// --------------------------------------------------------------------------

function hibiki_get_search_form() {
  locate_template('/templates/modules/searchform.php', true, true);
}

add_filter('get_search_form', 'hibiki_get_search_form');
