
import Immutable from 'immutable';

import generateUUID from './generateUUID';


export function new() {
  return Immutable.fromJS({
    id: generateUUID(),
    blocks: [],
  });
}

export const actions = {
  WritingActions: {
    insertNewBlockOfTypeAtIndex(store, {index, typeGroup, type}) {
      return store.update('blocks', (blocks) => {
        let newBlock = WritingBlock.new({typeGroup, type});
        blocks.splice(index, 0, newBlock);
      });
    },

    addRelatedBlockAfterBlockAtIndex(store, {index}) {
      return store.update('blocks', (blocks) => {
        // TODO
      });
    },

    addRelatedTextItemBlocksAfterBlockAtIndexWithPastedText(store, {index, pastedText}) {
      // TODO
    },

    moveBlockAtIndexToIndex(store, {fromIndex, toIndex}) {
      return store.update('blocks', (blocks) => {
        let blockToMove = blocks.get(fromIndex);
        blocks = blocks.remove(fromIndex);
        if (blockOriginalIndex < newIndex) {
          toIndex -= 1;
        }
        blocks = blocks.splice(toIndex, 0, blockToMove);

        return blocks;
      });
    },
  },

  WritingBlockActions: 'blocks'
};
