// TODO: change to ../config ?
import { getActionURL } from '../stores/ConfigurationStore';


export function setSpecsURLsForDocument({ documentID, specsURLs }) {
  return arguments[0];
}

export function invalidateSpec({ specURL }) {
  return arguments[0];
}

export function beginLoadingSpec({ specURL }) {
  return arguments[0];
}

export function didLoadSpec({ specURL, specJSON }) {
  return arguments[0];
}

export function didFailLoadingSpec({ specURL, error }) {
  return arguments[0];
}

function loadSpec({ specURL }, { dispatch }) {
  let loadURL;

  const actionURL = getActionURL('specs/');
  if (actionURL) {
    loadURL = actionURL + specURL + '/';
  }
  else {
    loadURL = specURL;
  }

  dispatch({
    actionID: 'beginLoadingSpec',
    payload: { specURL }
  });

  qwest.get(loadURL, null, {
    cache: true,
    dataType: 'json',
    responseType: 'json'
  })
  .then((specJSON) => {
    dispatch({
      actionID: 'didLoadSpec',
      payload: didLoadSpec({ specURL, specJSON })
    });
  })
  .catch((message) => {
    console.error(`Failed to load specs with URL ${specURL} ${message}`);
    dispatch({
      actionID: 'didFailLoadingSpec',
      payload: didFailLoadingSpec({ specURL, error: message })
    });
  });
}

export function loadSpecIfNeeded({ specURL }, { dispatch, getConsensus }) {
  if (getConsensus({
    introspectionID: 'needsToLoadSpec',
    payload: { specURL },
    booleanOr: true
  })) {
    loadSpec({ specURL }, { dispatch });
  }
}

export const introspection = {
  needsToLoadSpec({ specURL }) {
    return arguments[0];
  }
}
