var request = require("request");

exports.getGATags = function getGATags(callback) {
  request({
    url: "https://api.github.com/repos/appcelerator/titanium_mobile/tags?per_page=50",
    headers: {
      'User-Agent': 'Awesome-Octocat-App'
    }
  }, function(err, res) {
    var tags = JSON.parse(res.body).filter(function(a) { return a.name.match(/^\d+_\d+_\d+_.*/); });
    callback(tags);
  });
}

exports.getNightlies = function getNightlies(branch, callback) {
  request({
    url: "http://builds.appcelerator.com/mobile/" + branch + "/index.json",
    headers: {
//      'User-Agent': 'Awesome-Octocat-App'
    }
  }, function(err, res) {
    callback(JSON.parse(res.body));
  });
};

