<?php
// --------------------------------------------------------------------------
//
//  Theme Enqueue
//    Scripts and Styles enqueue
//
// --------------------------------------------------------------------------

function hibiki_enqueue_scripts() {

  // Deregister local scripts

  wp_deregister_script( 'jquery' );
  wp_deregister_script( 'comment-reply' );
  wp_deregister_script( 'wp-embed' );

  // Queue Scripts

  wp_enqueue_script( 'jquery', get_bloginfo('template_url') . '/assets/scripts/global.js', '', '', true ); // Name the vendor scripts jquery as this is often required by plugins

  // Queue Styles

  wp_enqueue_style('styles', get_bloginfo('template_url') . '/assets/styles/styles.css');

}

if ( !is_admin()) add_action('wp_enqueue_scripts', 'hibiki_enqueue_scripts', 0 );


// --------------------------------------------------------------------------
//   Font enqueue
// --------------------------------------------------------------------------

function hibiki_enqueue_fonts() { ?>

<script type="text/javascript">
  WebFontConfig = {
    // google: { families: [ 'Open+Sans' ] }
  };
  (function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })();
</script>

<?php }

add_action( 'wp_footer', 'hibiki_enqueue_fonts' );
