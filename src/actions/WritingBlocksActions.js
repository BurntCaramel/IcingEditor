
export function insertNewBlock({ index, typeGroup, type }) {}

export function addRelatedBlockAfterBlock({ afterIndex }) {}

export function addRelatedTextItemBlockAfterBlockWithPastedText({ afterIndex, pastedText }) {}

export function changeTypeOfBlock({ index, typeGroup, type }) {}

export function removeBlock({ index }) {}

export function joinBlockWithPrevious({ index }) {}


export function insertNewSubsection({ index, type }, { currentActionSet }) {
  currentActionSet.insertNewBlock({
    typeGroup: 'subsection',
    index,
    type
  });
}

export function changeTypeOfSubsection({ index, type }, { currentActionSet }) {
  currentActionSet.changeTypeOfBlock({
    index,
    type
  });
}

export function removeSubsection({ index }, { currentActionSet }) {
  currentActionSet.removeBlock({
    index
  });
}


//export function makeBlockFocusForReordering({ index, type }) {}

export function moveBlock({ fromIndex, toIndex }) {}
//export function reorderBlock({ fromIndex, toIndex }) {}
