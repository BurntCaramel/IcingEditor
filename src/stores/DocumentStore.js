
import Immutable from 'immutable';


export function getInitialState() {
  return Immutable.Map({
    mainSection: Immutable.Map(),
    supportingSections: Immutable.Map(),

  });
}

export const DocumentActions = {
  setDataForMainSection(store, {data}) {
    return store.set('mainSection', data);
  }
};
