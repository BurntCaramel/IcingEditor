/**
	Copyright 2015 Patrick George Wyndham Smith
*/

var ActionsContentEventIDs = {
	specs: {
		loadSpecsWithURLs: 'specs.loadSpecsWithURLs'
	},
	document: {
		loadContent: 'document.loadContent',
		setSpecsURLs: 'document.setSpecsURLs'
	},
	documentSection: {
		setContentJSON: 'documentSection.setContentJSON',
		saveChanges: 'documentSection.saveChanges',
		edit: {
			blockWithKeyPath: 'documentSection.edit.blockWithKeyPath',
			textItemWithKeyPath: 'documentSection.edit.textItemWithKeyPath',
			textItemBasedBlockWithKeyPathAddingIfNeeded: 'documentSection.edit.textItemBasedBlockWithKeyPathAddingIfNeeded'
		},
		finishEditing: 'documentSection.finishEditing',
		blocks: {
			insertSubsectionOfTypeAtIndex: 'documentSection.blocks.insertSubsectionOfTypeAtIndex',
			insertBlockOfTypeAtIndex: 'documentSection.blocks.insertBlockOfTypeAtIndex'
		},
		subsectionAtKeyPath: {
			changeType: 'documentSection.subsectionAtKeyPath.changeType',
			remove: 'documentSection.subsectionAtKeyPath.remove'
		},
		blockAtKeyPath: {
			changeType: 'documentSection.blockAtKeyPath.changeType',
			changePlaceholderID: 'documentSection.blockAtKeyPath.changePlaceholderID',
			changeValue: 'documentSection.blockAtKeyPath.changeValue',
			remove: 'documentSection.blockAtKeyPath.remove',
			insertRelatedBlockAfter: 'documentSection.blockAtKeyPath.insertRelatedBlockAfter',
			insertRelatedTextItemBlocksAfterWithPastedText: 'documentSection.blockAtKeyPath.insertRelatedTextItemBlocksAfterWithPastedText',
			focusOnForReordering: 'documentSection.blockAtKeyPath.focusOnForReordering',
			reorderMovingToIndex: 'documentSection.blockAtKeyPath.reorderMovingToIndex'
		},
		editedBlock: {
			remove: 'documentSection.editedBlock.remove',
			insertRelatedBlockAfter: 'documentSection.editedBlock.insertRelatedBlockAfter',
			changeTraitValue: 'documentSection.editedBlock.changeTraitValue',
			removeTrait: 'documentSection.editedBlock.removeTrait'
		},
		editedItem: {
			remove: 'documentSection.editedItem.remove',
			setText: 'documentSection.editedItem.setText',
			changeTraitValue: 'documentSection.editedItem.changeTraitValue',
			removeTrait: 'documentSection.editedItem.removeTrait',
			editPreviousItem: 'documentSection.editedItem.editPreviousItem',
			editNextItem: 'documentSection.editedItem.editNextItem',
			addNewTextItemAfter: 'documentSection.editedItem.addNewTextItemAfter',
			addLineBreakAfter: 'documentSection.editedItem.addLineBreakAfter',
			splitBlockBefore: 'documentSection.editedItem.splitBlockBefore',
			joinWithPreviousItem: 'documentSection.editedItem.joinWithPreviousItem',
			registerSelectedTextRangeFunction: 'documentSection.editedItem.registerSelectedTextRangeFunction',
			unregisterSelectedTextRangeFunction: 'documentSection.editedItem.unregisterSelectedTextRangeFunction',
			splitTextAtSelectedTextRange: 'documentSection.editedItem.splitTextAtSelectedTextRange',
			splitTextInRange: 'documentSection.editedItem.splitTextInRange'
		},
		focusedBlockForReordering: {
			keepAtCurrentSpot: 'documentSection.focusedBlockForReordering.keepAtCurrentSpot',
			moveToBeforeBlockAtIndex: 'documentSection.focusedBlockForReordering.moveToBeforeBlockAtIndex'
		},
		showSettings: 'documentSection.showSettings',
		hideSettings: 'documentSection.hideSettings',
		enterHTMLPreview: 'documentSection.enterHTMLPreview',
		exitHTMLPreview: 'documentSection.exitHTMLPreview',
		beginReordering: 'documentSection.beginReordering',
		finishReordering: 'documentSection.finishReordering'
	}
};

module.exports = ActionsContentEventIDs;