import newIdentifier from 'uuid-v4';


export function getInitialState({ typeGroup, type, textItems }) {
  const newBlock = Immutable.Map({
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
  return createNewBlock({
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
  }
  state = state.set('type', type);

  if (typeGroup === 'text') {
    if (!state.has('textItems')) {
      state = state.set('textItems', Immutable.List());
    }
  }
  else {
    state = state.remove('textItems');
  }

  return state;
}
