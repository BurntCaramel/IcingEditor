var React = require('react');
var Toolbars = require('./editor-toolbars');
var Immutable = require('immutable');
var ContentStore = require('../stores/store-content.js');
var SettingsStore = require('../stores/store-settings.js');

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
			baseClassNames: ['block']
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
		
		var props = this.props;
		
		// If already editing, no need to do anything.
		if (props.edited) {
			return;
		}
		
		var typeGroup = props.typeGroup;
		var type = props.type;
		var actions = props.actions;
		var keyPath = props.keyPath;
		
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
			edited
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
			// http://www.burntcaramel.com/images/stylised-name.png
			var value = block.get('value', Immutable.Map());
			var HTMLRepresentation = blockTypeOptions.get('innerHTMLRepresentation');
			if (HTMLRepresentation) {
				var elementsForHTMLRepresentation = HTMLRepresentationAssistant.createReactElementsForHTMLRepresentationAndValue(
					HTMLRepresentation, value
				);
				children = [
					React.createElement('div', {
						className: 'block-' + typeGroup + '-' + blockType + '-HTMLRepresentation'
					}, elementsForHTMLRepresentation)
				];
			}
			else {
				children = [
					React.createElement('div', {
						className: 'block-noRepresentationForContent'
					}, '(No HTML Representation)')
				];
			}
		}
		else {
			var textItemsKeyPath = keyPath.concat('textItems');
			children = EditorElementCreator.reactElementsWithTextItems(
				props.textItems, textItemsKeyPath, actions, block, typeGroup, blockType, traitSpecs, childrenInfo
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
				blockGroupIDsToTypesMap: blockGroupIDsToTypesMap,
				actions: toolbarActions
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
		}
		
		if (edited) {
			classNameExtensions.push('-edited');
		}
		else if (state.hovered) {
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

EditorElementCreator.reactElementsWithTextItems = function(textItems, keyPath, actions, block, blockTypeGroup, blockType, traitSpecs, outputInfo) {
	if (textItems) {
		var editedTextItemIdentifier = actions.getEditedTextItemIdentifier();
		
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

EditorElementCreator.reactElementsWithBlocks = function(blocksImmutable, actions, specsImmutable) {
	var blockGroupIDsToTypesMap = specsImmutable.get('blockTypesByGroups', Immutable.Map());
	var traitSpecs = specsImmutable.get('traits', Immutable.List());
	
	var editedBlockIdentifier = actions.getEditedBlockIdentifier();
	var editedTextItemIdentifier = actions.getEditedTextItemIdentifier();
	
	var currentSubsectionType = specsImmutable.get('defaultSectionType', 'normal');
	var currentSubsectionChildIndex = 0;
	
	var elementsForBlocks = blocksImmutable.map(function(blockImmutable, blockIndex) {
		var blockIdentifier = blockImmutable.get('identifier');
		var typeGroup = blockImmutable.get('typeGroup');
		var type = blockImmutable.get('type');
		var props = {
			key: blockIdentifier,
			block: blockImmutable,
			typeGroup: typeGroup,
			type: type,
			subsectionType: currentSubsectionType,
			subsectionChildIndex: currentSubsectionChildIndex,
			actions: actions,
			traitSpecs: traitSpecs,
			blockGroupIDsToTypesMap: blockGroupIDsToTypesMap,
			keyPath: ['blocks', blockIndex]
		};
		
		if (typeGroup === 'text') {
			props.textItems = blockImmutable.get('textItems', Immutable.List()).toJS();
		}
		if (blockIdentifier === editedBlockIdentifier) {
			props.edited = true;
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
			elements.push(
				/*React.createElement(CreateSubsectionElement, {
					followingBlockIndex: blockIndex,
					actions: actions
				})*/
				React.createElement(Toolbars.ChangeSubsectionElement, {
					isCreate: true,
					followingBlockIndex: blockIndex,
					actions: actions
				})	
			);
		}
		
		previousBlockWasSubsection = currentBlockIsSubsection;
		
		elements.push(elementsForBlocks.get(blockIndex));
	}
	
	return elements;
};

EditorElementCreator.MainElement = React.createClass({
	getDefaultProps: function() {
		return {
			contentImmutable: null,
			specsImmutable: null,
			actions: {}
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
	
	updateTextItemEditorPosition: function() {
		var masterNode = this.getDOMNode();
		var editedTextItemElement = masterNode.getElementsByClassName('textItem-edited')[0];
		var textItemEditorElement = masterNode.getElementsByClassName('textItemEditor')[0];
		
		if (editedTextItemElement && textItemEditorElement) {
			var offsetTop = editedTextItemElement.offsetTop;
			textItemEditorElement.style.top = offsetTop + 'px';
		}
	},
	
	componentDidMount: function() {
		ContentStore.on('contentChangedForDocumentSection', this.contentChangedForDocumentSection);
		ContentStore.on('editedItemChangedForDocumentSection', this.contentChangedForDocumentSection);
		ContentStore.on('editedBlockChangedForDocumentSection', this.contentChangedForDocumentSection);
	},
	
	componentWillUnmount: function() {  
		ContentStore.off('contentChangedForDocumentSection', this.contentChangedForDocumentSection);
		ContentStore.off('editedItemChangedForDocumentSection', this.contentChangedForDocumentSection);
		ContentStore.off('editedBlockChangedForDocumentSection', this.contentChangedForDocumentSection);
	},
	
	componentDidUpdate: function(prevProps, prevState) {
		this.updateTextItemEditorPosition();
	},
	
	contentChangedForDocumentSection: function(documentID, sectionID) {
		var props = this.props;
		if (
			(documentID === props.documentID) ||
			(sectionID === props.sectionID)
		) {
			this.forceUpdate();
		}
	},
	
	render: function() {
		var props = this.props;
		var contentImmutable = props.contentImmutable;
		var specsImmutable = props.specsImmutable;
		var actions = props.actions;
		
		var classNames = ['blocks'];
	
		var elements = [];
	
		if (contentImmutable && contentImmutable.has('blocks')) {
			var blocksImmutable = contentImmutable.get('blocks');
			elements = EditorElementCreator.reactElementsWithBlocks(blocksImmutable, actions, specsImmutable);
		}
		else {
			elements = React.createElement('div', {
				key: 'loadingIndicator'
			}, 'Loading…');
		}
	
		var isEditingBlock = (actions.getEditedBlockIdentifier() != null);
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