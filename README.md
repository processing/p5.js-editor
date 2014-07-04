# Node Webkit Boilerplate

Get a node webkit application up and running in no time! I have included a small example with Vue.js and Browserify to get you going quickly on a highly modular and testable application.

## Application Structure

All development takes place in the `app` folder. With gulp your files with be bundles up with Browserify and then sent to the `public` folder. The public folder contains the `package.json` for the application window, as well as the base `index.html` file for the application.

## Prerequisites

1. Node.js
2. Git
3. Gulp.js (`npm install gulp -g`)

## Workflow

1. Git clone `https://github.com/brandonjpierce/node-webkit-boilerplate.git`
2. Run `npm install`
3. Run `gulp`
4. Start the application with `npm run app` (I usually do this in a separate terminal)

## Linux Users

You may have an issue where your system will not be able to find `libudev.so.0`. If that is the case you can do the following:

1. Go into `node_modules/nodewebkit/nodewebkit/`
2. Run `sed -i 's/\x75\x64\x65\x76\x2E\x73\x6F\x2E\x30/\x75\x64\x65\x76\x2E\x73\x6F\x2E\x31/g' nw`
3. Profit