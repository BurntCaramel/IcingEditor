window.burntIcing = {
	settingsJSON: {
		//actionURL: '/-admin/burnt-icing/json/',
		previewURL: '/-icing-preview/',
		wantsSaveFunctionality: false,
		wantsViewHTMLFunctionality: true,
		wantsPlaceholderFunctionality: true,
		initialDocumentState: {
			availableDocuments: [
				{
					"ID": "dummy",
					"title": "Dummy",
					"sections": [
						{
							"ID": "main",
							"title": "Main"
						}
					]
				}
			],
			documentID: 'dummy',
			documentSectionID: 'main',
			contentJSONByDocumentID: {
				"dummy": {
					"main": require('./dummy-content.json')
				}
			}
		}
	}
};
