
import AppDispatcher, { registerStoreForActionsWithFunctions } from '../app-dispatcher';
import * as ContextStore from './ContextStore';
import * as CatalogStore from './CatalogStore';
import * as CatalogActions from './CatalogActions';


let context = ContextStore.newStore();


let currentDocumentID = null;
let currentDocumentData = null;

let currentCatalogStore = CatalogStore.newStore();

const catalogStoreToken = registerActionsWithFunctions(CatalogStore,
  (action, payload) => {
    currentCatalogStore = action.call(null, currentCatalogStore, payload);
  }
);

export function getCurrentDocumentData() {
  return currentDocumentData;
}
