var ActionsContentEventIDs = {
	documentSection: {
		setContent: 'documentSection.setContent',
		saveChanges: 'documentSection.saveChanges',
		enterHTMLPreview: 'documentSection.enterHTMLPreview',
		exitHTMLPreview: 'documentSection.exitHTMLPreview',
		edit: {
			blockWithKeyPath: 'documentSection.edit.blockWithKeyPath',
			textItemWithKeyPath: 'documentSection.edit.textItemWithKeyPath'
		},
		finishEditing: 'documentSection.finishEditing',
		blockAtKeyPath: {
			changeType: 'documentSection.blockAtKeyPath.changeType',
			changePlaceholderID: 'documentSection.blockAtKeyPath.changePlaceholderID',
			remove: 'documentSection.blockAtKeyPath.remove',
			insertRelatedBlockAfter: 'documentSection.blockAtKeyPath.insertRelatedBlockAfter'
		},
		editedBlock: {
			remove: 'documentSection.editedBlock.remove',
			insertRelatedBlockAfter: 'documentSection.editedBlock.insertRelatedBlockAfter'
		},
		editedItem: {
			remove: 'documentSection.editedItem.remove',
			setText: 'documentSection.editedItem.setText',
			changeTraitValue: 'documentSection.editedItem.changeTraitValue',
			editPreviousItem: 'documentSection.editedItem.editPreviousItem',
			editNextItem: 'documentSection.editedItem.editNextItem',
			addNewTextItemAfter: 'documentSection.editedItem.addNewTextItemAfter',
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