var AppDispatcher = require('../app-dispatcher');
var Immutable = require('immutable');
var MicroEvent = require('microevent');
//var EventMixin = require('./event-mixin');
var ContentActionsEventIDs = require('../actions/actions-content-eventIDs');

var ContentStore = {
	documentSectionContents: Immutable.Map({}),
	documentSectionEditedTextItemIdentifiers: Immutable.Map({}),
	
	setUpDummyContent: function() {
		var dummyContent = require('./dummy-content.json');
		dummyContent = this.prepareContent(dummyContent);
		this.setContentForDocumentSection('dummy', 'main', dummyContent);
	},
	
	newItemIdentifier: function() {
		return 'i-' + Math.random();
	},
	
	newTextItem: function() {
		return Immutable.Map({
			"type": "text",
			"identifier": this.newItemIdentifier(),
			"attributes": Immutable.Map(),
            "text": ""
		});
	},
	
	prepareContent: function(content) {
		var newItemIdentifier = this.newItemIdentifier.bind(this);
		
		return Immutable.fromJS(content, function(key, value) {
			var isIndexed = Immutable.Iterable.isIndexed(value);
			var newValue = isIndexed ? value.toList() : value.toMap();
			
			if ((key === 'blocks') || (key === 'textItems')) {
				newValue = newValue.map(function(textItem) {
					return textItem.set('identifier', newItemIdentifier());
				});
			}
			
			return newValue;
		});
	},
	
	getContentForDocumentSection: function(documentID, sectionID) {
		var content = this.documentSectionContents.getIn([documentID, sectionID]);
		return content;
	},
	
	setContentForDocumentSection: function(documentID, sectionID, content) {
		this.documentSectionContents = this.documentSectionContents.setIn([documentID, sectionID], content);
		
		this.trigger('contentChangedForDocumentSection', documentID, sectionID);
	},
	
	updateBlockAtKeyPathInDocumentSection: function(documentID, sectionID, keyPath, updater) {
		var fullKeyPath = [documentID, sectionID].concat(keyPath);
		this.documentSectionContents = this.documentSectionContents.updateIn(fullKeyPath, updater);
		
		this.trigger('contentChangedForDocumentSection', documentID, sectionID);
	},
	
	updateTextItemAtKeyPathInDocumentSection: function(documentID, sectionID, keyPath, updater) {
		var fullKeyPath = [documentID, sectionID].concat(keyPath);
		this.documentSectionContents = this.documentSectionContents.updateIn(fullKeyPath, updater);
		
		this.trigger('contentChangedForDocumentSection', documentID, sectionID);
	},
	
	textItemIsEmptyAtKeyPathInDocumentSection: function(documentID, sectionID, keyPath) {
		var fullKeyPath = [documentID, sectionID].concat(keyPath).concat('text');
		var text = this.documentSectionContents.getIn(fullKeyPath);
		console.log('text', text, fullKeyPath);
		var isEmpty = (!text || text.length === 0);
		return isEmpty;
	},
	
	removeItemAtKeyPathInDocumentSection: function(documentID, sectionID, keyPath) {
		var itemIndex = keyPath.slice(-1)[0];
		var textItemsKeyPath = keyPath.slice(0, -1);
		var fullKeyPath = [documentID, sectionID].concat(textItemsKeyPath);
		
		this.documentSectionContents = this.documentSectionContents.updateIn(fullKeyPath, function(textItems) {
			return textItems.remove(itemIndex);
		});
	},
	
	insertItemAfterItemAtKeyPathInDocumentSection: function(documentID, sectionID, keyPath, item) {
		var textItemIndex = keyPath.slice(-1)[0];
		var textItemsKeyPath = keyPath.slice(0, -1);
		var fullKeyPath = [documentID, sectionID].concat(textItemsKeyPath);
		
		var newItemIndex = textItemIndex + 1;
		
		this.documentSectionContents = this.documentSectionContents.updateIn(fullKeyPath, function(textItems) {
			/*var textItemsSequence = textItems.toSeq();
			textItemsSequence = textItemsSequence.splice(newItemIndex, 0, item);
			textItems = textItemsSequence.toList();
			return textItems;*/
			return textItems.splice(newItemIndex, 0, item);
		});
		
		var newItemKeyPath = textItemsKeyPath.concat(newItemIndex);
		console.log('EDIT NEW', item.get('identifier'), newItemKeyPath);
		this.editItemWithIdentifierAndKeyPathInDocumentSection(documentID, sectionID, item.get('identifier'), newItemKeyPath);
	},
	
	addNewItemAfterItemAtKeyPathInDocumentSection: function(documentID, sectionID, keyPath) {
		var newTextItem = this.newTextItem();
		this.insertItemAfterItemAtKeyPathInDocumentSection(documentID, sectionID, keyPath, newTextItem);
	},
	
	// private
	getEditedTextItemStateForDocumentSection: function(documentID, sectionID) {
		var state = this.documentSectionEditedTextItemIdentifiers.getIn([documentID, sectionID]);
		return state;
	},
	
	getEditedTextItemIdentifierForDocumentSection: function(documentID, sectionID) {
		var state = this.documentSectionEditedTextItemIdentifiers.getIn([documentID, sectionID]);
		if (state) {
			return state.item.identifier;
		}
		else {
			return null;
		}
	},
	
	getEditedTextItemKeyPathForDocumentSection: function(documentID, sectionID) {
		var state = this.documentSectionEditedTextItemIdentifiers.getIn([documentID, sectionID]);
		if (state) {
			return state.item.keyPath;
		}
		else {
			return null;
		}
	},
	
	endEditingCurrentItemInDocumentSection: function(documentID, sectionID) {
		var keyPath = this.getEditedTextItemKeyPathForDocumentSection(documentID, sectionID);
		if (!keyPath) {
			return;
		}
		
		if (true) {
			var isEmpty = this.textItemIsEmptyAtKeyPathInDocumentSection(documentID, sectionID, keyPath);
			console.log('isEmpty', isEmpty);
			if (isEmpty) {
				this.removeItemAtKeyPathInDocumentSection(documentID, sectionID, keyPath);
			}
		}
		
		this.trigger('editedItemWillEndEditingForDocumentSection', documentID, sectionID);
	},
	
	editItemWithIdentifierAndKeyPathInDocumentSection: function(documentID, sectionID, identifier, keyPath) {
		this.endEditingCurrentItemInDocumentSection(documentID, sectionID);
		
		var state = {
			"item": {
				identifier: identifier,
				keyPath: keyPath
			}
		};
		
		this.documentSectionEditedTextItemIdentifiers = this.documentSectionEditedTextItemIdentifiers.setIn(
			[documentID, sectionID], state
		);
		
		this.trigger('editedItemChangedForDocumentSection', documentID, sectionID);
	},
	
	getDocumentSection: function(documentID, sectionID) {
		return {
			getContent: this.getContentForDocumentSection.bind(this, documentID, sectionID),
			setContent: this.setContentForDocumentSection.bind(this, documentID, sectionID),
			updateBlockAtKeyPath: this.updateBlockAtKeyPathInDocumentSection.bind(this, documentID, sectionID),
			updateTextItemAtKeyPath: this.updateTextItemAtKeyPathInDocumentSection.bind(this, documentID, sectionID),
			getEditedTextItemIdentifier: this.getEditedTextItemIdentifierForDocumentSection.bind(this, documentID, sectionID),
			getEditedTextItemKeyPath: this.getEditedTextItemKeyPathForDocumentSection.bind(this, documentID, sectionID),
			editTextItemWithIdentifierAndKeyPath: this.editItemWithIdentifierAndKeyPathInDocumentSection.bind(this, documentID, sectionID),
			addNewItemAfterItemAtKeyPath: this.addNewItemAfterItemAtKeyPathInDocumentSection.bind(this, documentID, sectionID)
		};
	}
};
//MicroEvent.mixin(ContentStore);
//EventMixin.mixin(ContentStore);
ContentStore.on = MicroEvent.prototype.bind;
ContentStore.trigger = MicroEvent.prototype.trigger;
ContentStore.off = MicroEvent.prototype.unbind;

AppDispatcher.register( function(payload) {
	var documentSectionEventIDs = ContentActionsEventIDs.documentSection;
	
	switch (payload.eventID) {
		
	case (documentSectionEventIDs.setContent):
		ContentStore.setContentForDocumentSection(payload.documentID, payload.sectionID, payload.content)
		break;
	
	case (documentSectionEventIDs.edit.textItemWithIdentifierAndKeyPath):
		ContentStore.editItemWithIdentifierAndKeyPathInDocumentSection(
			payload.documentID,
			payload.sectionID,
			payload.textItemIdentifier,
			payload.textItemKeyPath
		);
		break;
	
	case (documentSectionEventIDs.changeTypeOfBlockAtKeyPath):
		ContentStore.updateBlockAtKeyPathInDocumentSection(payload.documentID, payload.sectionID, payload.blockKeyPath, function(block) {
			return block.set('type', payload.blockType);
		});
		break;
		
	case (documentSectionEventIDs.editedItem.setText):
		var documentID = payload.documentID;
		var sectionID = payload.sectionID;
		var text = payload.textItemText;
		var keyPath = ContentStore.getEditedTextItemKeyPathForDocumentSection(documentID, sectionID);
		ContentStore.updateTextItemAtKeyPathInDocumentSection(documentID, sectionID, keyPath, function(textItem) {
			return textItem.set('text', text);
		});
		break;
	
	case (documentSectionEventIDs.editedItem.changeAttributeValue):
		var documentID = payload.documentID;
		var sectionID = payload.sectionID;
		var keyPath = ContentStore.getEditedTextItemKeyPathForDocumentSection(documentID, sectionID);
		var attributeID = payload.attributeID;
		var defaultValue = payload.defaultValue;
		var newValueFunction = payload.newValueFunction;
		ContentStore.updateTextItemAtKeyPathInDocumentSection(documentID, sectionID, keyPath, function(textItem) {
			return textItem.updateIn(['attributes', attributeID], defaultValue, newValueFunction);
		});
		break;
		
	case (documentSectionEventIDs.editedItem.addNewTextItemAfter):
		var documentID = payload.documentID;
		var sectionID = payload.sectionID;
		var keyPath = ContentStore.getEditedTextItemKeyPathForDocumentSection(documentID, sectionID);
		ContentStore.addNewItemAfterItemAtKeyPathInDocumentSection(documentID, sectionID, keyPath);
		break;
	
	}
	
	return true;
});

ContentStore.setUpDummyContent();

module.exports = ContentStore;