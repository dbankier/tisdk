# TISDK

Install GA, RC, Beta, Alpha titanium sdk builds. Works also for v4+.

This is based on the git tags in the repository and the Appcelerator CI builds.

## Install

~~~
$ npm install -g tisdk
~~~

## Commmands

`tisdk list` - list available GA and RC builds, use the `--ga-only` flag to hide RCs and Betas

`tisdk install [version]` - installs the GA sdk , e.g. 4.0.0.GA. `--force` flag overrides existing install.

`tisdk download [version]` - installs the GA sdk , e.g. 4.0.0.GA.

`tisdk build [version]` - manually builds the GA sdk from the source, e.g. 5.0.0.GA. `--force` flag overrides existing install.

## Manual builds

When using the `tisdk build` command ensure you have everything installed for the manual build.
See the [Appcelerator Wiki](http://docs.appcelerator.com/platform/latest/#!/guide/Building_the_Titanium_SDK_From_Source).
In short you need node, android sdk API 23 and ndk, scons, python, git, oracle jdk 1.6, ios sdk, etc.

Also make sure your environment variables are set. For example:

```
export ANDROID_SDK="$HOME/Android"
export ANDROID_NDK="$HOME/android-ndk-r11c"
export ANDROID_PLATFORM="$ANDROID_SDK/platforms/android-25"
export GOOGLE_APIS="$ANDROID_SDK/add-ons/addon-google_apis-google-25"
export JAVA_HOME=$(/usr/libexec/java_home -v 1.7)
export PATH=$ANDROID_SDK/tools:$ANDROID_SDK/platform-tools:$JAVA_HOME/bin:$PATH
```




### Platforms Support

 * **OSX** - installs the sdk to `~/Library/Application Support/Titanium`.
 * **Linux** - installs the sdk to `~/.titanium` (thanks @m1ga)


**Licence: MIT**
