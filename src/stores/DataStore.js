
import Immutable from 'immutable';


export function getInitialState() {
  return Immutable.Map({
    documentIDsToData: Immutable.Map(),

  });
}

export const DataActions = {
  setDataForDocumentWithID(store, {data, documentID}) {
    return store.update('documentIDsToData', (documentIDsToData) => {
      return documentIDsToData.set(documentID, data);
    });
  }
};
