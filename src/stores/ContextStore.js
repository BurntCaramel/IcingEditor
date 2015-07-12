
import Immutable from 'immutable';


export function getInitialState() {
  return Immutable.Map({
    currentDocumentID: null,
    editedBlockIndex: null,
  });
}

export const ContextActions = {
  setCurrentDocumentID(store, {documentID}) {
    return store.set('currentDocumentID', documentID);
  }
};

export const WritingActions = {
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
};
