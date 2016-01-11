import { fromJS } from 'immutable';


export function getInitialState() {
  return fromJS({
    URLToStatuses: {},
    URLToSpecs: {}
  });
}

export const SpecsActions = {
  invalidateSpec(state, { specURL }) {
    return state.deleteIn(['URLToStatuses', specURL]);
  },

  beginLoadingSpec(state, { specURL }) {
    return state.setIn(['URLToStatuses', specURL], fromJS({ loading: true }));
  },

  didLoadSpec(state, { specURL, specJSON }) {
    state = state.setIn(['URLToStatuses', specURL], fromJS({ loaded: true }));
    state = state.setIn(['URLToSpecs', specURL], fromJS(specJSON));
    return state;
  },

  didFailLoadingSpec(state, { specURL, error }) {
    return state.setIn(['URLToStatuses', specURL], fromJS({ error }));
  },

  introspection: {
    specWithURL(state, { specURL }) {
      return state.getIn(['URLToSpecs', specURL]);
    },

    needsToLoadSpec(state, { specURL }) {
      const status = state.get(['URLToStatuses', specURL]);
      return (typeof status === 'undefined') || status.has('error');
    }
  }
}
