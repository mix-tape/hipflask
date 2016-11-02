<?php
// --------------------------------------------------------------------------
//
//  TinyMCE Tweaks
//
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// Add a filter to append the default stylesheet to the tinymce editor.
// --------------------------------------------------------------------------

function hibiki_tiny_css($wp) {
  $wp .= ',' . get_template_directory_uri().'/assets/styles/styles.css';
  return $wp;
}

add_filter( 'mce_css', 'hibiki_tiny_css' );


// --------------------------------------------------------------------------
// Enable more buttons in tinyMCE
// --------------------------------------------------------------------------

function enable_more_buttons_1($buttons) {

  $buttons[] = 'hr';
  $buttons[] = 'sup';
  $buttons[] = 'sub';
  $buttons[] = 'anchor';
  $buttons[] = 'separator';
  $buttons[] = 'cleanup';
  $buttons[] = 'code';

  return $buttons;

}

add_filter("mce_buttons", "enable_more_buttons_1");

function enable_more_buttons_2($buttons) {

  return $buttons;

}

add_filter("mce_buttons_2", "enable_more_buttons_2");

function enable_more_buttons_3($buttons) {

  $buttons[] = 'styleselect';
  $buttons[] = 'fontsizeselect';

  return $buttons;

}

add_filter("mce_buttons_3", "enable_more_buttons_3");


// --------------------------------------------------------------------------
//  Remove H1 from formats to prevent multiple
// --------------------------------------------------------------------------

add_filter('tiny_mce_before_init', 'hibiki_mce_remove_unused_formats' );

function hibiki_mce_remove_unused_formats($init) {

  // Add block format elements to show in dropdown

  $init['block_formats'] = 'Paragraph=p;Heading 2=h2;Heading 3=h3;Heading 4=h4;Heading 5=h5;Heading 6=h6;Pre=pre';

  return $init;
}


// --------------------------------------------------------------------------
//  Add new styles to the TinyMCE "formats" menu dropdown
// --------------------------------------------------------------------------

function hibiki_mce_tyles_dropdown( $settings ) {

  // Create array of new styles
  $new_styles = array(

    array(
      'title' => 'Custom Styles',
      'items' => array(

        array(
          'title'   => 'Button',
          'inline'  => 'a',
          'classes' => 'button'
          ),
        array(
          'title'   => 'Small Padding',
          'block'   => 'div',
          'classes' => 'small-padding',
          'wrapper' => true
        ),
        array(
          'title'   => 'Big Padding',
          'block'   => 'div',
          'classes' => 'big-padding',
          'wrapper' => true
        ),
      ),
    ),
  );

  // Merge old & new styles
  $settings['style_formats_merge'] = true;

  // Add new styles
  $settings['style_formats'] = json_encode( $new_styles );

  // Return New Settings
  return $settings;

}

add_filter( 'tiny_mce_before_init', 'hibiki_mce_tyles_dropdown' );


// --------------------------------------------------------------------------
// Force the kitchen sink to always be on
// --------------------------------------------------------------------------

function hibiki_mce_force_kitch_sink_on(){

  set_user_setting('hidetb', 1);

}

add_action('auth_redirect', 'hibiki_mce_force_kitch_sink_on');


// --------------------------------------------------------------------------
// Remove automatic paragraph creation around images
// --------------------------------------------------------------------------

function img_unautop($pee) {

  $pee = preg_replace('/<p>\\s*?(<a .*?><img.*?><\\/a>|<img.*?>)?\\s*<\\/p>/s', '<figure>$1</figure>', $pee);
  return $pee;

}

add_filter( 'the_content', 'img_unautop', 30 );


// --------------------------------------------------------------------------
// Clean the output of attributes of images in editor.
// --------------------------------------------------------------------------

function image_tag_class($class, $id, $align, $size) {

  $align = 'align' . esc_attr($align);
  return $align;

}

add_filter('get_image_tag_class', 'image_tag_class', 0, 4);


function image_tag($html, $id, $alt, $title) {

  return preg_replace(

    array(
      '/\s+width="\d+"/i',
      '/\s+height="\d+"/i',
      '/alt=""/i'
    ),
    array(
      '',
      '',
      '',
      'alt="' . $title . '"'
    ),
    $html

  );
}

add_filter('get_image_tag', 'image_tag', 0, 4);
