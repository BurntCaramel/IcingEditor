var AppDispatcher = require('../app-dispatcher');
var ContentStore = require('../stores/store-content');
var Immutable = require('immutable');

var eventIDs = require('./actions-content-eventIDs');
var documentSectionEventIDs = eventIDs.documentSection;

var ActionsContent = {
	getActionsForDocumentSection(documentID, sectionID) {
		var documentSectionStore = ContentStore.getDocumentSection(documentID, sectionID);
		
		function dispatchForDocumentSection(payload) {
			payload.documentID = documentID;
			payload.sectionID = sectionID;
			
			AppDispatcher.dispatch(payload);
		};
		
		return {
			setContent(content) {
				dispatchForDocumentSection({
					eventID: documentSectionEventIDs.setContent,
					content
				});
			},
			
			saveChanges() {
				dispatchForDocumentSection({
					eventID: documentSectionEventIDs.saveChanges
				});
			},
			
			enterHTMLPreview() {
				dispatchForDocumentSection({
					eventID: documentSectionEventIDs.enterHTMLPreview
				});
			},
			
			exitHTMLPreview() {
				dispatchForDocumentSection({
					eventID: documentSectionEventIDs.exitHTMLPreview
				});
			},
			
			editBlockWithKeyPath(blockKeyPath) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.edit.blockWithKeyPath,
					blockKeyPath,
					documentID,
					sectionID
				});
			},
			
			editTextItemWithKeyPath(textItemKeyPath) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.edit.textItemWithKeyPath,
					documentID,
					sectionID,
					textItemKeyPath
				});
			},
			
			editTextItemBasedBlockWithKeyPathAddingIfNeeded(blockKeyPath) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.edit.textItemBasedBlockWithKeyPathAddingIfNeeded,
					documentID,
					sectionID,
					blockKeyPath
				});
			},
			
			finishEditing() {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.finishEditing,
					documentID,
					sectionID
				});
			},
			
			// REORDERING
			
			beginReordering() {
				this.finishEditing();
				
				dispatchForDocumentSection({
					eventID: documentSectionEventIDs.beginReordering
				});
			},
			
			finishReordering() {
				dispatchForDocumentSection({
					eventID: documentSectionEventIDs.finishReordering
				});
			},
			
			focusOnBlockAtKeyPathForReordering(blockKeyPath) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.blockAtKeyPath.focusOnForReordering,
					documentID,
					sectionID,
					blockKeyPath
				});
			},
			
			keepFocusedBlockForReorderingInCurrentSpot() {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.focusedBlockForReordering.keepAtCurrentSpot,
					documentID,
					sectionID
				});
			},
			
			moveFocusedBlockForReorderingToBeforeBlockAtIndex(blockIndex) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.focusedBlockForReordering.moveToBeforeBlockAtIndex,
					documentID,
					sectionID,
					beforeBlockAtIndex: blockIndex
				});
			},
			
			// INSERTING
			
			insertSubsectionOfTypeAtBlockIndex(subsectionType, blockIndex) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.blocks.insertSubsectionOfTypeAtIndex,
					documentID,
					sectionID,
					subsectionType,
					blockIndex
				})
			},
			
			changeTypeOfSubsectionAtKeyPath(subsectionKeyPath, subsectionType) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.subsectionAtKeyPath.changeType,
					documentID,
					sectionID,
					subsectionKeyPath,
					subsectionType
				});
			},
			
			removeSubsectionAtKeyPath(subsectionKeyPath) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.subsectionAtKeyPath.remove,
					documentID,
					sectionID,
					subsectionKeyPath
				});
			},
			
			changeTypeOfBlockAtKeyPath(blockTypeGroup, blockType, blockKeyPath) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.blockAtKeyPath.changeType,
					documentID,
					sectionID,
					blockKeyPath,
					blockTypeGroup,
					blockType
				});
			},
			
			removeBlockAtKeyPath(blockKeyPath) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.blockAtKeyPath.remove,
					documentID,
					sectionID,
					blockKeyPath
				});
			},
			
			insertBlockOfTypeAtIndex(typeGroup, type, blockIndex) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.blocks.insertBlockOfTypeAtIndex,
					typeGroup,
					type,
					blockIndex,
					documentID,
					sectionID
				});
			},
			
			insertRelatedBlockAfterBlockAtKeyPath(blockKeyPath) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.blockAtKeyPath.insertRelatedBlockAfter,
					blockKeyPath,
					documentID,
					sectionID
				});
			},
			
			removeEditedBlock() {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedBlock.remove,
					documentID,
					sectionID
				});
			},
			
			insertRelatedBlockAfterEditedBlock() {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.blockAtKeyPath.insertRelatedBlockAfter,
					useEditedBlockKeyPath: true,
					documentID,
					sectionID
				});
			},
			
			insertRelatedTextItemBlocksAfterEditedBlockWithPastedText(pastedText)
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.blockAtKeyPath.insertRelatedTextItemBlocksAfterWithPastedText,
					useEditedBlockKeyPath: true,
					pastedText,
					documentID,
					sectionID
				});
			},
			
			// Updating Blocks
			
			updateValueForBlockAtKeyPath(blockKeyPath, defaultValue, newValueFunction)
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.blockAtKeyPath.changeValue,
					documentID,
					sectionID,
					blockKeyPath,
					defaultValue,
					newValueFunction
				});
			},
			
			changeTraitUsingFunctionForEditedBlock(traitID, defaultValue, newValueFunction)
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedBlock.changeTraitValue,
					documentID,
					sectionID,
					traitID,
					defaultValue,
					newValueFunction
				});
			},
			
			toggleBooleanTraitForEditedBlock(traitID)
			{
				this.changeTraitUsingFunctionForEditedBlock(traitID, false, function(valueBefore) {
					return !valueBefore;
				});
			},
			
			changeMapTraitUsingFunctionForEditedBlock(traitID, changeFunction)
			{
				this.changeTraitUsingFunctionForEditedBlock(traitID, Immutable.Map(), changeFunction);
			},
			
			removeTraitWithIDForEditedBlock(traitID)
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedBlock.removeTrait,
					documentID,
					sectionID,
					traitID
				});
			},
			
			removeEditedTextItem() {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.remove,
					documentID,
					sectionID
				});
			},
			
			setTextForEditedTextItem(text) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.setText,
					documentID,
					sectionID,
					textItemText: text
				});
			},
			
			changeTraitUsingFunctionForEditedTextItem(traitID, defaultValue, newValueFunction)
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.changeTraitValue,
					documentID,
					sectionID,
					traitID,
					defaultValue,
					newValueFunction
				});
			},
			
			toggleBooleanTraitForEditedTextItem(traitID)
			{
				this.changeTraitUsingFunctionForEditedTextItem(traitID, false, function(valueBefore) {
					return !valueBefore;
				});
			},
			
			changeMapTraitUsingFunctionForEditedTextItem(traitID, changeFunction)
			{
				this.changeTraitUsingFunctionForEditedTextItem(traitID, Immutable.Map(), changeFunction);
			},
			
			removeTraitWithIDForEditedTextItem(traitID)
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.removeTrait,
					traitID,
					documentID,
					sectionID
				});
			},
			
			editPreviousItemBeforeEditedTextItem()
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.editPreviousItem,
					documentID,
					sectionID
				});
			},
			
			editNextItemAfterEditedTextItem()
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.editNextItem,
					documentID,
					sectionID
				});
			},
			
			addNewTextItemAfterEditedTextItem()
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.addNewTextItemAfter,
					documentID,
					sectionID
				});
			},
			
			addLineBreakAfterEditedTextItem()
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.addLineBreakAfter,
					documentID,
					sectionID
				});
			},
			
			splitBlockBeforeEditedTextItem()
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.splitBlockBefore,
					documentID,
					sectionID
				});
			},
			
			joinEditedTextItemWithPreviousItem()
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.joinWithPreviousItem,
					documentID,
					sectionID
				});
			},
			
			splitTextInRangeOfEditedTextItem(textRange)
			{	
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.splitTextInRange,
					textRange,
					documentID,
					sectionID
				});
			},
			
			registerSelectedTextRangeFunctionForEditedItem(selectedTextRangeFunction)
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.registerSelectedTextRangeFunction,
					selectedTextRangeFunction,
					documentID,
					sectionID
				});
			},
			
			unregisterSelectedTextRangeFunctionForEditedItem()
			{
				/*
				if (AppDispatcher.isDispatching) {
					AppDispatcher.waitFor([ContentStore.dispatchToken]);
				}*/
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.unregisterSelectedTextRangeFunction,
					documentID,
					sectionID
				});
			}
		};
	}
};

module.exports = ActionsContent;