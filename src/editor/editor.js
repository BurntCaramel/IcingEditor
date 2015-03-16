var React = require('react');
var Immutable = require('immutable');
//let PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var ContentStore = require('../stores/store-content.js');
var SettingsStore = require('../stores/store-settings.js');
var ContentStoreSaving = require('../stores/store-content-saving.js');
var ContentStoreLoading = require('../stores/store-content-loading.js');
var ContentActions = require('../actions/actions-content.js');
var EditorElementsCreator = require('./editor-elements');
var PreviewElementsCreator = require('../preview/preview-elements');
var Toolbars = require('./editor-toolbars');
var PreviewStore = require('../stores/store-preview');
var ReorderingStore = require('../stores/ReorderingStore');



let getInitialState = function() {
	let documentID = SettingsStore.getCurrentDocumentID();
	let sectionID = SettingsStore.getCurrentDocumentSectionID();
	
	let state = {
		documentState: new Immutable.Map({
			documentID,
			sectionID,
			content: ContentStore.getContentForDocumentSection(documentID, sectionID),
			specs: ContentStore.getSpecsForDocumentSection(documentID, sectionID)
		})
	};
}

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
	
	let documentID = SettingsStore.getCurrentDocumentID();
	let sectionID = SettingsStore.getCurrentDocumentSectionID();
	
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
			content: ContentStore.getContentForDocumentSection(documentID, sectionID),
			specs: ContentStore.getSpecsForDocumentSection(documentID, sectionID),
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


var Editor = React.createClass({
	getInitialState() {
		return latestStateWithPreviousState(null, {
			updateAll: true
		});
	},
	
	listenToStores(on) {
		let method = on ? 'on' : 'off';
		
		ContentStore[method]('contentChangedForDocumentSection', this.updateDocumentState);
		ContentStore[method]('editedBlockChangedForDocumentSection', this.updateDocumentState);
		ContentStore[method]('editedItemChangedForDocumentSection', this.updateDocumentState);
		ReorderingStore[method]('focusedBlockDidChange', this.updateDocumentState);
		
		SettingsStore[method]('currentDocumentDidChange', this.currentDocumentDidChange);
		
		PreviewStore[method]('didEnterPreview', this.updateViewingState);
		PreviewStore[method]('didExitPreview', this.updateViewingState);
		
		ReorderingStore[method]('didBeginReordering', this.updateViewingState);
		ReorderingStore[method]('didFinishReordering', this.updateViewingState);
	},
	
	componentDidMount() {
		this.listenToStores(true);
		
		document.body.addEventListener('click', this.bodyBackgroundWasClicked);
	},
	
	componentWillUnmount() {
		this.listenToStores(false);
		
		document.body.removeEventListener('click', this.bodyBackgroundWasClicked);
	},
	
	bodyBackgroundWasClicked(event) {
		if (event.target === document.body) {
			console.log('backgroundWasClicked');
			this.finishEditing();
		}
	},
	
	editorBackgroundWasClicked(event) {
		console.log('editorBackgroundWasClicked');
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
			content,
			specs,
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
			isPreviewing,
			isReordering
		} = viewingState.toObject();
		
		var innerElement;
		if (isPreviewing) {
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
		
		if (SettingsStore.wantsMainToolbar()) {
			children.push(
				React.createElement(Toolbars.MainToolbar, {
					key: 'mainToolbar',
					actions
				})
			);
		}
		
		children.push(innerElement);
		
		return React.createElement('div', {
			key: 'editor',
			onClick: this.editorBackgroundWasClicked
		}, children);
	}
});


let EditorController = {
	go() {
		let documentID = SettingsStore.getCurrentDocumentID();
		ContentStoreLoading.loadContentForDocument(documentID);
		
		React.render(
			React.createElement(Editor, {
				key: 'editor'
			}),
			document.getElementById('burntIcingEditor')
		);
		
		window.burntIcing.editor = this;
		
		window.burntIcing.copyContentJSONForCurrentDocumentSection = function() {
			let documentID = SettingsStore.getCurrentDocumentID();
			let sectionID = SettingsStore.getCurrentDocumentSectionID();
			
			let contentJSON = ContentStore.getContentAsJSONForDocumentSection(documentID, sectionID);
			
			return contentJSON;
		};
		
		window.burntIcing.copyPreviewHTMLForCurrentDocumentSection = function() {
			let documentID = SettingsStore.getCurrentDocumentID();
			let sectionID = SettingsStore.getCurrentDocumentSectionID();
			// Get content and specs
			let content = ContentStore.getContentForDocumentSection(documentID, sectionID);
			let specs = ContentStore.getSpecsForDocumentSection(documentID, sectionID);
			// Create preview HTML.
			let previewHTML = PreviewElementsCreator.previewHTMLWithContent(content, specs);
			
			return previewHTML;
		};
	},
	
	onDocumentLoad(event) {
		document.removeEventListener('DOMContentLoaded', this.onDocumentLoadBound);
		this.onDocumentLoadBound = null;
		
		this.go();
	},
	
	goOnDocumentLoad() {
		if (document.readyState === 'loading') {
			this.onDocumentLoadBound = this.onDocumentLoad.bind(this);
			document.addEventListener('DOMContentLoaded', this.onDocumentLoadBound);
		}
		else {
			setTimeout((function() {
				this.go();
			}).bind(this), 0);
		}
	}
};

module.exports = EditorController;