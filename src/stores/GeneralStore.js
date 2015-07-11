
import AppDispatcher, { registerStoreForActionsWithFunctions } from '../app-dispatcher';
import * as CatalogStore from './CatalogStore';

let catalogStore = CatalogStore.newStore();

const catalogStoreToken = registerStoreForDispatchedActionsWithFunctions(catalogStore, CatalogStore);
