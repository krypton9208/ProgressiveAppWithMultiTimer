(function() {
  'use strict';
  var cache = {};

  cache.put = function (key, object) {
    window.localStorage.setItem(key, object)
  };

  cache.get = function (key) {
    window.localStorage.getItem(key)
  };

  cache.remove = function (key) {
    window.localStorage.removeItem(key)
  }

})();