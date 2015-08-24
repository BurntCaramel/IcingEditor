import Flambeau from 'flambeau';
import * as SpecsActions from '../actions/SpecsActions';
import * as SpecsReducer from './SpecsReducer';

const flambeau = new Flambeau();

// ACTIONS
flambeau.registerActionSets({
  SpecsActions
});

// REDUCERS
flambeau.attachReducer('specs', SpecsReducer);

export const connectedActions = flambeau.getConnectedActionSets([
  'SpecsActions'
]);

export default flambeau;



/*flambeau.attachReducers({
  specs: SpecsReducer
});*/

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
