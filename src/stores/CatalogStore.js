
import Immutable from 'immutable';
import generateUUID from 'generateUUID';


export function getInitialState() {
	return Immutable.Map({
		orderedIdentifiers: Immutable.List(),
		identifiersToElements: Immutable.Map(),
		identifiersToDesignations: Immutable.Map()
	});
};

export function newIdentifier() {
	return generateUUID();
};

export const CatalogActions = {
	addElementAtIndexUsingIdentifier(store, {element, index, elementIdentifier}) {
		store = store.update('orderedIdentifiers', orderedIdentifiers => {
			return orderedIdentifiers.splice(index, 0, identifier);
		});
		store = store.update('identifiersToElements', identifiersToElements => {
			return identifiersToElements.set(identifier, element);
		});

		return store;
	},

	updateDesignationsForElementWithIdentifier(store, {elementIdentifier, tagsUpdater}) {
		store = store.update('identifiersToDesignations', identifiersToDesignations => {
			return identifiersToDesignations.update(elementIdentifier, Immutable.List(), tagsUpdater);
		});
	},

	removeElementWithIdentifier(store, {elementIdentifier}) {
		store = store.update('orderedIdentifiers', orderedIdentifiers => {
			return orderedIdentifiers.remove(orderedIdentifiers.indexOf(elementIdentifier));
		});
		store = store.update('identifiersToElements', identifiersToElements => {
			return identifiersToElements.remove(elementIdentifier);
		});
		store = store.update('identifiersToDesignations', identifiersToDesignations => {
			return identifiersToDesignations.remove(elementIdentifier);
		});

		return store;
	},
};
