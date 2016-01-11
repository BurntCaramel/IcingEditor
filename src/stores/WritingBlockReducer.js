import newIdentifier from 'uuid-v4';


export function getInitialState({ typeGroup, type, textItems }) {
  let newBlock = Immutable.Map({
    typeGroup,
    type,
    identifier: newIdentifier()
  });

  if (textItems) {
    newBlock = newBlock.set('textItems', textItems);
  }

  return newBlock;
}

export function createSimilarBlock({ block, textItems }) {
  return getInitialState({
    typeGroup: block.typeGroup,
    type: block.type,
    textItems
  });
}

export function blockTypeGroupHasTextItems(typeGroup) {
  return (typeGroup === 'text');
}

export function changeType(state, { typeGroup, type }) {
  if (typeGroup) {
    state = state.set('typeGroup', typeGroup);

    if (typeGroup === 'text') {
      if (!state.has('textItems')) {
        state = state.set('textItems', Immutable.List());
      }
    }
    else {
      state = state.remove('textItems');
    }
  }

  state = state.set('type', type);

  return state;
}
