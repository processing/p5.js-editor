## A Javascript editor for p5.js

To get started, [download the editor here](https://github.com/antiboredom/jside/releases/latest), and visit [p5js.org](http://p5js.org) for more info on p5.js.

## Development

If you're interested in contributing, follow the direction below:

### Prerequisites

1. Node.js
2. Git

### Setup

1. Clone this repo: `git clone https://github.com/antiboredom/jside.git`
2. Enter the repo directory and install the development module: `npm
   install`
3. Install secondary modules: `cd public` and then `npm install`
4. Install gulp.js globally: `npm install gulp -g`
5. From the root directory of the repo run gulp: `gulp`
6. Start up the app: `npm run app`

### Workflow

Most development takes place in the `app` folder. Gulp will watch the files in the app folder, then bundle them up with Browserfiy, and send the results to the `public` folder.

The public folder contains the `package.json` for the application window, as well as the base `index.html` file for the application.

Below you'll find documentation for the different libraries we're using
* [vue.js](http://vuejs.org/)
* [node-webkit](https://github.com/rogerwang/node-webkit/wiki)
* [browserify](http://browserify.org/)
* [gulp.js](http://gulpjs.com/)
