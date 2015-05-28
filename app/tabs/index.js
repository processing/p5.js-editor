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

		closeFile: function(file) {
			console.log('closing file');

			var target_tabs = this.tabs.filter(function(tab){
				return tab.name === file.name;
			});
			if(target_tabs[0]){
				target_tabs[0].file.open = false;
				console.log('target tab found');
				var newTarget;
				var index = _.indexOf(this.tabs,target_tabs[0]);
				console.log('index =',index);

				switch(index){
					case 0:
						newTarget = 0;
					break;
					case tabs.length-1:
					newTarget = tabs.length-1;
					break;
					default:
						newTarget = index-1;
					break;					
				}
				console.log('newTarget =',newTarget);
				this.tabs.splice(index, 1);

				this.$root.openFile(this.tabs[newTarget].path);
			}
		},


		addTab: function(fileObject) {
			console.log('attempting to add tab', fileObject);
			if (fileObject.open) {
				var tabObject = {
					name: fileObject.name,
					path: fileObject.path,
					id: fileObject.path,
					type: 'file',
					open: true,
					file: fileObject
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