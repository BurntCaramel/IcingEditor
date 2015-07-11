
import Immutable from 'immutable';


export function newStore() {
	return Immutable.Map({
		orderedIdentifiers: Immutable.List(),
		identifiersToElements: Immutable.Map(),
		identifiersToDesignations: Immutable.Map()
	});
};

export function newIdentifier(element) {

};

export function addElementAtIndexUsingIdentifier(store, element, index, identifier) {
	store = store.update('orderedIdentifiers', orderedIdentifiers => {
		return orderedIdentifiers.splice(index, 0, identifier);
	});
	store = store.update('identifiersToElements', identifiersToElements => {
		return identifiersToElements.set(identifier, element);
	});

	return store;
};

export function updateDesignationsForElementWithIdentifier(store, elementIdentifier, tagsUpdater) {
	store = store.update('identifiersToDesignations', identifiersToDesignations => {
		return identifiersToDesignations.update(elementIdentifier, Immutable.List(), tagsUpdater);
	});
};

export function removeElementWithIdentifier(store, elementIdentifier) {
	const index = store.get('orderedIdentifiers').indexOf(elementIdentifier);
	
	store = store.update('orderedIdentifiers', orderedIdentifiers => {
		return orderedIdentifiers.remove(index);
	});
	store = store.update('identifiersToElements', identifiersToElements => {
		return identifiersToElements.remove(elementIdentifier);
	});
	store = store.update('identifiersToDesignations', identifiersToDesignations => {
		return identifiersToDesignations.remove(elementIdentifier);
	});

	return store;
};
