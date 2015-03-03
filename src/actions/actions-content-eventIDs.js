var ActionsContentEventIDs = {
	documentSection: {
		setContent: 'documentSection.setContent',
		saveChanges: 'documentSection.saveChanges',
		enterHTMLPreview: 'documentSection.enterHTMLPreview',
		exitHTMLPreview: 'documentSection.exitHTMLPreview',
		edit: {
			blockWithKeyPath: 'documentSection.edit.blockWithKeyPath',
			textItemWithKeyPath: 'documentSection.edit.textItemWithKeyPath',
			textItemBasedBlockWithKeyPathAddingIfNeeded: 'documentSection.edit.textItemBasedBlockWithKeyPathAddingIfNeeded'
		},
		finishEditing: 'documentSection.finishEditing',
		blocks: {
			insertSubsectionOfTypeAtIndex: 'documentSection.blocks.insertSubsectionOfTypeAtIndex'
		},
		subsectionAtKeyPath: {
			changeType: 'documentSection.subsectionAtKeyPath.changeType'
		},
		blockAtKeyPath: {
			changeType: 'documentSection.blockAtKeyPath.changeType',
			changePlaceholderID: 'documentSection.blockAtKeyPath.changePlaceholderID',
			changeValue: 'documentSection.blockAtKeyPath.changeValue',
			remove: 'documentSection.blockAtKeyPath.remove',
			insertRelatedBlockAfter: 'documentSection.blockAtKeyPath.insertRelatedBlockAfter'
		},
		editedBlock: {
			remove: 'documentSection.editedBlock.remove',
			insertRelatedBlockAfter: 'documentSection.editedBlock.insertRelatedBlockAfter',
			changeTraitValue: 'documentSection.editedBlock.changeTraitValue',
			removeTrait: 'documentSection.editedBlock.removeTrait',
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
		}
	}
};

module.exports = ActionsContentEventIDs;