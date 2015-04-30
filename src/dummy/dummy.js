window.burntIcing = {
	settingsJSON: {
		//actionURL: '/-admin/burnt-icing/json/',
		previewURL: '/-icing/preview/',
		wantsSaveUI: false,
		wantsViewHTMLFunctionality: true,
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
				"dummy": require('./dummy-content.json')
			}
		}
	}
};
