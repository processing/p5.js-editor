var Path = nodeRequire('path');
var fs = nodeRequire('fs');
var trash = nodeRequire('trash');

var File = require('./../files');
var _ = require('underscore');
var $ = require('jquery');

module.exports = {
	template: require('./template.html'),
	
	components: {
		tab: {
			template: require('./tab.html'),
			computed: {
				hidden: function() {
					return this.name[0] === '.'
				},
				className: function() {
					var c = '';
					if (this.$root.currentFile.path == this.path) c += ' selected';
					return c;
				}
			},

			methods: {

			}
		}

	},

	methods: {
		openFile: function(file) {
			this.$root.openFile(file.path);
		},

	}
};