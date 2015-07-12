
export function insertNewBlockOfTypeAtIndex(store, {index, typeGroup, type}) {
  return store.update('blocks', (blocks) => {
    let newBlock = WritingBlock.new({typeGroup, type});
    blocks.splice(index, 0, newBlock);
  });
},

export function addRelatedBlockAfterBlockAtIndex(store, {index}) {
  return store.update('blocks', (blocks) => {
    // TODO
  });
},

export function addRelatedTextItemBlocksAfterBlockAtIndexWithPastedText(store, {index, pastedText}) {
  // TODO
},

export function moveBlockAtIndexToIndex(store, {fromIndex, toIndex}) {
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
