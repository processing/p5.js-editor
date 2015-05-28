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

	data: {
		tabs: []
	},

	methods: {
		
		openFile: function(file) {
			this.$root.openFile(file.path);
		},


		addTab: function(fileObject) {
			console.log('attempting to add tab', fileObject);
			if (fileObject.open) {
				var tabObject = {
					name: fileObject.name,
					path: fileObject.path,
					id: fileObject.path,
					type: 'file',
					open: true
				};

				this.tabs.push(tabObject);
			}
		},
	},

	ready: function() {
		console.log('tabs are ready', this.$root);
		this.$on('add-tab', this.addTab);
		this.$on('close-file', this.removeTab);
	},
};