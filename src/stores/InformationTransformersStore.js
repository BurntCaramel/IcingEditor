var AppDispatcher = require('../app-dispatcher');
var Immutable = require('immutable');
var MicroEvent = require('microevent');


var tranformerIdentifiersToFunctions = Immutable.Map({});

let TransformerRecord = Immutable.Record({
	transformFunction: null
});

var InformationTransformersStore = {
	on: MicroEvent.prototype.bind,
	trigger: MicroEvent.prototype.trigger,
	off: MicroEvent.prototype.unbind
};


InformationTransformersStore.useTransformerWithIdentifier = function(transformerIdentifier, inputInfo) {
	let transformer = tranformerIdentifiersToFunctions.get(transformerIdentifier);
	if (!transformer) {
		return null;
	}
	
	let transformFunction = transformer.transformFunction;
	return transformFunction(inputInfo);
};

InformationTransformersStore.registerTransformerWithIdentifierAndFunction = function(transformerIdentifier, transformFunction) {
	let transformer = new TransformerRecord({
		transformFunction
	});
	
	tranformerIdentifiersToFunctions.set(transformerIdentifier, transformer);
	
	InformationTransformersStore.trigger('didAddTransformer');
};


InformationTransformersStore.dispatchToken = AppDispatcher.register( function(payload) {
	switch (payload.eventID) {
	}
});

module.exports = InformationTransformersStore;