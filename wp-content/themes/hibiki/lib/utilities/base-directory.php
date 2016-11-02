<?php

// --------------------------------------------------------------------------
//   Returns WP Base Directory
// --------------------------------------------------------------------------

function wp_base_dir() {
  preg_match('!(https?://[^/|"]+)([^"]+)?!', home_url(), $matches);
  if (count($matches) === 3) {
    return end($matches);
  } else {
    return '';
  }
}
