
import { DesignationRecord } from '../actions/DesignationSetActions';

export function getInitialState({}) {
  return Immutable.Map();
}

export const DesignationSetActions = {
  add(state, { identifier, title }) {
    return state.set(
      identifier,
      new DesignationRecord({
        identifier,
        title
      })
    );
  }

  changeTitle(state, { identifier, title }) {
    return state.update(
      identifier,
      (record) => {
        return record.set('title', title);
      }
    );
  }

  remove(state, { identifier }) {
    return state.remove(
      identifier
    );
  }

  introspection: {
    getDesignationRecordsSortedAlphabetically(state, { ascending }) {
      const comparator = ascending ?
        (valueA, valueB) => {
          valueA.title.localeCompare(valueB.title);
        }
        :
        (valueA, valueB) => {
          valueB.title.localeCompare(valueA.title);
        }
      ;

      return state.sort(comparator);
    }
  }
}
