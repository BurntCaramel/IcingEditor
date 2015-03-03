var AppDispatcher = require('../app-dispatcher');
var ContentStore = require('../stores/store-content');
var Immutable = require('immutable');

var eventIDs = require('./actions-content-eventIDs');
var documentSectionEventIDs = eventIDs.documentSection;

var ActionsContent = {
	getActionsForDocumentSection: function(documentID, sectionID) {
		var documentSectionStore = ContentStore.getDocumentSection(documentID, sectionID);
		
		function dispatchForDocumentSection(payload) {
			payload.documentID = documentID;
			payload.sectionID = sectionID;
			
			AppDispatcher.dispatch(payload);
		};
		
		return {
			setContent: function(content) {
				dispatchForDocumentSection({
					eventID: documentSectionEventIDs.setContent,
					content: content
				});
			},
			
			saveChanges: function() {
				dispatchForDocumentSection({
					eventID: documentSectionEventIDs.saveChanges
				});
			},
			
			enterHTMLPreview: function() {
				dispatchForDocumentSection({
					eventID: documentSectionEventIDs.enterHTMLPreview
				});
			},
			
			exitHTMLPreview: function() {
				dispatchForDocumentSection({
					eventID: documentSectionEventIDs.exitHTMLPreview
				});
			},
			
			getEditedBlockIdentifier: function() {
				return documentSectionStore.getEditedBlockIdentifier();
			},
			
			getEditedTextItemIdentifier: function() {
				return ContentStore.getEditedTextItemIdentifierForDocumentSection(documentID, sectionID);
			},
			
			getEditedTextItemKeyPath: function() {
				return ContentStore.getEditedTextItemKeyPathForDocumentSection(documentID, sectionID);
			},
			
			editBlockWithKeyPath: function(blockKeyPath) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.edit.blockWithKeyPath,
					documentID: documentID,
					sectionID: sectionID,
					blockKeyPath: blockKeyPath
				});
			},
			
			editTextItemWithKeyPath: function(textItemKeyPath) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.edit.textItemWithKeyPath,
					documentID: documentID,
					sectionID: sectionID,
					textItemKeyPath: textItemKeyPath
				});
			},
			
			editTextItemBasedBlockWithKeyPathAddingIfNeeded: function(blockKeyPath) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.edit.textItemBasedBlockWithKeyPathAddingIfNeeded,
					documentID: documentID,
					sectionID: sectionID,
					blockKeyPath: blockKeyPath
				});
			},
			
			finishEditing: function() {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.finishEditing,
					documentID: documentID,
					sectionID: sectionID
				});
			},
			
			insertSubsectionOfTypeAtBlockIndex: function(subsectionType, blockIndex) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.blocks.insertSubsectionOfTypeAtIndex,
					documentID: documentID,
					sectionID: sectionID,
					subsectionType: subsectionType,
					blockIndex: blockIndex
				})
			},
			
			changeTypeOfSubsectionAtKeyPath: function(subsectionKeyPath, subsectionType) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.subsectionAtKeyPath.changeType,
					documentID: documentID,
					sectionID: sectionID,
					subsectionKeyPath: subsectionKeyPath,
					subsectionType: subsectionType
				});
			},
			
			changeTypeOfBlockAtKeyPath: function(typeGroup, type, keyPath) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.blockAtKeyPath.changeType,
					documentID: documentID,
					sectionID: sectionID,
					blockKeyPath: keyPath,
					blockTypeGroup: typeGroup,
					blockType: type
				});
			},
			
			removeBlockAtKeyPath: function(keyPath) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.blockAtKeyPath.remove,
					documentID: documentID,
					sectionID: sectionID,
					blockKeyPath: keyPath
				});
			},
			
			insertRelatedBlockAfterBlockAtKeyPath: function(keyPath) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.blockAtKeyPath.insertRelatedBlockAfter,
					documentID: documentID,
					sectionID: sectionID,
					blockKeyPath: keyPath
				});
			},
			
			removeEditedBlock: function() {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedBlock.remove,
					documentID: documentID,
					sectionID: sectionID
				});
			},
			
			insertRelatedBlockAfterEditedBlock: function() {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedBlock.insertRelatedBlockAfter,
					documentID: documentID,
					sectionID: sectionID
				});
			},
			
			updateValueForBlockAtKeyPath: function(keyPath, defaultValue, newValueFunction)
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.blockAtKeyPath.changeValue,
					documentID: documentID,
					sectionID: sectionID,
					blockKeyPath: keyPath,
					defaultValue: defaultValue,
					newValueFunction: newValueFunction
				});
			},
			
			changePlaceholderIDOfBlockAtKeyPath: function(placeholderID, keyPath) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.blockAtKeyPath.changePlaceholderID,
					documentID: documentID,
					sectionID: sectionID,
					blockKeyPath: keyPath,
					placeholderID: placeholderID
				});
			},
			
			changeTraitUsingFunctionForEditedBlock: function(traitID, defaultValue, newValueFunction)
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedBlock.changeTraitValue,
					documentID: documentID,
					sectionID: sectionID,
					traitID: traitID,
					defaultValue: defaultValue,
					newValueFunction: newValueFunction
				});
			},
			
			toggleBooleanTraitForEditedBlock: function(traitID)
			{
				this.changeTraitUsingFunctionForEditedBlock(traitID, false, function(valueBefore) {
					return !valueBefore;
				});
			},
			
			changeMapTraitUsingFunctionForEditedBlock: function(traitID, changeFunction)
			{
				this.changeTraitUsingFunctionForEditedBlock(traitID, Immutable.Map(), changeFunction);
			},
			
			removeTraitWithIDForEditedBlock: function(traitID)
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedBlock.removeTrait,
					documentID: documentID,
					sectionID: sectionID,
					traitID: traitID
				});
			},
			
			removeEditedTextItem: function() {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.remove,
					documentID: documentID,
					sectionID: sectionID
				});
			},
			
			setTextForEditedTextItem: function(text) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.setText,
					documentID: documentID,
					sectionID: sectionID,
					textItemText: text
				});
			},
			
			changeTraitUsingFunctionForEditedTextItem: function(traitID, defaultValue, newValueFunction)
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.changeTraitValue,
					documentID: documentID,
					sectionID: sectionID,
					traitID: traitID,
					defaultValue: defaultValue,
					newValueFunction: newValueFunction
				});
			},
			
			toggleBooleanTraitForEditedTextItem: function(traitID)
			{
				this.changeTraitUsingFunctionForEditedTextItem(traitID, false, function(valueBefore) {
					return !valueBefore;
				});
			},
			
			changeMapTraitUsingFunctionForEditedTextItem: function(traitID, changeFunction)
			{
				this.changeTraitUsingFunctionForEditedTextItem(traitID, Immutable.Map(), changeFunction);
			},
			
			removeTraitWithIDForEditedTextItem: function(traitID)
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.removeTrait,
					documentID: documentID,
					sectionID: sectionID,
					traitID: traitID
				});
			},
			
			editPreviousItemBeforeEditedTextItem: function()
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.editPreviousItem,
					documentID: documentID,
					sectionID: sectionID
				});
			},
			
			editNextItemAfterEditedTextItem: function()
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.editNextItem,
					documentID: documentID,
					sectionID: sectionID
				});
			},
			
			addNewTextItemAfterEditedTextItem: function()
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.addNewTextItemAfter,
					documentID: documentID,
					sectionID: sectionID
				});
			},
			
			addLineBreakAfterEditedTextItem: function()
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.addLineBreakAfter,
					documentID: documentID,
					sectionID: sectionID
				});
			},
			
			splitBlockBeforeEditedTextItem: function()
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.splitBlockBefore,
					documentID: documentID,
					sectionID: sectionID
				});
			},
			
			joinEditedTextItemWithPreviousItem: function()
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.joinWithPreviousItem,
					documentID: documentID,
					sectionID: sectionID
				});
			},
			
			splitTextInRangeOfEditedTextItem: function(textRange)
			{	
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.splitTextInRange,
					documentID: documentID,
					sectionID: sectionID,
					textRange: textRange
				});
			},
			
			registerSelectedTextRangeFunctionForEditedItem: function(selectedTextRangeFunction)
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.registerSelectedTextRangeFunction,
					documentID: documentID,
					sectionID: sectionID,
					selectedTextRangeFunction: selectedTextRangeFunction
				});
			},
			
			unregisterSelectedTextRangeFunctionForEditedItem: function()
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.unregisterSelectedTextRangeFunction,
					documentID: documentID,
					sectionID: sectionID,
				});
			}
		};
	}
};

module.exports = ActionsContent;