(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

window.burntIcing = {
	settingsJSON: {
		//actionURL: '/-admin/burnt-icing/json/',
		previewURL: "/-icing-preview/",
		wantsSaveFunctionality: false,
		wantsViewHTMLFunctionality: true,
		wantsPlaceholderFunctionality: true,
		initialDocumentState: {
			availableDocuments: [{
				ID: "dummy",
				title: "Dummy",
				sections: [{
					ID: "main",
					title: "Main"
				}]
			}],
			documentID: "dummy",
			documentSectionID: "main",
			contentJSONByDocumentID: {
				dummy: {
					main: require("./dummy-content.json")
				}
			}
		}
	}
};

},{"./dummy-content.json":2}],2:[function(require,module,exports){
module.exports={
	"type": "textItems",
    "blocks": [
        {
            "type": "placeholder",
			"placeholderID": "blik.header"
        },
        {
            "type": "placeholder",
			"placeholderID": "blik.macAppStoreLink"
        },
        {
            "textItems": [
                {
                    "text": "Your projects, at a glance.",
                    "type": "text"
                }
            ],
			"typeGroup": "text",
			"type": "subhead2"
        },
        {
            "textItems": [
                {
                    "text": "Got those projects you\u2019re working on? ",
                    "type": "text"
                },
                {
                    "text": "And that client from last year who wants some changes? ",
                    "type": "text"
                },
                {
                    "text": "Plus that upcoming pitch? ",
                    "type": "text"
                },
                {
                    "text": "Do you collaborate with other people, sharing many files via a service like Dropbox? Are there files from these different projects you need quick access to all the time?",
                    "type": "text"
                }
            ],
            "type": "body"
        },
        {
            "textItems": [
                {
                    "text": "Blik lets you select the key files and folders from projects, organising them as you like. Highlight the essentials so that they are never more than a click away, no matter what folder they live in. And set preferred apps to open files, specific for the project.",
                    "type": "text"
                }
            ],
            "type": "body"
        },
        {
            "textItems": [
                {
                    "text": "Blik is simple \u2014 purposefully so \u2014 to let you focus on just the files you need.",
                    "type": "text"
                }
            ],
            "type": "body"
        },
        {
            "textItems": [
                {
                    "attributes": {
                        "italic": true,
						"secondary": true
					},
                    "text": "Briefs. PSDs. Dev folders. ",
                    "type": "text"
                },
                {
                    "attributes": {
                        "bold": true
					},
                    "text": "Organization for Web Designers & Developers.",
                    "type": "text"
                }
            ],
            "type": "subhead2"
        }
    ]
}

},{}]},{},[1]);
