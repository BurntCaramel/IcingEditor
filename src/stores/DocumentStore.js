
import Immutable from 'immutable';


export function new() {
  return Immutable.Map({
    mainSection: Immutable.Map(),
    supportingSections: Immutable.Map(),

  });
}

export function getID(document) {
  return document.UUID;
}
/*
export function forwardAction(items, actionSetID, actionID, actionPayload, context, forwardTo) {
  const { UUID } = actionPayload;
  return documents.set(UUID, forwardTo(DocumentReducer, documents.get(UUID));
}
*/
export function DocumentActions(documents, { type, actionID, payload, context, forwardTo }) {
  return documents.update(payload.UUID, (document) => {
    return forwardTo(DocumentReducer, document);
  });
  //return documents.set(UUID, forwardTo(DocumentReducer, documents.get(UUID));
}

export const DocumentActions = {
  setDataForMainSection(store, {data}) {
    return store.set('mainSection', data);
  }
};
