export function setSpecsURLsForDocument({ documentID, specsURLs }) {}

export function invalidateSpec({ specURL }) {}

export function beginLoadingSpec({ specURL }) {}

export function didLoadSpec({ specURL, specJSON }) {}

export function didFailLoadingSpec({ specURL, error }) {}

function loadSpec({ specURL, loadingURL }, { currentActionSet: set }) {
	set.beginLoadingSpec({ specURL });

	qwest.get(loadingURL, null, {
		cache: true,
		dataType: 'json',
		responseType: 'json'
	})
	.then((specJSON) => {
		set.didLoadSpec({ specURL, specJSON });
	})
	.catch((message) => {
		console.error(`Failed to load specs with URL ${specURL} ${message}`);
		set.didFailLoadingSpec({ specURL, error: message });
	});
}

export function loadSpecIfNeeded({ specURL }, { currentActionSet }) {
  if (currentActionSet.getConsensus.needsToLoadSpec({ specURL }).some()) {
		const loadingURL = currentActionSet.getConsensus.getLoadingURLForSpec({ specURL }).singleton();
    loadSpec({ specURL, loadingURL }, { currentActionSet });
  }
}

export const introspection = {
	needsToLoadSpec({ specURL }) {},
	getLoadingURLForSpec({ specURL }) {}
};
