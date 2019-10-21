import UIManager from './UIManager.js';

var options = (() => {
  var query = location.search;
  var hashes = query.slice(query.indexOf('?')+1).split('&');
  return hashes.reduce((params, hash) => {
    let [key, val] = hash.split('=');
    return Object.assign(params, {[key]: decodeURIComponent(val)});
  }, {})
})();
if (Object.keys(options).length >= 1) {
  var uiManager = new UIManager(options);
} else {
  console.error("Supplied the wrong number of params");
}