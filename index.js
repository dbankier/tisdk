var request = require("request");
var ProgressBar = require("progress");
var _ = require("underscore");
var fs = require("fs");
var path = require("path");
var platform = "osx";
var os =  require('os');
var tmp = require('tmp');
var rimraf = require("rimraf");
var chalk = require("chalk");
var appc = require("node-appc");

var _spawn = require('child_process').spawn;
function spawn(cmd,args,props) {
  if (process.platform === 'win32') {
    args = ['/c',cmd].concat(args);
    cmd = process.env.comspec;
  }
  return _spawn(cmd,args,props);
}

var TITANIUM, platform;
if (os.platform()=="linux"){
  TITANIUM = path.join(process.env.HOME, '.titanium');
  platform = "linux";
} else if (os.platform() === "win32") {
  TITANIUM = path.join(process.cwd().split(path.sep)[0], "ProgramData", "Titanium");
  platform = "win32";
} else {
  TITANIUM = path.join(process.env.HOME, 'Library', 'Application Support', 'Titanium');
  platform = "osx";
}
exports.platform = platform;


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
        console.error("Build not available. Try the `tisdk build` command to build the sdk from source.");
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

exports.manualBuild = function(_version, destination, callback) {
  var version = _version.replace(/\./g, "_");
  exports.getGATags(function(tags) {
    var tag = _.find(tags, function(tag) {
      return tag.name === version;
    });
    if (!tag) {
      console.error("Invalid GA Version: use the `tisdk list` command");
      return;
    }
    var tmp_dir = tmp.dirSync({prefix:'tisdk_'}).name;

    var args = "clone --depth 1 --branch " + version + " https://github.com/appcelerator/titanium_mobile " + tmp_dir;
    var git = spawn('git', args.split(" "), {stdio: "inherit"});
    git.on('error',function(err) { console.log(err); });
    git.on('exit', function(){
      var scons = spawn('scons', ['-C', tmp_dir], {stdio: "inherit", env: process.env});
      scons.on('error',function(err) { console.log(err); });
      scons.on('exit', function() {
        fs.renameSync(path.join(tmp_dir, 'dist', "mobilesdk-" + _version.split(".").splice(0,3).join(".") + "-" + platform + ".zip"), destination);
        callback();
      });
    });
  });
};

exports.installTarget = function(version) {
  return path.join(TITANIUM, "mobilesdk", platform, version);
};

exports.unzip = function(version, src, bundled_version_name, overwrite, callback) {
  var target = exports.installTarget(version);
  console.log("Unzipping...");
  appc.zip.unzip(src, TITANIUM, {
    visitor: function(entry, i, len) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write("Unzipping (" + i + "/" + len + ") : " + chalk.grey(entry.entryName) );
    }
  }, function() {
    var source = path.join(TITANIUM, "mobilesdk", platform, bundled_version_name);
    console.log("");
    if (overwrite) {
      console.log("Removing old " + target);
      rimraf.sync(target);
    }
    console.log("Renaming " + source + " to " + target);
    fs.renameSync(source, target);
    fs.unlinkSync(src);
    callback();
  });
};


