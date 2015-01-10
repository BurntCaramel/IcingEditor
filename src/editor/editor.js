var React = require('react');
var ContentStore = require('../stores/store-content.js');
var ContentActions = require('../actions/actions-content.js');
var EditorElementsCreator = require('./editor-elements');

var Editor = React.createClass({
	componentDidMount: function() {
		
	},
	
	render: function() {
		var props = this.props;
		
		return React.createElement(SectionContent, {
			documentID: props.documentID,
			sectionID: props.sectionID
		});
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
	},
	
	componentWillUnmount: function() {  
		ContentStore.off('contentChangedForDocumentSection', this.contentChangedForDocumentSection);
		ContentStore.off('editedItemChangedForDocumentSection', this.contentChangedForDocumentSection);
	},
	
	componentDidUpdate: function(prevProps, prevState) {
		this.updateTextItemEditorPosition();
	},
	
	contentChangedForDocumentSection: function(documentID, sectionID) {
		if (
			(documentID === this.props['documentID']) ||
			(sectionID === this.props['sectionID'])
		) {
			this.forceUpdate();
		}
	},
	
	getActions: function() {
		var props = this.props;
		var documentID = props.documentID;
		var sectionID = props.sectionID;
		return ContentActions.getActionsForDocumentSection(documentID, sectionID);
	},
	
	render: function() {
		var actions = this.getActions();
		var content = ContentStore.getContentForDocumentSection(this.props['documentID'], this.props['sectionID']);
		return EditorElementsCreator.reactElementWithContentAndActions(content, actions);
	}
});


module.exports = {
	go: function() {
		React.render(
			React.createElement(Editor, {documentID: 'dummy', sectionID: 'main'}),
			document.getElementById('editor')
		)
	}
};