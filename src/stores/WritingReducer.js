import Immutable from 'immutable';

import generateUUID from 'uuid-v4';
import WritingBlocksReducer from './WritingBlocksReducer';


export function getInitialState() {
  return Immutable.fromJS({
    id: generateUUID(),
    blocks: [],
  });
}

export function WritingBlocksActions(state, { isAction, forwardTo }) {
  if (isAction) {
    return state.update('blocks', blocks =>
      forwardTo({ responder: WritingBlocksReducer, initialState: blocks });
    );
  }
}
