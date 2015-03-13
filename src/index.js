let editor = require('./editor/editor.js');

if (!window.burntIcing) {
	console.error('Icing requires window.burntIcing property to be set up in JavaScript');
}
else if (window.burntIcing.delayed === false || typeof window.burntIcing.delayed === 'undefined') {
	editor.goOnDocumentLoad();
}
else {
	window.burntIcing.setInitialContentJSON = function(contentJSON) {
		let initialDocumentState = window.burntIcing.settingsJSON.initialDocumentState;
		
		if (!initialDocumentState.contentJSONByDocumentID) {
			initialDocumentState.contentJSONByDocumentID = {};
		}
		if (!initialDocumentState.contentJSONByDocumentID[initialDocumentState.documentID]) {
			initialDocumentState.contentJSONByDocumentID[initialDocumentState.documentID] = {}
		}
		
		initialDocumentState.contentJSONByDocumentID[initialDocumentState.documentID][initialDocumentState.documentSectionID] = contentJSON;
		
		editor.goOnDocumentLoad();
	};
}