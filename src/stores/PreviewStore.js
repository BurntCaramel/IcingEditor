/**
	Copyright 2015 Patrick George Wyndham Smith
*/

import AppDispatcher from '../app-dispatcher';
var Immutable = require('immutable');
var MicroEvent = require('microevent');
var ContentActionsEventIDs = require('../actions/ContentActionsEventIDs');
var documentSectionEventIDs = ContentActionsEventIDs.documentSection;


//var documentSectionActivity = Immutable.Map({});

var StorePreview = {
	on: MicroEvent.prototype.bind,
	trigger: MicroEvent.prototype.trigger,
	off: MicroEvent.prototype.unbind
};


var isPreviewing = false;
StorePreview.getIsPreviewing = function() {
	return isPreviewing;
};
	
StorePreview.enterPreview = function() {
	if (!isPreviewing) {
		isPreviewing = true;
		StorePreview.trigger('didEnterPreview');
	}
};

StorePreview.exitPreview = function() {
	if (isPreviewing) {
		isPreviewing = false;
		StorePreview.trigger('didExitPreview');
	}
};


AppDispatcher.register( function(payload) {
	switch (payload.eventID) {
		
	case (documentSectionEventIDs.enterHTMLPreview):
		StorePreview.enterPreview();
		break;
	
	case (documentSectionEventIDs.exitHTMLPreview):
		StorePreview.exitPreview();
		break;
	
	}
});

module.exports = StorePreview;