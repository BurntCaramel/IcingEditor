import { createResourcesFromReducers, connectActionSets, dispatch, getConsensus } from 'flambeau';
import * as SpecsActions from '../actions/SpecsActions';
import * as SpecsReducer from './SpecsReducer';

// REDUCERS
let { resources, states } = createResourcesFromReducers({
  reducers: {
    specs: SpecsReducer
  },
  idToProps: {}
});

// ACTIONS
export const connectedActions = connectActionSets({
  actionSets: {
    SpecsActions
  },

  dispatch(action) {
    const changesStates = dispatch({
      resources,
      states
    })(action);

    states = Object.assign({}, states, changesStates);
  },

  getConsensusForActionSet(actionSetID) {
    return getConsensus({
      resources,
      states
    })(actionSetID);
  }
});

export function get(id) {
  return states[id];
}


/*
flambeau.createCollection('documents', DocumentReducer);
flambeau.createInstance('currentDocumentUUID', CurrentDocumentStore);
flambeau.createConvenience('currentDocument', (graphController) => {
  const UUID = graphController.get('currentDocumentUUID');
  if (UUID) {
    return graphController.get('documents').get(UUID);
  }
});
*/
