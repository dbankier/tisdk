var request = require("request");
var ProgressBar = require("progress");
var _ = require("underscore");
var fs = require("fs");
var path = require("path");
var platform = "osx";
var os =  require('os');

if (os.platform()=="linux"){
  platform = "linux";
} else if (os.platform() === "win32") {
  platform = "win32";
}


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
};

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

exports.download = function(_version, destination, callback) {
  var version = _version.replace(/\./g, "_");
  exports.getGATags(function(tags) {
    var tag = _.find(tags, function(tag) {
      return tag.name === version;
    });
    if (!tag) {
      console.error("Invalid GA Version: use the `tisdk list` command");
      return;
    }
    var nightly = tag.name.split("_").splice(0,2).join("_") + "_" + "X";

    exports.getNightlies(nightly, function(list) {
      var build = _.find(list, function(t) { return t.git_revision === tag.commit.sha;});
      if (!build) {
        console.error("Build not available.");
        return;
      }
      var file = fs.createWriteStream(destination);
      var filename = build.filename;
      if (platform=="linux"){
        filename = filename.replace(/osx/g,"linux");
      } else if (platform === "win32") {
        filename = filename.replace(/osx/g,"win32");
      }

      var req = request.get("http://builds.appcelerator.com/mobile/" + nightly + "/" + filename);

      req.pipe(file);
      req.on('response', function(req) {
        var bar = new ProgressBar('Downloading... [:bar] :percent :etas', {
          complete: '=',
          incomplete: ' ',
          width: 40,
          total: parseInt(req.headers['content-length'])
        });
        req.on('data', function(buffer) {
          bar.tick(buffer.length);
        });
      });
      file.on('finish', function() {
        callback(build);
      });
    });
  });
};

