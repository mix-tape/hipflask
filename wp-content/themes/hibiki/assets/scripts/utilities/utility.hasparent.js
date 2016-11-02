// --------------------------------------------------------------------------
//   Check if node has a parent of specified class
// --------------------------------------------------------------------------

var hasParent = function(el, id) {
  if (el) {
    do {
      if (el.id === id) {
        return true;
      }
      if (el.nodeType === 9) {
        break;
      }
    }
    while((el = el.parentNode));
  }
  return false;
};
