
import { Dispatcher } from 'flux';
import * as Actions from './actions';

const dispatcher = new Dispatcher();

export function registerActionsWithFunctions(StoreFunctions, callbackWithActionAndPayload) {
  return dispatcher.register( (payload) => {
  	if (!payload.eventID) {
  		return;
  	}

    const actionsForGroup = StoreFunctions[payload.actionGroup];
    if (actionsForGroup) {
      const actionFunction = actionsForGroup[payload.actionID];
      if (actionFunction) {
        callbackWithActionAndPayload(actionFunction, payload);
      }
    }
  });
}

export function bindActions(actions) {
  return actions.map((actionFunction) => {
    return () => {
      dispatcher.dispatch(actionFunction.apply(null, arguments));
    };
  });
}

export function getBoundsActionsFromGroup(actionsGroup) {
  const actions = Actions[actionsGroup];

  return actions.map((actionFunction, actionID) => {
    return () => {
      let payload = actionFunction.apply(null, arguments);

      payload.actionsGroup = actionsGroup;
      payload.actionID = actionID;
      payload.eventID = `${actionsGroup}.${actionID}`;

      dispatcher.dispatch(payload);
    };
  });
}

export const register = dispatcher.register.bind(dispatcher);
export const dispatch = dispatcher.dispatch.bind(dispatcher);

export default dispatcher;
