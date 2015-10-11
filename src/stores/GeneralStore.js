import Flambeau from 'flambeau';
import * as SpecsActions from '../actions/SpecsActions';
import * as SpecsReducer from './SpecsReducer';

const flambeau = new Flambeau();

// ACTIONS
export const connectedActions = flambeau.registerAndConnectActionSets({
  SpecsActions
});

// REDUCERS
flambeau.attachReducers({
  specs: SpecsReducer
});

export default flambeau;


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
