<?php

// --------------------------------------------------------------------------
//
//   Opposite of built in WP functions for trailing slashes
//
// --------------------------------------------------------------------------

function leadingslashit($string) {
  return '/' . unleadingslashit($string);
}

function unleadingslashit($string) {
  return ltrim($string, '/');
}
