
export function insertNewBlockOfTypeAtIndex({ index, typeGroup, type }) {
  return { index, typeGroup, type };
}

export function addRelatedBlockAfterBlockAtIndex({ index }) {
  return { index };
}

export function addRelatedTextItemBlocksAfterBlockAtIndexWithPastedText({ index, pastedText }) {
  //return { index, pastedText };
  return arguments[0];
}

export function moveBlockAtIndexToIndex({ fromIndex, toIndex }) {
  return { fromIndex, toIndex };
}
