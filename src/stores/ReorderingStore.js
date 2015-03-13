var AppDispatcher = require('../app-dispatcher');
var Immutable = require('immutable');
var MicroEvent = require('microevent');
var ContentActionsEventIDs = require('../actions/actions-content-eventIDs');
var documentSectionEventIDs = ContentActionsEventIDs.documentSection;


//var documentSectionActivity = Immutable.Map({});

var ReorderingStore = {
	on: MicroEvent.prototype.bind,
	trigger: MicroEvent.prototype.trigger,
	off: MicroEvent.prototype.unbind
};


var isReordering = false;
ReorderingStore.getIsReordering = function() {
	return isReordering;
};
	
let beginReordering = function() {
	if (!isReordering) {
		isReordering = true;
		ReorderingStore.trigger('didBeginReordering');
	}
};

let finishReordering = function() {
	if (isReordering) {
		isReordering = false;
		ReorderingStore.trigger('didFinishReordering');
	}
};


ReorderingStore.dispatchToken = AppDispatcher.register( function(payload) {
	switch (payload.eventID) {
		
	case (documentSectionEventIDs.beginReordering):
		beginReordering();
		break;
	
	case (documentSectionEventIDs.finishReordering):
		finishReordering();
		break;
	
	}
});

module.exports = ReorderingStore;