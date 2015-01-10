var AppDispatcher = require('../app-dispatcher');
var ContentStore = require('../stores/store-content');

var eventIDs = require('./actions-content-eventIDs');
var documentSectionEventIDs = eventIDs.documentSection;

var ActionsContent = {
	getActionsForDocumentSection: function(documentID, sectionID) {
		function dispatchForDocumentSection(payload) {
			payload.documentID = documentID;
			payload.sectionID = sectionID;
			
			AppDispatcher.dispatch(payload);
		};
		
		return {
			setContent: function(content) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.setContent,
					documentID: documentID,
					sectionID: sectionID,
					content: content
				});
			},
			
			getEditedTextItemIdentifier: function() {
				return ContentStore.getEditedTextItemIdentifierForDocumentSection(documentID, sectionID);
			},
			
			getEditedTextItemKeyPath: function() {
				return ContentStore.getEditedTextItemKeyPathForDocumentSection(documentID, sectionID);
			},
			
			getEditedBlockIdentifier: function() {
				var textItemIdentifier = this.getEditedTextItemIdentifier();
				if (textItemIdentifier) {
					return textItemIdentifier.slice(0, -2);
				}
				else {
					return null;
				}
			},
			
			editTextItemWithIdentifier: function(identifier, keyPath) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.edit.textItemWithIdentifierAndKeyPath,
					documentID: documentID,
					sectionID: sectionID,
					textItemIdentifier: identifier,
					textItemKeyPath: keyPath
				});
			},
			
			changeTypeOfBlockAtKeyPath: function(type, keyPath) {
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.changeTypeOfBlockAtKeyPath,
					documentID: documentID,
					sectionID: sectionID,
					blockType: type,
					blockKeyPath: keyPath
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
			
			changeAttributeValueForEditedTextItem: function(attributeID, defaultValue, newValueFunction)
			{
				AppDispatcher.dispatch({
					eventID: documentSectionEventIDs.editedItem.changeAttributeValue,
					documentID: documentID,
					sectionID: sectionID,
					attributeID: attributeID,
					defaultValue: defaultValue,
					newValueFunction: newValueFunction
				});
			},
			
			toggleBoldForEditedTextItem: function()
			{
				this.changeAttributeValueForEditedTextItem('bold', false, function(valueBefore) {
					return !valueBefore;
				});
			},
			
			toggleItalicForEditedTextItem: function()
			{
				this.changeAttributeValueForEditedTextItem('italic', false, function(valueBefore) {
					return !valueBefore;
				});
			},
			
			toggleTraitForEditedTextItem: function(traitID)
			{
				this.changeAttributeValueForEditedTextItem(traitID, false, function(valueBefore) {
					return !valueBefore;
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
				
			}
		};
	}
};

module.exports = ActionsContent;