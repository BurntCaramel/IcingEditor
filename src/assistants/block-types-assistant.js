var BlockTypesAssistant = {
	
};

BlockTypesAssistant.findParticularBlockTypeOptionsWithGroupAndTypeInList = function(chosenBlockTypeGroup, chosenBlockType, blockGroupIDsToTypesMap) {
	// Find options by searching for the particular ID
	var chosenBlockTypeOptions = null;
	var chosenTypesList = blockGroupIDsToTypesMap.get(chosenBlockTypeGroup);
	chosenTypesList.some(function(blockTypeOptions) {
		if (blockTypeOptions.get('id') === chosenBlockType) {
			chosenBlockTypeOptions = blockTypeOptions;
			return true;
		}
	});
	
	return chosenBlockTypeOptions;
};

module.exports = BlockTypesAssistant;