var AppDispatcher = require('../app-dispatcher');
var Immutable = require('immutable');
let objectAssign = require('object-assign');
var MicroEvent = require('microevent');
var ConfigurationStore = require('./ConfigurationStore');
var qwest = require('qwest');

var ContentActionsEventIDs = require('../actions/ContentActionsEventIDs');
var specsEventIDs = ContentActionsEventIDs.specs;


var specActivityByURL = Immutable.Map({});
var specContentByURL = Immutable.Map({});

var SpecsStore = {
	on: MicroEvent.prototype.bind,
	trigger: MicroEvent.prototype.trigger,
	off: MicroEvent.prototype.unbind
};


function isLoadingSpecWithURL(specURL) {
	var isLoading = specActivityByURL.getIn([specURL, 'isLoading'], false);
	return isLoading;
};
	
function setLoadingSpecWithURL(specURL, isLoading) {
	var isLoadingCurrently = isLoadingSpecWithURL(specURL);
	if (isLoadingCurrently === isLoading) {
		return;
	}
	
	specActivityByURL = specActivityByURL.setIn([specURL, 'isLoading'], isLoading);
	
	SpecsStore.trigger('isLoadingDidChangeForSpecWithURL', specURL, isLoading);
};

function getSpecWithURL(specURL) {
	return specContentByURL.get(specURL);
}

function setContentForSpecWithURL(specURL, specContent) {
	specContentByURL = specContentByURL.set(specURL, specContent);
	
	SpecsStore.trigger('didChangeContentForSpecWithURL', specURL);
}

function receiveLoadedContentForSpecWithURL(specURL, specContentJSON) {
	let specContent = Immutable.fromJS(specContentJSON);
	setContentForSpecWithURL(specURL, specContent);
	SpecsStore.trigger('didLoadContentForSpecWithURL', specURL);
}
	
function loadSpecWithURL(specURL) {
	console.log('loadSpecWithURL', specURL);
	var isLoading = isLoadingSpecWithURL(specURL);
	if (isLoading) {
		return;
	}
	
	let loadURL;
	
	var actionURL = ConfigurationStore.getActionURL('specs/');
	if (actionURL) {
		loadURL = actionURL + specURL + '/';
	}
	else {
		loadURL = specURL;
	}
	
	setLoadingSpecWithURL(specURL, true);
	
	qwest.get(loadURL, null, {
		cache: true,
		dataType: 'json',
		responseType: 'json'
	})
	.then(function(contentBySpecsURLJSON) {
		receiveLoadedContentForSpecWithURL(specURL, contentBySpecsURLJSON);
	})
	.catch(function(message) {
		console.error(`Failed to load specs with URL ${specURL} ${message}`);
		SpecsStore.trigger('loadContentDidFailForSpecWithURLWithMessage', specURL, message);
	})
	.complete(function() {
		setLoadingSpecWithURL(specURL, false);
	});
};

function hasLoadedAllSpecsWithURLs(specURLs, {loadIfNeeded = false} = {}) {
	let specURLsImmutable = Immutable.List(specURLs);
	return specURLsImmutable.every(function(specURL) {
		let hasLoaded = getSpecWithURL(specURL) != null;
		if (!hasLoaded && loadIfNeeded) {
			loadSpecWithURL(specURL);
		}
		return hasLoaded;
	});
}

function getCombinedSpecsWithURLs(specURLs, {prefixWithSpecsIdentifier = false} = {}) {
	let specURLsImmutable = Immutable.List(specURLs);
	let loadedSpecsContents = specURLsImmutable.map(function(specURL) {
		return getSpecWithURL(specURL);
	});
	
	if (!loadedSpecsContents.every(function(value) {
		return value != null;
	})) {
		return null;
	}
	
	let combinedSpecsContent = Immutable.fromJS({
		"icingStandard": {"id": "burnticing", "version": "0.1.0"},
		"isCombined": true,
		"subsectionTypes": [],
		"blockTypesByGroup": {},
		"traitTypes": []
	}).asMutable();
	
	loadedSpecsContents.forEach(function(specContent) {
		specContent.forEach(function(value, key) {
			// White-list keys
			if (!combinedSpecsContent.has(key)) {
				return;
			}
			
			combinedSpecsContent.update(key, function(currentValue) {
				if (Immutable.Iterable.isIndexed(currentValue)) {
					return currentValue.concat(value);
				}
				else if (key === 'blockTypesByGroup') {
					return currentValue.withMutations(function(currentValue) {
						value.forEach(function(blockTypes, groupID) {
							currentValue.update(groupID, Immutable.List(), function(currentBlockTypes) {
								return currentBlockTypes.concat(blockTypes);
							});
						});
					});
				}
			});
		});
	});
	
	return combinedSpecsContent.asImmutable();
}


SpecsStore.dispatchToken = AppDispatcher.register( function(payload) {
	switch (payload.eventID) {
		case specsEventIDs.loadSpecsWithURLs:
			payload.specsURL.forEach(function(specsURL) {
				loadSpecWithURL(specsURL);
			});
			break;
	}
});

// Public methods
objectAssign(SpecsStore, {
	isLoadingSpecWithURL,
	loadSpecWithURL,
	getSpecWithURL,
	hasLoadedAllSpecsWithURLs,
	setContentForSpecWithURL,
	getCombinedSpecsWithURLs
});

module.exports = SpecsStore;