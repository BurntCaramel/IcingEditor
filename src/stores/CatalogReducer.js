import Immutable from 'immutable';
import generateUUID from 'generateUUID';


export function getInitialState() {
	return Immutable.Map({
		identifiersToElements: Immutable.Map(),
		identifiersToDesignations: Immutable.Set()
	});
};

export function newIdentifier() {
	return generateUUID();
};

export const CatalogActions = {
	addElement(state, { identifier, element }) {
		return state.update('identifiersToElements', identifiersToElements => {
			return identifiersToElements.set(identifier, element);
		});
	},

	addDesignationToElement(state, { identifier, designationIdentifier }) {
		return state.updateIn(['identifiersToDesignations', identifier], Immutable.Set(), designationsSet => {
			return designationsSet.add(designationIdentifier);
		});
	},

	removeDesignationFromElement(state, { identifier, designationIdentifier }) {
		return state.updateIn(['identifiersToDesignations', identifier], Immutable.Set(), designationsSet => {
			return designationsSet.delete(designationIdentifier);
		});
	},

	removeElement(state, { identifier }) {
		state = state.update('identifiersToElements', identifiersToElements => {
			return identifiersToElements.remove(identifier);
		});
		state = state.update('identifiersToDesignations', identifiersToDesignations => {
			return identifiersToDesignations.remove(identifier);
		});

		return state;
	},

	introspection: {
	  getElementsSortedByDesignations(state, { ascending }) {
			return state.get('identifiersToDesignations').sort((designationIdentifierA, designationIdentifierB) => {
				return designationIdentifierA.localeCompare(designationIdentifierB) * (ascending ? 1 : -1);
			});
		}
	}
};
