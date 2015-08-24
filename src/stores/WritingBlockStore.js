
import Immutable from 'immutable';


export function new({ typeGroup, type }) {
  return Immutable.Map({
    typeGroup,
    type,
  });
}

export const WritingBlockActions = {
  changeType(store, { typeGroup, type }) {
    store = store.set('typeGroup', typeGroup);
    store = store.set('type', type);

    if (typeGroup === 'text') {
      store = store.set('textItems', Immutable.List());
    }
    else {
      store = store.remove('textItems');
    }

    return store;
  },

  moveItemAtIndexToIndex(store, { fromIndex, toIndex }) {
    //return store.update('items', updater);
  },
};
