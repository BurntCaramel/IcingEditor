var AppDispatcher = require('../app-dispatcher');
var Immutable = require('immutable');
var MicroEvent = require('microevent');
var ContentActionsEventIDs = require('../actions/actions-content-eventIDs');
var documentSectionEventIDs = ContentActionsEventIDs.documentSection;

var ContentStore = {
	baseConfig: null,
	documentSectionContents: Immutable.Map({}),
	documentSectionEditedTextItemIdentifiers: Immutable.Map({}),
	
	setUpInitialSpecs: function() {
		//var dummyContentJSON = require('../dummy/dummy-content.json');
		//this.setContentFromJSONForDocumentSection('dummy', 'main', dummyContentJSON);
		
		//var dummyContent = this.newContentForTextItems();
		//this.setContentFromImmutableForDocumentSection('dummy', 'main', dummyContent);
		
		var specsJSON = require('../dummy/dummy-content-specs.json');
		this.setBaseConfigFromJSON(specsJSON);
	},
	
	newContentForTextItems: function() {
		return Immutable.Map({
			"type": "textItems",
			"blocks": Immutable.List([
				this.newBlockOfType('body')
			])
		});
	},
	
	newIdentifier: function() {
		return 'i-' + (Math.random().toString().replace('0.', ''));
	},
	
	newTextItem: function(options) {
		var textItem = Immutable.Map({
			"type": "text",
			"identifier": this.newIdentifier(),
			"traits": Immutable.Map(),
            "text": ""
		});
		if (options) {
			textItem = textItem.merge(options);
		}
		
		return textItem;
	},
	
	blockTypeHasTextItems: function(blockType) {
		if (blockType === 'placeholder') {
			return false;
		}
		else {
			return true;
		}
	},
	
	newBlockOfType: function(blockType) {
		var blockJSON = {
			"type": blockType,
			"identifier": this.newIdentifier()
		};
		
		if (this.blockTypeHasTextItems(blockType)) {
			blockJSON.textItems = [];
		}
		
		if (blockType === 'figure') {
			
		}
		
		return Immutable.Map(blockJSON);
	},
	
	blockKeyPathForItemKeyPath: function(itemKeyPath) {
		return itemKeyPath.slice(0, -2);
	},
	
	prepareConfigFromJSON: function(configJSON) {
		return Immutable.fromJS(configJSON);
	},
	
	setBaseConfigFromJSON: function(configJSON) {
		this.baseConfig = this.prepareConfigFromJSON(configJSON);
	},
	
	getConfigForDocumentSection: function(documentID, sectionID) {
		return this.baseConfig;
	},
	
	prepareContentFromJSON: function(contentJSON) {
		var newItemIdentifier = this.newIdentifier.bind(this);
		
		return Immutable.fromJS(contentJSON, function(key, value) {
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
	
	getContentAsJSONForDocumentSection: function(documentID, sectionID) {
		var content = this.getContentForDocumentSection(documentID, sectionID);
		return content.toJS();
	},
	
	setContentFromImmutableForDocumentSection: function(documentID, sectionID, content) {
		this.documentSectionContents = this.documentSectionContents.setIn([documentID, sectionID], content);
		
		this.trigger('contentChangedForDocumentSection', documentID, sectionID);
	},
	
	setContentFromJSONForDocumentSection: function(documentID, sectionID, contentJSON) {
		var content = null;
		if (contentJSON) {
			content = this.prepareContentFromJSON(contentJSON);
		}
		this.setContentFromImmutableForDocumentSection(documentID, sectionID, content);
	},
	
	getContentObjectAtKeyPathForDocumentSection: function(documentID, sectionID, keyPath) {
		return this.documentSectionContents.getIn([documentID, sectionID].concat(keyPath));
	},
	
	updateBlockAtKeyPathInDocumentSection: function(documentID, sectionID, keyPath, updater) {
		var fullKeyPath = [documentID, sectionID].concat(keyPath);
		this.documentSectionContents = this.documentSectionContents.updateIn(fullKeyPath, updater);
		
		this.trigger('contentChangedForDocumentSection', documentID, sectionID);
	},
	
	removeBlockAtKeyPathInDocumentSection: function(documentID, sectionID, keyPath, options) {
		var blockIndex = keyPath.slice(-1)[0];
		var blocksKeyPath = keyPath.slice(0, -1);
		var fullKeyPath = [documentID, sectionID].concat(blocksKeyPath);
		
		console.log('REMOVE', fullKeyPath, blockIndex);
		
		this.documentSectionContents = this.documentSectionContents.updateIn(fullKeyPath, function(blocks) {
			return blocks.remove(blockIndex);
		});
		
		if (options && options.editPrevious) {
			var precedingBlockIndex = blockIndex - 1;
			var precedingBlockKeyPath = blocksKeyPath.concat(precedingBlockIndex);
			this.editBlockWithKeyPathInDocumentSection(documentID, sectionID, precedingBlockKeyPath);
		}
		
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
		var isEmpty = (!text || text.length === 0);
		return isEmpty;
	},
	
	removeTextItemAtKeyPathInDocumentSection: function(documentID, sectionID, keyPath) {
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
			return textItems.splice(newItemIndex, 0, item);
		});
		
		var newItemKeyPath = textItemsKeyPath.concat(newItemIndex);
		this.editItemWithKeyPathInDocumentSection(documentID, sectionID, newItemKeyPath);
	},
	
	addNewItemAfterItemAtKeyPathInDocumentSection: function(documentID, sectionID, keyPath) {
		var newTextItem = this.newTextItem();
		this.insertItemAfterItemAtKeyPathInDocumentSection(documentID, sectionID, keyPath, newTextItem);
	},
	
	insertBlockAfterBlockAtKeyPathInDocumentSection: function(documentID, sectionID, blockKeyPath, block, options) {
		var blockIndex = blockKeyPath.slice(-1)[0];
		var blocksKeyPath = blockKeyPath.slice(0, -1);
		var fullKeyPath = [documentID, sectionID].concat(blocksKeyPath);
		
		var newBlockIndex = blockIndex + 1;
		
		this.documentSectionContents = this.documentSectionContents.updateIn(fullKeyPath, function(blocks) {
			return blocks.splice(newBlockIndex, 0, block);
		});
		
		var newBlockKeyPath = blocksKeyPath.concat(newBlockIndex);
		if (options && options.edit) {
			if (this.blockTypeHasTextItems(block.get('type')) && block.get('textItems').count() > 0) {
				var itemKeyPath = newBlockKeyPath.concat('textItems', 0);
				this.editItemWithKeyPathInDocumentSection(documentID, sectionID, itemKeyPath);
			}
			else {
				this.editBlockWithKeyPathInDocumentSection(documentID, sectionID, newBlockKeyPath);
			}
		}
	},
	
	insertRelatedBlockAfterBlockAtKeyPathInDocumentSection: function(documentID, sectionID, blockKeyPath, options) {
		var currentBlock = this.getContentObjectAtKeyPathForDocumentSection(documentID, sectionID, blockKeyPath);
		var blockType = currentBlock.get('type');
		
		var followingBlock = this.newBlockOfType(blockType);
		
		this.insertBlockAfterBlockAtKeyPathInDocumentSection(documentID, sectionID, blockKeyPath, followingBlock, options);
	},
	
	splitBlockBeforeItemAtKeyPathInDocumentSection: function(documentID, sectionID, itemKeyPath) {
		var blockKeyPath = this.blockKeyPathForItemKeyPath(itemKeyPath);
		var currentBlock = this.getContentObjectAtKeyPathForDocumentSection(documentID, sectionID, blockKeyPath);
		var blockType = currentBlock.get('type');
		
		var textItemIndex = itemKeyPath.slice(-1)[0];
		
		var followingItems = [];
		this.updateBlockAtKeyPathInDocumentSection(documentID, sectionID, blockKeyPath, function(block) {
			var textItems = block.get('textItems');
			var precedingItems = textItems.slice(0, textItemIndex);
			followingItems = textItems.slice(textItemIndex);
			
			block = block.set('textItems', precedingItems);
			return block;
		});
		
		var followingBlock = this.newBlockOfType(blockType);
		followingBlock = followingBlock.set('textItems', followingItems);
		
		this.insertBlockAfterBlockAtKeyPathInDocumentSection(documentID, sectionID, blockKeyPath, followingBlock, {edit: true});
	},
	
	joinBlockAtKeyPathWithPreviousInDocumentSection: function(documentID, sectionID, currentBlockKeyPath) {
		var currentBlockIndex = currentBlockKeyPath.slice(-1)[0];
		var currentBlock = this.getContentObjectAtKeyPathForDocumentSection(documentID, sectionID, currentBlockKeyPath);
		var currentBlockType = currentBlock.get('type');
		
		if (currentBlockIndex === 0 || !this.blockTypeHasTextItems(currentBlockType)) {
			return false;
		}
		
		var precedingBlockIndex = currentBlockIndex - 1;
		var precedingBlockKeyPath = currentBlockKeyPath.slice(0, -1).concat(precedingBlockIndex);
		var precedingBlock = this.getContentObjectAtKeyPathForDocumentSection(documentID, sectionID, precedingBlockKeyPath);
		var precedingBlockType = precedingBlock.get('type');
		
		if (!this.blockTypeHasTextItems(precedingBlockType)) {
			return false;
		}
		
		var followingTextItems = currentBlock.get('textItems');
		var precedingTextItems = precedingBlock.get('textItems');
		
		this.updateBlockAtKeyPathInDocumentSection(documentID, sectionID, precedingBlockKeyPath, function(block) {
			return block.update('textItems', function(textItems) {
				return textItems.concat(followingTextItems);
			});
		});
		
		this.removeBlockAtKeyPathInDocumentSection(documentID, sectionID, currentBlockKeyPath);
		
		var itemKeyPath = precedingBlockKeyPath.concat('textItems', precedingTextItems.count());
		this.editItemWithKeyPathInDocumentSection(documentID, sectionID, itemKeyPath);
	},
	
	joinItemAtKeyPathWithPreviousInDocumentSection: function(documentID, sectionID, itemKeyPath) {
		var itemIndex = itemKeyPath.slice(-1)[0];
		if (itemIndex === 0) {
			var blockKeyPath = this.blockKeyPathForItemKeyPath(itemKeyPath);
			this.joinBlockAtKeyPathWithPreviousInDocumentSection(documentID, sectionID, blockKeyPath);
		}
		else {
			var precedingItemIndex = itemIndex - 1;
			var precedingItemKeyPath = itemKeyPath.slice(0, -1).concat(precedingItemIndex);
			var precedingItem = this.getContentObjectAtKeyPathForDocumentSection(documentID, sectionID, precedingItemKeyPath);
			var followingItem = this.getContentObjectAtKeyPathForDocumentSection(documentID, sectionID, itemKeyPath);
			
			var precedingText = precedingItem.get('text');
			var followingText = followingItem.get('text');
			var combinedText = precedingText + followingText;
			this.updateTextItemAtKeyPathInDocumentSection(documentID, sectionID, precedingItemKeyPath, function(textItem) {
				return textItem.set('text', combinedText);
			});
			
			this.removeTextItemAtKeyPathInDocumentSection(documentID, sectionID, itemKeyPath);
			this.editItemWithKeyPathInDocumentSection(documentID, sectionID, precedingItemKeyPath);
		}
	},
	
	splitTextInRangeOfItemAtKeyPathInDocumentSection: function(documentID, sectionID, textSplitRange, itemKeyPath) {
		var splitStart = textSplitRange.start;
		var splitEnd = textSplitRange.end;
		
		var currentItem = this.getContentObjectAtKeyPathForDocumentSection(documentID, sectionID, itemKeyPath);
		var currentText = currentItem.get('text');
		var currentItemIndex = itemKeyPath.slice(-1)[0]; // Last item
		var textItemsKeyPath = itemKeyPath.slice(0, -1); // Everything except last item
		
		// Just a caret
		if (splitStart === splitEnd) {
			var itemAText = currentText.slice(0, splitStart)
			var itemBText = currentText.slice(splitStart);
			console.log('split 2', [itemAText, itemBText]);
			
			this.updateTextItemAtKeyPathInDocumentSection(documentID, sectionID, itemKeyPath, function(textItem) {
				return textItem.set('text', itemAText);
			});
			
			var itemB = this.newTextItem({"text": itemBText});
			//var itemBIndex = currentItemIndex + 1;
			//var itemBKeyPath = textItemsKeyPath.concat(itemBIndex);
			this.insertItemAfterItemAtKeyPathInDocumentSection(documentID, sectionID, itemKeyPath, itemB);
		}
		// Actual selection range
		else {
			var itemAText = currentText.slice(0, splitStart)
			var itemBText = currentText.slice(splitStart, splitEnd);
			var itemCText = currentText.slice(splitEnd);
			console.log('split 3', [itemAText, itemBText, itemCText]);
			
			this.updateTextItemAtKeyPathInDocumentSection(documentID, sectionID, itemKeyPath, function(textItem) {
				return textItem.set('text', itemAText);
			});
			
			var itemB = this.newTextItem({"text": itemBText});
			var itemC = this.newTextItem({"text": itemCText});
			
			// Insert itemC then itemB, so that itemB is in front of itemC
			this.insertItemAfterItemAtKeyPathInDocumentSection(documentID, sectionID, itemKeyPath, itemC);
			this.insertItemAfterItemAtKeyPathInDocumentSection(documentID, sectionID, itemKeyPath, itemB);
		}
		
		/*
		this.updateTextItemAtKeyPathInDocumentSection(documentID, sectionID, itemKeyPath, function(textItem) {
			return textItem.set('text', combinedText);
		});
		*/
	},
	
	getEditedBlockIdentifierForDocumentSection: function(documentID, sectionID) {
		return this.documentSectionEditedTextItemIdentifiers.getIn([documentID, sectionID, "block", "identifier"], null);
	},
	
	getEditedBlockKeyPathForDocumentSection: function(documentID, sectionID) {
		var keyPath = this.documentSectionEditedTextItemIdentifiers.getIn([documentID, sectionID, "block", "keyPath"], null);
		if (keyPath) {
			keyPath = keyPath.toJS();
		}
		return keyPath;
	},
	
	getEditedTextItemIdentifierForDocumentSection: function(documentID, sectionID) {
		return this.documentSectionEditedTextItemIdentifiers.getIn([documentID, sectionID, "item", "identifier"], null);
	},
	
	getEditedTextItemKeyPathForDocumentSection: function(documentID, sectionID) {
		var keyPath = this.documentSectionEditedTextItemIdentifiers.getIn([documentID, sectionID, "item", "keyPath"], null);
		if (keyPath) {
			keyPath = keyPath.toJS();
		}
		return keyPath;
	},
	
	editingWillEndInDocumentSection: function(documentID, sectionID) {
		var keyPath = this.getEditedTextItemKeyPathForDocumentSection(documentID, sectionID);
		if (!keyPath) {
			return;
		}
		
		if (true) {
			var isEmpty = this.textItemIsEmptyAtKeyPathInDocumentSection(documentID, sectionID, keyPath);
			if (isEmpty) {
				this.removeTextItemAtKeyPathInDocumentSection(documentID, sectionID, keyPath);
			}
		}
		
		this.trigger('editedItemWillEndEditingForDocumentSection', documentID, sectionID);
	},
	
	editBlockWithKeyPathInDocumentSection: function(documentID, sectionID, blockKeyPath) {
		this.editingWillEndInDocumentSection(documentID, sectionID);
		
		var blockIdentifier = this.getContentObjectAtKeyPathForDocumentSection(documentID, sectionID, blockKeyPath.concat('identifier'));
		var state = Immutable.fromJS({
			"block": {
				keyPath: blockKeyPath,
				identifier: blockIdentifier
			}
		});
		
		this.documentSectionEditedTextItemIdentifiers = this.documentSectionEditedTextItemIdentifiers.setIn(
			[documentID, sectionID], state
		);
		
		this.trigger('editedBlockChangedForDocumentSection', documentID, sectionID);
	},
	
	editItemWithKeyPathInDocumentSection: function(documentID, sectionID, itemKeyPath) {
		this.editingWillEndInDocumentSection(documentID, sectionID);
		
		var blockKeyPath = this.blockKeyPathForItemKeyPath(itemKeyPath);
		var blockIdentifier = this.getContentObjectAtKeyPathForDocumentSection(documentID, sectionID, blockKeyPath.concat('identifier'));
		
		var itemIdentifier = this.getContentObjectAtKeyPathForDocumentSection(documentID, sectionID, itemKeyPath.concat('identifier'));
		
		var state = Immutable.fromJS({
			"block": {
				keyPath: blockKeyPath,
				identifier: blockIdentifier
			},
			"item": {
				keyPath: itemKeyPath,
				identifier: itemIdentifier
			}
		});
		
		this.documentSectionEditedTextItemIdentifiers = this.documentSectionEditedTextItemIdentifiers.setIn(
			[documentID, sectionID], state
		);
		
		this.trigger('editedBlockChangedForDocumentSection', documentID, sectionID);
		this.trigger('editedItemChangedForDocumentSection', documentID, sectionID);
	},
	
	finishEditingInDocumentSection: function(documentID, sectionID) {
		this.editingWillEndInDocumentSection(documentID, sectionID);
		
		this.documentSectionEditedTextItemIdentifiers = this.documentSectionEditedTextItemIdentifiers.removeIn(
			[documentID, sectionID]
		);
		
		this.trigger('editedBlockChangedForDocumentSection', documentID, sectionID);
		this.trigger('editedItemChangedForDocumentSection', documentID, sectionID);
	},
	
	registerSelectedTextRangeFunctionForEditedItemInDocumentSection: function(documentID, sectionID, selectedTextRangeFunction) {
		this.documentSectionEditedTextItemIdentifiers = this.documentSectionEditedTextItemIdentifiers.setIn(
			[documentID, sectionID, "item", "selectedTextRangeFunction"], selectedTextRangeFunction
		);
	},
	
	unregisterSelectedTextRangeFunctionForEditedItemInDocumentSection: function(documentID, sectionID) {
		this.documentSectionEditedTextItemIdentifiers = this.documentSectionEditedTextItemIdentifiers.deleteIn(
			[documentID, sectionID, "item", "selectedTextRangeFunction"]
		);
	},
	
	getSelectedTextRangeForEditedItemInDocumentSection: function(documentID, sectionID, selectedTextRange) {
		var selectedTextRangeFunction = this.documentSectionEditedTextItemIdentifiers.getIn(
			[documentID, sectionID, "item", "selectedTextRangeFunction"], null
		);
		if (selectedTextRangeFunction) {
			var selectedTextRange = selectedTextRangeFunction();
			console.log('selectedTextRange', selectedTextRange);
			return selectedTextRange;
		}
		
		return null;
	},
	
	setSelectedTextRangeForEditedItemInDocumentSection: function(documentID, sectionID, selectedTextRange) {
		this.documentSectionEditedTextItemIdentifiers = this.documentSectionEditedTextItemIdentifiers.setIn(
			[documentID, sectionID, "item", "selectedTextRange"], selectedTextRange
		);
	},
	
	editPreviousItemInDocumentSection: function(documentID, sectionID) {
		var itemKeyPath = this.getEditedTextItemKeyPathForDocumentSection(documentID, sectionID);
		var itemIndex = itemKeyPath.slice(-1)[0];
		if (itemIndex === 0) {
			return false;
		}
		
		var previousItemKeyPath = itemKeyPath.slice(0, -1).concat(itemIndex - 1);
		this.editItemWithKeyPathInDocumentSection(documentID, sectionID, previousItemKeyPath);
	},
	
	editNextItemInDocumentSection: function(documentID, sectionID) {
		var itemKeyPath = this.getEditedTextItemKeyPathForDocumentSection(documentID, sectionID);
		var itemIndex = itemKeyPath.slice(-1)[0];
		
		var blockKeyPath = this.blockKeyPathForItemKeyPath(itemKeyPath);
		var textItemsKeyPath = blockKeyPath.concat('textItems');
		var textItems = this.getContentObjectAtKeyPathForDocumentSection(documentID, sectionID, textItemsKeyPath);
		var itemCount = textItems.count();
		
		if (itemIndex === (itemCount - 1)) {
			return false;
		}
		
		var nextItemKeyPath = itemKeyPath.slice(0, -1).concat(itemIndex + 1);
		this.editItemWithKeyPathInDocumentSection(documentID, sectionID, nextItemKeyPath);
	},
	
	getDocumentSection: function(documentID, sectionID) {
		return {
			getContent: this.getContentForDocumentSection.bind(this, documentID, sectionID),
			setContentFromJSON: this.setContentFromJSONForDocumentSection.bind(this, documentID, sectionID),
			updateBlockAtKeyPath: this.updateBlockAtKeyPathInDocumentSection.bind(this, documentID, sectionID),
			updateTextItemAtKeyPath: this.updateTextItemAtKeyPathInDocumentSection.bind(this, documentID, sectionID),
			getEditedBlockIdentifier: this.getEditedBlockIdentifierForDocumentSection.bind(this, documentID, sectionID),
			getEditedBlockKeyPath: this.getEditedBlockKeyPathForDocumentSection.bind(this, documentID, sectionID),
			getEditedTextItemIdentifier: this.getEditedTextItemIdentifierForDocumentSection.bind(this, documentID, sectionID),
			getEditedTextItemKeyPath: this.getEditedTextItemKeyPathForDocumentSection.bind(this, documentID, sectionID),
			editTextItemWithIdentifierAndKeyPath: this.editItemWithKeyPathInDocumentSection.bind(this, documentID, sectionID),
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
	var documentID = null;
	var sectionID = null;
	var editedBlockKeyPath = null;
	var editedTextItemKeyPath = null;
	if (payload.documentID) {
		documentID = payload.documentID;
		if (payload.sectionID) {
			sectionID = payload.sectionID;
			editedBlockKeyPath = ContentStore.getEditedBlockKeyPathForDocumentSection(documentID, sectionID);
			editedTextItemKeyPath = ContentStore.getEditedTextItemKeyPathForDocumentSection(documentID, sectionID);
		}
	}
	
	switch (payload.eventID) {
		
	case (documentSectionEventIDs.setContent):
		ContentStore.setContentFromJSONForDocumentSection(
			documentID,
			sectionID,
			payload.content
		);
		break;
	
	case (documentSectionEventIDs.edit.textItemWithKeyPath):
		ContentStore.editItemWithKeyPathInDocumentSection(
			documentID,
			sectionID,
			payload.textItemKeyPath
		);
		break;
	
	case (documentSectionEventIDs.edit.blockWithKeyPath):
		ContentStore.editBlockWithKeyPathInDocumentSection(
			documentID,
			sectionID,
			payload.blockKeyPath
		);
		break;
	
	case (documentSectionEventIDs.finishEditing):
		ContentStore.finishEditingInDocumentSection(documentID, sectionID);
		break;
	
	case (documentSectionEventIDs.blockAtKeyPath.changeType):
		var newBlockType = payload.blockType;
		ContentStore.updateBlockAtKeyPathInDocumentSection(documentID, sectionID, payload.blockKeyPath, function(block) {
			block = block.set('type', newBlockType);
			if (newBlockType === 'placeholder') {
				block = block.remove('textItems');
			}
			return block;
		});
		break;
		
	case (documentSectionEventIDs.blockAtKeyPath.remove):
		ContentStore.removeBlockAtKeyPathInDocumentSection(documentID, sectionID, payload.blockKeyPath);
		break;
	
	case (documentSectionEventIDs.blockAtKeyPath.changePlaceholderID):
		ContentStore.updateBlockAtKeyPathInDocumentSection(documentID, sectionID, payload.blockKeyPath, function(block) {
			return block.set('placeholderID', payload.placeholderID);
		});
		break;
	
	case (documentSectionEventIDs.blockAtKeyPath.insertRelatedBlockAfter):
		ContentStore.insertRelatedBlockAfterBlockAtKeyPathInDocumentSection(documentID, sectionID, payload.keyPath);
		break;
	
	case (documentSectionEventIDs.editedBlock.remove):
		ContentStore.removeBlockAtKeyPathInDocumentSection(documentID, sectionID, editedBlockKeyPath, {editPrevious: true});
		break;
	
	case (documentSectionEventIDs.editedBlock.insertRelatedBlockAfter):
		ContentStore.insertRelatedBlockAfterBlockAtKeyPathInDocumentSection(documentID, sectionID, editedBlockKeyPath, {edit: true});
		break;
		
	case (documentSectionEventIDs.editedItem.remove):
		ContentStore.removeTextItemAtKeyPathInDocumentSection(documentID, sectionID, editedTextItemKeyPath, {editPrevious: true});
		break;
		
	case (documentSectionEventIDs.editedItem.setText):
		var text = payload.textItemText;
		ContentStore.updateTextItemAtKeyPathInDocumentSection(documentID, sectionID, editedTextItemKeyPath, function(textItem) {
			return textItem.set('text', text);
		});
		break;
	
	case (documentSectionEventIDs.editedItem.changeTraitValue):
		var attributeID = payload.attributeID;
		var defaultValue = payload.defaultValue;
		var newValueFunction = payload.newValueFunction;
		ContentStore.updateTextItemAtKeyPathInDocumentSection(documentID, sectionID, editedTextItemKeyPath, function(textItem) {
			return textItem.updateIn(['traits', attributeID], defaultValue, newValueFunction);
		});
		break;
	
	case (documentSectionEventIDs.editedItem.editPreviousItem):
		ContentStore.editPreviousItemInDocumentSection(documentID, sectionID);
		break;
	
	case (documentSectionEventIDs.editedItem.editNextItem):
		ContentStore.editNextItemInDocumentSection(documentID, sectionID);
		break;
	
	case (documentSectionEventIDs.editedItem.addNewTextItemAfter):
		ContentStore.addNewItemAfterItemAtKeyPathInDocumentSection(documentID, sectionID, editedTextItemKeyPath);
		break;
	
	case (documentSectionEventIDs.editedItem.splitBlockBefore):
		ContentStore.splitBlockBeforeItemAtKeyPathInDocumentSection(documentID, sectionID, editedTextItemKeyPath);
		break;
	
	case (documentSectionEventIDs.editedItem.joinWithPreviousItem):
		ContentStore.joinItemAtKeyPathWithPreviousInDocumentSection(documentID, sectionID, editedTextItemKeyPath);
		break;
	
	case (documentSectionEventIDs.editedItem.remove):
		ContentStore.joinItemAtKeyPathWithPreviousInDocumentSection(documentID, sectionID, editedTextItemKeyPath);
		break;
	
	case (documentSectionEventIDs.editedItem.splitTextInRange):
		ContentStore.splitTextInRangeOfItemAtKeyPathInDocumentSection(documentID, sectionID, payload.textRange, editedTextItemKeyPath);
		break;
	
	}
	
	return true;
});

ContentStore.setUpInitialSpecs();

module.exports = ContentStore;