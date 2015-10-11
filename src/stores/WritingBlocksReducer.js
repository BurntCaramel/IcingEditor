import Immutable from 'immutable';
import WritingBlockReducer from './WritingBlockReducer';


export function getInitialState({ }) {
  return Immutable.List();
}

function textLinesForPastedText(pastedText) {
  // Conform line breaks into just one format: \n
  pastedText = pastedText.replace(/\r\n/g, "\n");
  pastedText = pastedText.replace(/\r/g, "\n");
  // Split string into an array of lines
  let textLines = pastedText.split("\n");
  let whiteSpaceRE = /^[\s\n]*$/;
  // Remove blank lines
  return textLines.filter(function(paragraphText) {
    if (whiteSpaceRE.test(paragraphText)) {
      return false;
    }

    return true;
  });
}


function addBlockAfterBlock(state, { block, afterIndex }) {;
  return state.splice(afterIndex + 1, 0, block);
}


export const WritingBlockActions = {
  insertNewBlock(state, { index, typeGroup, type }) {
    return state.splice(index, 0, WritingBlockReducer.getInitialState({
      typeGroup,
			type
    }));
  },

  addRelatedBlockAfterBlock(state, { afterIndex }) {
    const currentBlock = state.get(afterIndex);
    const newBlock = WritingBlockReducer.createSimilarBlock({ block: currentBlock });

    return state.splice(afterIndex + 1, 0, newBlock);
  },

  addRelatedTextItemBlockAfterBlockWithPastedText(state, { afterIndex, pastedText }) {
    const textLines = textLinesForPastedText(pastedText);
    const currentBlock = state.get(afterIndex);

    let newBlocks = textLines.map(paragraphText =>
			WritingBlockReducer.createSimilarBlock({
        block: currentBlock,
        textItems: Immutable.List([
          createTextItem({ text: paragraphText })
        ])
      });
		);

    return state.splice(afterIndex + 1, 0, newBlocks);
  },

  changeTypeOfBlock(state, { index, typeGroup, type }) {
    return state.update(index, block =>
      WritingBlockReducer.changeType(block, { typeGroup, type })
    });
  },

  removeBlock(state, { index }) {
    return state.remove(index);
  },

  joinBlockWithPrevious(state, { index }) {
    if (index === 0) {
      return false;
    }

    const currentBlock = state.get(index);

    const currentTypeGroup = currentBlock.get('typeGroup');
    if (!WritingBlockReducer.blockTypeGroupHasTextItems(currentTypeGroup)) {
      return false;
    }

    const precedingIndex = index - 1;
    const precedingBlock = state.get(precedingIndex);
    const precedingTypeGroup = precedingBlock.get('typeGroup');
    if (!WritingBlockReducer.blockGroupTypeHasTextItems(precedingTypeGroup)) {
      return false;
    }

    const followingTextItems = currentBlock.get('textItems');

    state = state.update(precedingIndex, block =>
      block.update('textItems', textItems =>
        textItems.concat(followingTextItems)
      )
    );

    state = state.remove(index);

    return state;
  },

  moveBlock(state, { fromIndex, toIndex }) {
    let blockToMove = state.get(fromIndex);
    state = state.remove(fromIndex);
    if (fromIndex < toIndex) {
      toIndex -= 1;
    }
    return state.splice(toIndex, 0, blockToMove);
  },
};
