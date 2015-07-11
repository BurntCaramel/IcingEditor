import { Dispatcher } from 'flux');

const dispatcher = new Dispatcher();

export function registerStoreForDispatchedActionsWithFunctions(store, StoreFunctions) {
  return dispatcher.register( (payload) => {
  	if (!payload.eventID) {
  		return;
  	}

    const action = StoreFunctions[payload.eventID];
    if (action) {
      action.call(null, store, payload);
    }
  };
}

export function bindActions(actions) {
  return actions.map((actionFunction) => {
    return () => {
      dispatcher.dispatch(actionFunction.apply(null, arguments));
    };
  });
}

export default dispatcher;
