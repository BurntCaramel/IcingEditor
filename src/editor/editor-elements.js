var React = require('react');
var Toolbars = require('./editor-toolbars');
var Immutable = require('immutable');
var ContentStore = require('../stores/store-content.js');
var SettingsStore = require('../stores/store-settings.js');
var ReorderingStore = require('../stores/ReorderingStore');

var BlockTypesAssistant = require('../assistants/block-types-assistant');
var findParticularBlockTypeOptionsWithGroupAndTypeInList = BlockTypesAssistant.findParticularBlockTypeOptionsWithGroupAndTypeInList;

let {
	BaseClassNamesMixin
} = require('../ui/ui-mixins');

let {
	KeyCodes
} = require('../ui/ui-constants');

var HTMLRepresentationAssistant = require('../assistants/html-representation-assistant');


var SubsectionElement = React.createClass({
	getInitialState: function() {
		return {
			active: false
		};
	},
	
	onToggleActive: function() {
		this.setState({
			active: !this.state.active
		});
	},
	
	render: function() {
		var props = this.props;
		var state = this.state;
		
		var subsectionType = props.type;
		var keyPath = props.keyPath;
		var actions = props.actions;
		var active = state.active;
		var edited = props.edited;
		
		var classNames = ['subsection', 'subsection-type-' + subsectionType];
		
		var subsectionInfos = SettingsStore.getAvailableSubsectionTypesForDocumentSection();
		var subsectionTitle = null;
		subsectionInfos.some(function(subsectionInfo) {
			if (subsectionInfo.id === subsectionType) {
				subsectionTitle = subsectionInfo.title;
				return true;
			}
		});
		
		if (active) {
			classNames.push('subsection-active');
		}
		if (edited) {
			classNames.push('subsection-edited');
		}
		
		var children = [];
		children.push(
			React.createElement(Toolbars.ChangeSubsectionElement, {
				selectedSubsectionType: subsectionType,
				keyPath: keyPath,
				actions: actions
			})
		)
		
		return React.createElement('div', {
			className: classNames.join(' ')
		}, children);
	}
});

var BlockElement = React.createClass({
	mixins: [BaseClassNamesMixin],
	
	getDefaultProps() {
		return {
			baseClassNames: ['block'],
			isReordering: false
		}
	},
	
	getInitialState() {
		return {
			hovered: false
		};
	},
	
	onChangeChosenBlockType(typeGroupOptions, typeExtensionOptions, event) {
		var props = this.props;
		var actions = props.actions;
		var keyPath = props.keyPath;
		actions.changeTypeOfBlockAtKeyPath(typeGroupOptions.get('id'), typeExtensionOptions.get('id'), keyPath);
	},
	
	beginEditing(event) {
		event.stopPropagation();
		
		// If already editing, no need to do anything.
		if (this.props.edited) {
			return;
		}
		
		let {
			typeGroup,
			type,
			actions,
			keyPath
		} = this.props;
		
		if (typeGroup === 'text') {
			actions.editTextItemBasedBlockWithKeyPathAddingIfNeeded(keyPath);
		}
		else {
			actions.editBlockWithKeyPath(keyPath);
		}
	},
	
	onMouseEnter(event) {
		this.setState({
			hovered: true
		});
	},
	
	onMouseLeave(event) {
		this.setState({
			hovered: false
		});
	},
	
	render() {
		let {
			props,
			state
		} = this;
		
		let {
			block,
			typeGroup,
			subsectionType,
			subsectionChildIndex,
			keyPath,
			actions,
			traitSpecs,
			blockGroupIDsToTypesMap,
			edited,
			editedTextItemIdentifier,
			editedTextItemKeyPath,
			isReordering
		} = props;
		var blockType = props.type;
		
		var classNameExtensions = [
			`-${typeGroup}`,
			`-${typeGroup}-${blockType}`,
			`-inSubsection-${subsectionType}`
		];
		
		var blockTypeOptions = findParticularBlockTypeOptionsWithGroupAndTypeInList(
			typeGroup, blockType, blockGroupIDsToTypesMap
		);
		
		var childrenInfo = {};
		var children;
		if (typeGroup === 'media' || typeGroup === 'particular') {
			var hasHTMLRepresentation = false;
			// http://www.burntcaramel.com/images/stylised-name.png
			var value = block.get('value', Immutable.Map());
			if (blockTypeOptions) {
				var HTMLRepresentation = blockTypeOptions.get('innerHTMLRepresentation');
				if (HTMLRepresentation) {
					hasHTMLRepresentation = true;
					var elementsForHTMLRepresentation = HTMLRepresentationAssistant.createReactElementsForHTMLRepresentationAndValue(
						HTMLRepresentation, value
					);
					children = [
						React.createElement('div', {
							className: 'block-' + typeGroup + '-' + blockType + '-HTMLRepresentation'
						}, elementsForHTMLRepresentation)
					];
				}
			}
			
			if (!hasHTMLRepresentation) {
				children = [
					React.createElement('div', {
						className: 'block-noRepresentationForContent'
					}, '(No Preview)')
				];
			}
		}
		else if (typeGroup === 'text') {
			var textItemsKeyPath = keyPath.concat('textItems');
			children = EditorElementCreator.reactElementsWithTextItems(
				props.textItems, textItemsKeyPath, actions, block, typeGroup, blockType, traitSpecs, editedTextItemIdentifier, childrenInfo
			);
			
			if (children.length === 0) {
				classNameExtensions.push(
					'-textItemsIsEmpty'
				);
				children.push(React.createElement('span'));
			}
		}
		
		var toolbarActions = {
			onToggleActive: this.onToggleActive,
			onChangeChosenBlockType: this.onChangeChosenBlockType
		};
		
		children.push(
			React.createElement(Toolbars.BlockToolbar, {
				key: 'blockToolbar',
				chosenBlockTypeGroup: typeGroup,
				chosenBlockType: blockType,
				blockTypeGroups: SettingsStore.getAvailableBlockTypesGroups(),
				blockGroupIDsToTypesMap,
				actions: toolbarActions,
				isReordering
			})
		);
		
		if (edited) {
			if (typeGroup === 'particular' || typeGroup === 'media') {
				children.push(
					React.createElement(Toolbars.ParticularEditor, {
						key: 'particularEditor',
						block: block,
						typeGroup: typeGroup,
						type: blockType,
						blockTypeGroups: SettingsStore.getAvailableBlockTypesGroups(),
						blockGroupIDsToTypesMap: blockGroupIDsToTypesMap,
						traitSpecs,
						traits: block.get('traits', Immutable.Map()).toJS(),
						actions: actions,
						keyPath: keyPath
					})
				);
			}
			
			classNameExtensions.push('-edited');
		}
		
		if (!edited && state.hovered) {
			classNameExtensions.push('-hover');
		}
		
		return React.createElement('div', {
			className: this.getClassNameStringWithExtensions(classNameExtensions),
			"data-subsection-child-index": (subsectionChildIndex + 1), // Change from zero to one based.
			onClick: this.beginEditing,
			onMouseEnter: this.onMouseEnter,
			onMouseLeave: this.onMouseLeave
		}, children);
	}
});

var TextItem = React.createClass({
	mixins: [BaseClassNamesMixin],
	
	getDefaultProps: function() {
		return {
			baseClassNames: ['textItem'],
			traits: {}
		};
	},
	
	getInitialState: function() {
		return {
			active: false
		};
	},
	
	beginEditing: function(event) {
		var props = this.props;
		var actions = props.actions;
		var keyPath = props.keyPath;
		actions.editTextItemWithKeyPath(keyPath);
		
		event.stopPropagation(); // Don't bubble to block
	},
	
	render: function() {
		var props = this.props;
		var {
			text,
			traits,
			edited
		} = props;
		
		var classNameExtensions = [];
		var id = null;
		
		if (edited) {
			classNameExtensions.push('-edited');
			id = 'icing-textItem-edited';
		}
		
		for (var traitID in traits) {
			if (traits.hasOwnProperty(traitID) && !!traits[traitID]) {
				classNameExtensions.push(`-hasTrait-${traitID}`);
			}
		}
		
		var contentChildren = [];
		
		if (edited) {
			contentChildren.push(
				React.createElement(Toolbars.TextItemEditor, {
					key: 'itemEditor',
					text: text,
					traits: props.traits,
					traitSpecs: props.traitSpecs,
					block: props.block,
					blockTypeGroup: props.blockTypeGroup,
					blockType: props.blockType,
					actions: props.actions
				})
			);
		}
		
		if (typeof text === 'undefined' || text.length === 0 || text === ' ') {
			// Make inline element have some sort of content, to lay out text editor properly.
			// TODO: get multiple spaces
			contentChildren.push(
				React.createElement('span', {
					key: 'text',
					className: 'text',
					dangerouslySetInnerHTML: {
						__html: '&nbsp;'
					}
				})
			);
		}
		else {
			contentChildren.push(
				React.createElement('span', {
					key: 'text',
					className: 'text'
				}, text)
			);
		}
		
		return React.createElement('span', {
			key: 'mainElement',
			id: id,
			className: this.getClassNameStringWithExtensions(classNameExtensions),
			onClick: this.beginEditing
		}, contentChildren);
	}
});
/*
var PlaceholderItem = React.createClass({
	getDefaultProps: function() {
		return {
			traits: {}
		};
	}
});
*/
var EditorElementCreator = {};

EditorElementCreator.BlockElement = BlockElement;
EditorElementCreator.TextItem = TextItem;

EditorElementCreator.reactElementsWithTextItems = function(
	textItems, keyPath, actions, block, blockTypeGroup, blockType, traitSpecs, editedTextItemIdentifier, outputInfo
) {
	if (textItems) {
		var editedItem = null;
		
		var elements = textItems.map(function(textItem, textItemIndex) {
			var identifier = textItem.identifier;
			
			var props = {
				key: identifier,
				keyPath: keyPath.concat(textItemIndex),
				identifier,
				block,
				blockTypeGroup,
				blockType,
				traitSpecs,
				actions
			};
	
			if (editedTextItemIdentifier === identifier) {
				props.edited = true;
				editedItem = textItem;
			}
			if (textItem.traits) {
				props.traits = textItem.traits;
			}
			if (textItem.text) {
				props.text = textItem.text;
			}
	
			return React.createElement(TextItem, props);
		});
		/*
		if (editedItem) {
			elements.push(
				React.createElement(Toolbars.TextItemEditor, {
					text: editedItem.text,
					traits: editedItem.traits,
					actions: actions,
					availableTraits: traits,
					key: ('edited-' + editedTextItemIdentifier)
				})
			);
		}
		*/
		if (outputInfo) {
			outputInfo.editedItem = editedItem;
			outputInfo.hasEditedItem = (editedItem !== null);
		}
		
		return elements;
	}
	else {
		return [];
	}
};

EditorElementCreator.reactElementsWithBlocks = function(
	blocksImmutable,
	specsImmutable,
	actions, {
		editedBlockIdentifier,
		editedBlockKeyPath,
		editedTextItemIdentifier,
		editedTextItemKeyPath,
		isReordering = false
	}
) {
	var blockGroupIDsToTypesMap = specsImmutable.get('blockTypesByGroups', Immutable.Map());
	var traitSpecs = specsImmutable.get('traits', Immutable.List());
	
	/*
	if (isReordering) {
		editedBlockIdentifier = null;
		editedTextItemIdentifier = null;
	}
	*/
	
	//var editedBlockIdentifier = actions.getEditedBlockIdentifier();
	//var editedTextItemIdentifier = actions.getEditedTextItemIdentifier();
	
	var currentSubsectionType = specsImmutable.get('defaultSectionType', 'normal');
	var currentSubsectionChildIndex = 0;
	
	var elementsForBlocks = blocksImmutable.map(function(blockImmutable, blockIndex) {
		var blockIdentifier = blockImmutable.get('identifier');
		var typeGroup = blockImmutable.get('typeGroup');
		var type = blockImmutable.get('type');
		var props = {
			key: blockIdentifier,
			block: blockImmutable,
			typeGroup,
			type,
			subsectionType: currentSubsectionType,
			subsectionChildIndex: currentSubsectionChildIndex,
			actions,
			traitSpecs,
			blockGroupIDsToTypesMap,
			edited: (blockIdentifier === editedBlockIdentifier),
			editedBlockIdentifier,
			editedBlockKeyPath,
			editedTextItemIdentifier,
			editedTextItemKeyPath,
			isReordering,
			keyPath: ['blocks', blockIndex]
		};
		
		if (typeGroup === 'text') {
			props.textItems = blockImmutable.get('textItems', Immutable.List()).toJS();
		}
		
		var elementToReturn;
		
		if (typeGroup === 'subsection') {
			elementToReturn = React.createElement(SubsectionElement, props);
			currentSubsectionType = type;
			currentSubsectionChildIndex = 0;
		}
		else {
			elementToReturn = React.createElement(BlockElement, props);
			currentSubsectionChildIndex++;
		}
		
		return elementToReturn;
	});
	
	var elements = [];
	var blockCount = blocksImmutable.count();
	var previousBlockWasSubsection = false;
	for (var blockIndex = 0; blockIndex < blockCount; blockIndex++) {
		var blockTypeGroup = blocksImmutable.getIn([blockIndex, 'typeGroup']);
		var currentBlockIsSubsection = (blockTypeGroup === 'subsection');
		
		if (!currentBlockIsSubsection && !previousBlockWasSubsection) {
			if (isReordering) {
				elements.push(
					React.createElement(Toolbars.RearrangeBlockMoveHere, {
						followingBlockIndex: blockIndex,
						actions: actions
					})	
				);
			}
			else {
				elements.push(
					React.createElement(Toolbars.ChangeSubsectionElement, {
						isCreate: true,
						followingBlockIndex: blockIndex,
						actions: actions
					})	
				);
			}
		}
		
		previousBlockWasSubsection = currentBlockIsSubsection;
		
		elements.push(elementsForBlocks.get(blockIndex));
	}
	
	return elements;
};

EditorElementCreator.MainElement = React.createClass({
	getDefaultProps() {
		return {
			contentImmutable: null,
			specsImmutable: null,
			actions: {},
			isReordering: false
		};
	},
	
	onClick(event) {
		event.stopPropagation();
		
		//console.log('main element clicked', event);
		
		let actions = this.props.actions;
		actions.finishEditing();
	},
	
	onKeyPress(event) {
		let actions = this.props.actions;
		
		if (event.which === KeyCodes.RETURN_OR_ENTER) {
			actions.insertRelatedBlockAfterEditedBlock();
		}
	},
	
	updateTextItemEditorPosition() {
		var masterNode = this.getDOMNode();
		var editedTextItemElement = masterNode.getElementsByClassName('textItem-edited')[0];
		var textItemEditorElement = masterNode.getElementsByClassName('textItemEditor')[0];
		
		if (editedTextItemElement && textItemEditorElement) {
			var offsetTop = editedTextItemElement.offsetTop;
			textItemEditorElement.style.top = offsetTop + 'px';
		}
	},
	
	componentDidUpdate(prevProps, prevState) {
		this.updateTextItemEditorPosition();
	},
	
	render() {
		let {
			contentImmutable,
			specsImmutable,
			actions,
			editedBlockIdentifier,
			editedBlockKeyPath,
			editedTextItemIdentifier,
			editedTextItemKeyPath,
			isReordering
		} = this.props;
		
		var classNames = ['blocks'];
	
		var elements = [];
	
		if (contentImmutable && contentImmutable.has('blocks')) {
			var blocksImmutable = contentImmutable.get('blocks');
			elements = EditorElementCreator.reactElementsWithBlocks(
				blocksImmutable,
				specsImmutable,
				actions, {
					editedBlockIdentifier,
					editedBlockKeyPath,
					editedTextItemIdentifier,
					editedTextItemKeyPath,
					isReordering
				}
			);
		}
		else {
			elements = React.createElement('div', {
				key: 'loadingIndicator'
			}, 'Loading…');
		}
	
		var isEditingBlock = (editedBlockIdentifier != null);
		if (isEditingBlock) {
			classNames.push('blocks-hasEditedBlock')
		}
	
		return React.createElement('div', {
			key: 'blocks',
			className: classNames.join(' '),
			onClick: this.onClick,
			onKeyPress: this.onKeyPress
		}, elements);
	}
});

module.exports = EditorElementCreator;