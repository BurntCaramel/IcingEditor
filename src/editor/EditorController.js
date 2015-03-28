/**
	Copyright 2015 Patrick George Wyndham Smith
*/

var React = require('react');
var Immutable = require('immutable');
//let PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ContentStore = require('../stores/ContentStore');
var SpecsStore = require('../stores/SpecsStore');
var ConfigurationStore = require('../stores/ConfigurationStore');
var ContentSavingStore = require('../stores/ContentSavingStore');
var ContentLoadingStore = require('../stores/ContentLoadingStore');
var ContentActions = require('../actions/ContentActions');
var EditorElementsCreator = require('./EditorElements');
var PreviewElementsCreator = require('../preview/PreviewElements');
let ContentSettingsElement = require('./ContentSettings');
var Toolbars = require('./EditorToolbars');
var PreviewStore = require('../stores/PreviewStore');
var ReorderingStore = require('../stores/ReorderingStore');


/*
* State is updated with previous state, to make checking equality between properties work in shouldComponentUpdate.
*/
let latestStateWithPreviousState = function(
	previousState = null, {
		updateAll = false,
		updateDocumentState = updateAll,
		updateViewingState = updateAll,
		updateActions = updateAll
	}
) {
	if (!previousState) {
		previousState = {
			documentState: Immutable.Map(),
			viewingState: Immutable.Map(),
			actions: null
		};
	}
	
	let documentID = ConfigurationStore.getCurrentDocumentID();
	let sectionID = ConfigurationStore.getCurrentDocumentSectionID();
	
	let {
		documentState,
		viewingState,
		actions
	} = previousState;
	
	if (updateDocumentState) {
		let editedBlockIdentifier = ContentStore.getEditedBlockIdentifierForDocumentSection(documentID, sectionID);
		
		let previousDocumentState = documentState;
		documentState = documentState.merge({
			documentID,
			sectionID,
			specsURLs: ContentStore.getSpecsURLsForDocumentWithID(documentID),
			content: ContentStore.getContentForDocumentSection(documentID, sectionID),
			specs: ContentStore.getSpecsForDocumentSection(documentID, sectionID),
			blockTypeGroups: ConfigurationStore.getAvailableBlockTypesGroups(),
			editedBlockIdentifier: ContentStore.getEditedBlockIdentifierForDocumentSection(documentID, sectionID),
			editedBlockKeyPath: ContentStore.getEditedBlockKeyPathForDocumentSection(documentID, sectionID),
			editedTextItemIdentifier: ContentStore.getEditedTextItemIdentifierForDocumentSection(documentID, sectionID),
			editedTextItemKeyPath: ContentStore.getEditedTextItemKeyPathForDocumentSection(documentID, sectionID),
			focusedBlockIdentifierForReordering: ReorderingStore.getFocusedBlockIdentifierForDocumentSection(documentID, sectionID),
			focusedBlockKeyPathForReordering: ReorderingStore.getFocusedBlockKeyPathForDocumentSection(documentID, sectionID)
		});
	}
	
	if (updateViewingState) {
		viewingState = viewingState.merge({
			isShowingSettings: ContentStore.getIsShowingSettings(),
			isPreviewing: PreviewStore.getIsPreviewing(),
			isReordering: ReorderingStore.getIsReordering()
		});
	}
	
	if (updateActions) {
		actions = ContentActions.getActionsForDocumentSection(documentID, sectionID);
	}
	
	return {
		documentState,
		viewingState,
		actions
	};
}


var EditorMain = React.createClass({
	getInitialState() {
		return latestStateWithPreviousState(null, {
			updateAll: true
		});
	},
	
	listenToStores(on) {
		let method = on ? 'on' : 'off';
		
		ContentStore[method]('specsChangedForDocument', this.updateDocumentState);
		ContentStore[method]('contentChangedForDocumentSection', this.updateDocumentState);
		ContentStore[method]('editedBlockChangedForDocumentSection', this.updateDocumentState);
		ContentStore[method]('editedItemChangedForDocumentSection', this.updateDocumentState);
		ContentStore[method]('isShowingSettingsDidChange', this.updateViewingState);
		
		SpecsStore[method]('didLoadContentForSpecWithURL', this.updateDocumentState);
		
		ReorderingStore[method]('focusedBlockDidChange', this.updateDocumentState);
		
		ConfigurationStore[method]('currentDocumentDidChange', this.currentDocumentDidChange);
		
		PreviewStore[method]('didEnterPreview', this.updateViewingState);
		PreviewStore[method]('didExitPreview', this.updateViewingState);
		
		ReorderingStore[method]('didBeginReordering', this.updateViewingState);
		ReorderingStore[method]('didFinishReordering', this.updateViewingState);
	},
	
	componentDidMount() {
		this.listenToStores(true);
		
		document.body.addEventListener('click', this.bodyBackgroundWasClicked);
		document.body.addEventListener('touchend', this.bodyBackgroundWasClicked);
	},
	
	componentWillUnmount() {
		this.listenToStores(false);
		
		document.body.removeEventListener('click', this.bodyBackgroundWasClicked);
		document.body.removeEventListener('touchend', this.bodyBackgroundWasClicked);
	},
	
	bodyBackgroundWasClicked(event) {
		if (event.target === document.body) {
			//console.log('backgroundWasClicked');
			this.finishEditing();
		}
	},
	
	editorBackgroundWasClicked(event) {
		//console.log('editorBackgroundWasClicked');
		this.finishEditing();
	},
	
	finishEditing() {
		let {
			actions
		} = this.state;
		if (actions) {
			actions.finishEditing();
		}
	},
	
	updateState(options = {}) {
		this.setState(function(previousState, props) {
			return latestStateWithPreviousState(
				previousState, options
			);
		});
	},
	
	updateDocumentState() {
		this.updateState({
			updateDocumentState: true
		});
	},
	
	updateViewingState() {
		this.updateState({
			updateViewingState: true
		});
	},
	
	currentDocumentDidChange() {
		this.updateState({
			updateDocumentState: true,
			updateActions: true
		});
	},
	
	shouldComponentUpdate(nextProps, nextState) {
		let currentState = this.state;
		
		if (currentState.documentState != nextState.documentState) {
			return true;
		}
		if (currentState.viewingState != nextState.viewingState) {
			return true;
		}
		if (currentState.actions != nextState.actions) {
			return true;
		}
		
		return false;
	},
	
	render() {
		let {
			documentState,
			viewingState,
			actions
		} = this.state;
		let {
			documentID,
			sectionID,
			specsURLs,
			content,
			specs,
			blockTypeGroups,
			editedBlockIdentifier,
			editedBlockKeyPath,
			editedTextItemIdentifier,
			editedTextItemKeyPath,
			focusedBlockIdentifierForReordering,
			focusedBlockKeyPathForReordering
		} = documentState.toObject();
		
		if (editedBlockKeyPath) {
			editedBlockKeyPath = editedBlockKeyPath.toArray();
		}
		if (editedTextItemKeyPath) {
			editedTextItemKeyPath = editedTextItemKeyPath.toArray();
		}
		if (focusedBlockKeyPathForReordering) {
			focusedBlockKeyPathForReordering = focusedBlockKeyPathForReordering.toArray();
		}
		
		let {
			isShowingSettings,
			isPreviewing,
			isReordering
		} = viewingState.toObject();
		
		var innerElement;
		if (isShowingSettings) {
			innerElement = React.createElement(ContentSettingsElement, {
				key: 'contentSettings',
				documentID,
				specsURLs
			});
		}
		else if (!specs) {
			innerElement = React.createElement('div', {
				key: 'specsLoading',
				className: 'document_loadingSpecs'
			}, 'Loading Specs');
		}
		else if (!content) {
			innerElement = React.createElement('div', {
				key: 'contentLoading',
				className: 'document_loadingContent'
			}, 'Loading Content');
		}
		else if (isPreviewing) {
			innerElement = React.createElement(PreviewElementsCreator.ViewHTMLElement, {
				key: 'preview',
				documentID,
				sectionID,
				content,
				specs,
				actions
			});
		}
		else {
			innerElement = React.createElement(EditorElementsCreator.MainElement, {
				key: 'content',
				contentImmutable: content,
				specsImmutable: specs,
				actions,
				blockTypeGroups,
				editedBlockIdentifier,
				editedBlockKeyPath,
				editedTextItemIdentifier,
				editedTextItemKeyPath,
				isReordering,
				focusedBlockIdentifierForReordering,
				focusedBlockKeyPathForReordering
			});
		}
		
		let children = [];
		
		if (ConfigurationStore.wantsMainToolbar()) {
			children.push(
				React.createElement(Toolbars.MainToolbar, {
					key: 'mainToolbar',
					actions,
					isShowingSettings,
					isPreviewing,
					isReordering
				})
			);
		}
		
		children.push(innerElement);
		
		return React.createElement('div', {
			key: 'editor',
			onClick: this.editorBackgroundWasClicked,
			onTouchEnd: this.editorBackgroundWasClicked
		}, children);
	}
});


let defaultDOMElement = function() {
	return document.getElementById('burntIcingEditor');
};

let EditorController = {
	go(DOMElement = defaultDOMElement()) {
		let documentID = ConfigurationStore.getCurrentDocumentID();
		ContentActions.loadContentForDocumentWithID(documentID);
		
		React.render(
			React.createElement(EditorMain, {
				key: 'editor'
			}),
			DOMElement
		);
		
		window.burntIcing.editor = this;
		
		window.burntIcing.copyContentJSONForCurrentDocumentSection = function() {
			let documentID = ConfigurationStore.getCurrentDocumentID();
			let sectionID = ConfigurationStore.getCurrentDocumentSectionID();
			
			let contentJSON = ContentStore.getContentAsJSONForDocumentSection(documentID, sectionID);
			
			return contentJSON;
		};
		
		window.burntIcing.copyPreviewHTMLForCurrentDocumentSection = function() {
			let documentID = ConfigurationStore.getCurrentDocumentID();
			let sectionID = ConfigurationStore.getCurrentDocumentSectionID();
			// Get content and specs
			let content = ContentStore.getContentForDocumentSection(documentID, sectionID);
			let specs = ContentStore.getSpecsForDocumentSection(documentID, sectionID);
			// Create preview HTML.
			let previewHTML = PreviewElementsCreator.previewHTMLWithContent(content, specs);
			
			return previewHTML;
		};
	},
	
	onDocumentLoad(DOMElement, event) {
		document.removeEventListener('DOMContentLoaded', this.onDocumentLoadBound);
		this.onDocumentLoadBound = null;
		
		this.go(DOMElement);
	},
	
	goOnDocumentLoad(DOMElement = defaultDOMElement()) {
		if (document.readyState === 'loading') {
			this.onDocumentLoadBound = this.onDocumentLoad.bind(this, DOMElement);
			document.addEventListener('DOMContentLoaded', this.onDocumentLoadBound);
		}
		else {
			setTimeout((function() {
				this.go(DOMElement);
			}).bind(this), 0);
		}
	}
};

module.exports = EditorController;