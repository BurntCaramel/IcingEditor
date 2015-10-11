// TODO: change to ../config ?
import { getActionURL } from '../stores/ConfigurationStore';


export function setSpecsURLsForDocument({ documentID, specsURLs }) {}

export function invalidateSpec({ specURL }) {}

export function beginLoadingSpec({ specURL }) {}

export function didLoadSpec({ specURL, specJSON }) {}

export function didFailLoadingSpec({ specURL, error }) {}

function loadSpec({ specURL }, { currentActionSet }) {
  let loadURL;

  /* const actionURL = getConsensus({
    introspectionID: 'loadableURLForSpec',
    payload: { specURL },
    defaultValue: specURL
  }) */

  const actionURL = getActionURL('specs/');
  if (actionURL) {
    loadURL = actionURL + specURL + '/';
  }
  else {
    loadURL = specURL;
  }

  currentActionSet.beginLoadingSpec({ specURL });

  qwest.get(loadURL, null, {
    cache: true,
    dataType: 'json',
    responseType: 'json'
  })
  .then((specJSON) => {
    currentActionSet.didLoadSpec({ specURL, specJSON });
  })
  .catch((message) => {
    console.error(`Failed to load specs with URL ${specURL} ${message}`);
    currentActionSet.didFailLoadingSpec({ specURL, error: message });
  });
}

export function loadSpecIfNeeded({ specURL }, { currentActionSet }) {
  if (currentActionSet.getConsensus.needsToLoadSpec({ specURL }).some()) {
    loadSpec({ specURL }, { currentActionSet });
  }
}

export const introspection = {
  needsToLoadSpec({ specURL }) {}
}
