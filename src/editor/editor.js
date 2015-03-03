var React = require('react');
var ContentStore = require('../stores/store-content.js');
var SettingsStore = require('../stores/store-settings.js');
var ContentStoreSaving = require('../stores/store-content-saving.js');
var ContentStoreLoading = require('../stores/store-content-loading.js');
var ContentActions = require('../actions/actions-content.js');
var EditorElementsCreator = require('./editor-elements');
var PreviewElementsCreator = require('../preview/preview-elements');
var Toolbars = require('./editor-toolbars');
var PreviewStore = require('../stores/store-preview');


var Editor = React.createClass({
	componentDidMount: function() {
		PreviewStore.on('didEnterPreview', this.previewStateChanged);
		PreviewStore.on('didExitPreview', this.previewStateChanged);
	},
	
	previewStateChanged: function() {
		this.forceUpdate();
	},
	
	render: function() {
		var props = this.props;
		var isPreviewing = PreviewStore.getIsPreviewing();
		
		if (isPreviewing) {
			return React.createElement(SectionPreview, {
				key: 'preview',
				documentID: props.documentID,
				sectionID: props.sectionID
			});
		}
		else {
			return React.createElement(SectionContent, {
				key: 'content',
				documentID: props.documentID,
				sectionID: props.sectionID
			});
		}
	}
});

var PreviewHTMLCode = React.createClass({
	componentDidMount: function() {
		if (window.hljs) {
			var codeElement = this.refs.code.getDOMNode();
			window.hljs.highlightBlock(codeElement);
		}
	},
	
	render: function() {
		var props = this.props;
		var previewHTML = props.previewHTML;
		
		return React.createElement('code', {
			className: 'language-html',
			ref: 'code'
		}, previewHTML);
	}
});

var SectionPreview = React.createClass({
	render: function() {
		var props = this.props;
		var documentID = props.documentID;
		var sectionID = props.sectionID;
		
		var actions = ContentActions.getActionsForDocumentSection(documentID, sectionID);
		
		var content = ContentStore.getContentForDocumentSection(documentID, sectionID);
		var config = ContentStore.getSpecsForDocumentSection(documentID, sectionID);
		
		var mainToolbar = React.createElement(Toolbars.MainToolbar, {
			key: 'mainToolbar',
			actions: actions
		});
		
		var previewHTML = PreviewElementsCreator.previewHTMLWithContent(content, config);
		
		var previewDisplayElement = React.createElement('pre', {
			key: 'pre',
			className: 'previewHTMLHolder'
		}, React.createElement(PreviewHTMLCode, {
			previewHTML: previewHTML
		}));
		
		return React.createElement('div', {
			key: 'previewContent'
		}, [
			mainToolbar,
			//previewElement
			previewDisplayElement
		]);
	}
});

var SectionContent = React.createClass({
	updateTextItemEditorPosition: function() {
		var masterNode = this.getDOMNode();
		var activeTextItem = masterNode.getElementsByClassName('textItem-active')[0];
		var textItemEditor = masterNode.getElementsByClassName('textItemEditor')[0];
		
		if (activeTextItem && textItemEditor) {
			var offsetTop = activeTextItem.offsetTop;
			textItemEditor.style.top = offsetTop + 'px';
		}
	},
	
	componentDidMount: function() {
		ContentStore.on('contentChangedForDocumentSection', this.contentChangedForDocumentSection);
		ContentStore.on('editedItemChangedForDocumentSection', this.contentChangedForDocumentSection);
		ContentStore.on('editedBlockChangedForDocumentSection', this.contentChangedForDocumentSection);
	},
	
	componentWillUnmount: function() {  
		ContentStore.off('contentChangedForDocumentSection', this.contentChangedForDocumentSection);
		ContentStore.off('editedItemChangedForDocumentSection', this.contentChangedForDocumentSection);
		ContentStore.off('editedBlockChangedForDocumentSection', this.contentChangedForDocumentSection);
	},
	
	componentDidUpdate: function(prevProps, prevState) {
		this.updateTextItemEditorPosition();
	},
	
	contentChangedForDocumentSection: function(documentID, sectionID) {
		var props = this.props;
		if (
			(documentID === props.documentID) ||
			(sectionID === props.sectionID)
		) {
			this.forceUpdate();
		}
	},
	
	render: function() {
		var props = this.props;
		var documentID = props.documentID;
		var sectionID = props.sectionID;
		
		var actions = ContentActions.getActionsForDocumentSection(documentID, sectionID);
		
		var content = ContentStore.getContentForDocumentSection(documentID, sectionID);
		var specs = ContentStore.getSpecsForDocumentSection(documentID, sectionID);
		
		var mainToolbar = React.createElement(Toolbars.MainToolbar, {
			key: 'mainToolbar',
			actions: actions
		});
		
		var editorElement = React.createElement(EditorElementsCreator.MainElement, {
			contentImmutable: content,
			specsImmutable: specs,
			actions: actions
		});
		
		return React.createElement('div', {
			key: 'editorContent'
		}, [
			mainToolbar,
			editorElement
		]);
	}
});


module.exports = {
	go: function() {
		var documentID = SettingsStore.getInitialDocumentID();
		var sectionID = SettingsStore.getInitialDocumentSectionID();
		
		React.render(
			React.createElement(Editor, {documentID: documentID, sectionID: sectionID}),
			document.getElementById('burntIcingEditor')
		);
		
		ContentStoreLoading.loadContentForDocument(documentID);
	},
	
	onDocumentLoad: function(event) {
		document.removeEventListener('DOMContentLoaded', this.onDocumentLoadBound);
		this.onDocumentLoadBound = null;
		
		this.go();
	},
	
	goOnDocumentLoad: function() {
		if (document.readyState === 'loading') {
			this.onDocumentLoadBound = this.onDocumentLoad.bind(this);
			document.addEventListener('DOMContentLoaded', this.onDocumentLoadBound);
		}
		else {
			setTimeout(function() {
				this.go();
			}, 0);
		}
	}
};