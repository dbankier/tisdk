# TISDK

Install GA, RC, Beta, Alpha titanium sdk builds. Works also for v4+.

This is based on the git tags in the repository and the Appcelerator CI builds.

## Install

~~~
$ npm install -g tisdk
~~~

## Commmands

`tisdk list` - list available GA and RC builds, use the `--ga-only` flag to hide RCs and Betas

`tisdk install [version]` - installs the GA sdk , e.g. 4.0.0.GA.

`tisdk download [version]` - installs the GA sdk , e.g. 4.0.0.GA.

### Platforms Support

 * **OSX** - installs the sdk to `~/Library/Application Support/Titanium`.
 * **Linux** - installs the sdk to `~/.titanium` (thanks @m1ga)


**Licence: MIT**
