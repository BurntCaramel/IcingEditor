/**
	Copyright 2015 Patrick George Wyndham Smith
*/

var React = require('react');
var Toolbars = require('./EditorToolbars');
var Immutable = require('immutable');
var ContentStore = require('../stores/ContentStore');
var ContentActions = require('../actions/ContentActions');
var ConfigurationStore = require('../stores/ConfigurationStore');
var ReorderingStore = require('../stores/ReorderingStore');
let objectAssign = require('object-assign');

let {
	findParticularSubsectionOptionsInList,
	findParticularBlockTypeOptionsWithGroupAndTypeInMap
} = require('../assistants/TypesAssistant');

let {
	BaseClassNamesMixin
} = require('../ui/ui-mixins');

let KeyCodes = require('../ui/KeyCodes');

var HTMLRepresentationAssistant = require('../assistants/HTMLRepresentationAssistant');


var SubsectionElement = React.createClass({
	mixins: [BaseClassNamesMixin],
	
	getDefaultProps() {
		return {
			baseClassNames: ['subsection']
		}
	},
	
	getInitialState() {
		return {
			active: false
		};
	},
	
	onToggleActive() {
		this.setState({
			active: !this.state.active
		});
	},
	
	render() {
		let {
			type,
			keyPath,
			subsectionsSpecs,
			actions,
			edited
		} = this.props;
		let {
			active
		} = this.state;
		
		let classNameExtensions = [
			`-type-${type}`
		];
		
		if (active) {
			classNameExtensions.push('-active');
		}
		if (edited) {
			classNameExtensions.push('-edited');
		}
		
		var children = [];
		children.push(
			React.createElement(Toolbars.ChangeSubsectionElement, {
				key: 'changeSubsection',
				selectedSubsectionType: type,
				keyPath,
				subsectionsSpecs,
				actions
			})
		)
		
		return React.createElement('div', {
			className: this.getClassNameStringWithExtensions(classNameExtensions)
		}, children);
	}
});

var BlockElement = React.createClass({
	mixins: [BaseClassNamesMixin],
	
	getDefaultProps() {
		return {
			baseClassNames: ['block'],
			allowsEditing: true,
			isReordering: false
		}
	},
	
	getInitialState() {
		return {
			hovered: false
		};
	},
	
	onChooseBlockType(typeGroupOptions, typeExtensionOptions) {
		let {
			keyPath,
			actions
		} = this.props;
		
		actions.changeTypeOfBlockAtKeyPath(typeGroupOptions.get('id'), typeExtensionOptions.get('id'), keyPath);
	},
	
	onCreateBlockOfType(typeGroupOptions, typeExtensionOptions) {
		let {
			keyPath,
			actions
		} = this.props;
		
		actions.insertBlockOfTypeAfterBlockAtKeyPath(typeGroupOptions.get('id'), typeExtensionOptions.get('id'), keyPath);
	},
	
	focusOnForReordering(event) {
		let {
			keyPath,
			actions
		} = this.props;
		
		actions.focusOnBlockAtKeyPathForReordering(keyPath);
	},
	
	keepInCurrentSpot(event) {
		let {
			keyPath,
			actions
		} = this.props;
		
		actions.keepFocusedBlockForReorderingInCurrentSpot();
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
			blockTypeGroups,
			blockGroupIDsToTypesMap,
			edited,
			editedTextItemIdentifier,
			editedTextItemKeyPath,
			allowsEditing,
			isReordering,
			isFocusedForReordering,
			anotherBlockIsFocusedForReordering
		} = props;
		var blockType = props.type;
		
		var classNameExtensions = [
			`-${typeGroup}`,
			//`-${typeGroup}-${blockType}`, // HAS REALLY WEIRD BUG IN WEBKIT? second - disappears sometimes.
			("-" + [typeGroup, blockType].join("-")), // So, this instead.
			`-inSubsection-${subsectionType}`
		];
		
		var blockTypeOptions = findParticularBlockTypeOptionsWithGroupAndTypeInMap(
			typeGroup, blockType, blockGroupIDsToTypesMap
		);
		
		var childrenInfo = {};
		var children;
		if (typeGroup === 'media' || typeGroup === 'particular') {
			var hasHTMLRepresentation = false;
			// http://www.burntcaramel.com/images/stylised-name.png
			let blockValue = block.get('value', Immutable.Map());
			
			if (blockTypeOptions) {
				var HTMLRepresentation = blockTypeOptions.get('innerHTMLRepresentation');
				if (HTMLRepresentation) {
					hasHTMLRepresentation = true;
					let valueForRepresentation = Immutable.Map({
						'fields': blockValue
					});
					
					let elementsForHTMLRepresentation = HTMLRepresentationAssistant.createReactElementsForHTMLRepresentationAndValue(
						HTMLRepresentation, valueForRepresentation
					);
					
					var tagNameForBlock = blockTypeOptions.get('outerHTMLTagName', 'div');
					
					children = [
						React.createElement(tagNameForBlock, {
							key: 'HTMLRepresentation',
							className: 'block-' + typeGroup + '-' + blockType + '-HTMLRepresentation'
						}, elementsForHTMLRepresentation)
					];
				}
			}
			
			if (!hasHTMLRepresentation) {
				children = [
					React.createElement('div', {
						key: 'noRepresentationForContent',
						className: 'block-noRepresentationForContent'
					}, '(No Preview)')
				];
			}
		}
		else if (typeGroup === 'text') {
			var textItemsKeyPath = keyPath.concat('textItems');
			let textItemElements = EditorElementCreator.reactElementsWithTextItems(
				props.textItems, {
					keyPath: textItemsKeyPath, actions, block, blockTypeGroup: typeGroup, blockType, blockTypeOptions, traitSpecs, editedTextItemIdentifier,
					outputInfo: childrenInfo, allowsEditing
				}
			);
			
			if (textItemElements.length === 0) {
				classNameExtensions.push(
					'-textItemsIsEmpty'
				);
				textItemElements = [
					React.createElement('span', {
						className: 'noItemsPlaceholder text',
						key: 'noItems'
					})
				];
			}
			
			children = [
				React.createElement('div', {
					key: 'textItems',
					className: this.getChildClassNameStringWithSuffix('_textItems')
				}, textItemElements)
			];
		}
		
		var toolbarActions = {
			onChooseBlockType: this.onChooseBlockType,
			onCreateBlockOfType: this.onCreateBlockOfType,
			focusOnForReordering: this.focusOnForReordering,
			keepInCurrentSpot: this.keepInCurrentSpot
		};
		
		children.push(
			React.createElement(Toolbars.BlockToolbar, {
				key: 'blockToolbar',
				chosenBlockTypeGroup: typeGroup,
				chosenBlockType: blockType,
				blockTypeGroups,
				blockGroupIDsToTypesMap,
				actions: toolbarActions,
				isReordering,
				isFocusedForReordering,
				anotherBlockIsFocusedForReordering
			})
		);
		
		if (edited) {
			if (typeGroup === 'particular' || typeGroup === 'media') {
				children.push(
					React.createElement(Toolbars.ParticularEditor, {
						key: 'particularEditor',
						block,
						typeGroup,
						type: blockType,
						blockTypeGroups,
						blockGroupIDsToTypesMap: blockGroupIDsToTypesMap,
						traitSpecs,
						traits: block.get('traits', Immutable.Map()).toJS(),
						actions,
						keyPath
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
			onClick: allowsEditing ? this.beginEditing : null,
			onMouseEnter: this.onMouseEnter,
			onMouseLeave: this.onMouseLeave
		}, children);
	}
});

var TextItem = React.createClass({
	mixins: [BaseClassNamesMixin],
	
	getDefaultProps: function() {
		return {
			allowsEditing: true,
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
		let {
			actions,
			keyPath
		} = this.props;
		actions.editTextItemWithKeyPath(keyPath);
		
		event.stopPropagation(); // Don't bubble to block
	},
	
	render: function() {
		var {
			text,
			traits,
			traitSpecs,
			block,
			blockTypeGroup,
			blockType,
			blockTypeOptions,
			actions,
			edited,
			allowsEditing
		} = this.props;
		
		var classNameExtensions = [];
		var dataAttributes = [];
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
					text,
					traits,
					traitSpecs,
					block,
					blockTypeGroup,
					blockType,
					blockTypeOptions,
					actions
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
			onClick: allowsEditing ? this.beginEditing : null
		}, contentChildren);
	}
});



var EditorElementCreator = {};

EditorElementCreator.BlockElement = BlockElement;
EditorElementCreator.TextItem = TextItem;

EditorElementCreator.reactElementsWithTextItems = function(
	textItems, {keyPath, actions, block, blockTypeGroup, blockType, blockTypeOptions, traitSpecs, editedTextItemIdentifier, outputInfo, allowsEditing}
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
				blockTypeOptions,
				traitSpecs,
				actions,
				allowsEditing
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

EditorElementCreator.BlocksElement = React.createClass({
	mixins: [BaseClassNamesMixin],
	
	getDefaultProps: function() {
		return {
			baseClassNames: ['documentSection_blocks', 'blocks']
		};
	},
	
	render() {
		let {
			blocksImmutable,
			specsImmutable,
			blockTypeGroups,
			editedBlockIdentifier,
			editedBlockKeyPath,
			editedTextItemIdentifier,
			editedTextItemKeyPath,
			isReordering,
			focusedBlockIdentifierForReordering,
			focusedBlockKeyPathForReordering,
			actions
		} = this.props;
		
		var classNameExtensions = [];
		
		let subsectionsSpecs = specsImmutable.get('subsectionTypes', Immutable.List());
		let blockGroupIDsToTypesMap = specsImmutable.get('blockTypesByGroup', Immutable.Map());
		let traitSpecs = specsImmutable.get('traitTypes', Immutable.List());
	
		let currentSubsectionType = specsImmutable.get('defaultSubsectionType', 'normal');
		let currentSubsectionChildIndex = 0;
	
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
				subsectionsSpecs,
				traitSpecs,
				blockTypeGroups,
				blockGroupIDsToTypesMap,
				edited: (blockIdentifier == editedBlockIdentifier),
				editedBlockIdentifier,
				editedBlockKeyPath,
				editedTextItemIdentifier,
				editedTextItemKeyPath,
				allowsEditing: !isReordering,
				isReordering,
				isFocusedForReordering: (blockIdentifier == focusedBlockIdentifierForReordering),
				anotherBlockIsFocusedForReordering: (
					focusedBlockIdentifierForReordering != null && blockIdentifier != focusedBlockIdentifierForReordering
				),
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
	
		let focusedBlockIndexForReordering = null;
		if (focusedBlockKeyPathForReordering) {
			focusedBlockIndexForReordering = ContentStore.getIndexForObjectKeyPath(focusedBlockKeyPathForReordering);
		}
		
		let createBlockOfTypeAtIndex = function(blockIndex, typeGroupOptions, typeExtensionOptions) {
			actions.insertBlockOfTypeAtIndex(typeGroupOptions.get('id'), typeExtensionOptions.get('id'), blockIndex);
		};
	
		var elements = [];
		var blockCount = blocksImmutable.count();
		var previousBlockWasSubsection = false;
		for (var blockIndex = 0; blockIndex < (blockCount + 1); blockIndex++) {
			var blockTypeGroup = blocksImmutable.getIn([blockIndex, 'typeGroup']);
			var currentBlockIsSubsection = (blockTypeGroup === 'subsection');
			
		
			if (isReordering) {
				let hidden = true;
				if (focusedBlockIndexForReordering !== null) {
					if (focusedBlockIndexForReordering !== blockIndex && (focusedBlockIndexForReordering + 1) !== blockIndex) {
						hidden = false;
					}
				}
			
				elements.push(
					React.createElement(Toolbars.RearrangeBlockMoveHere, {
						key: `moveHere-${blockIndex}`,
						followingBlockIndex: blockIndex,
						actions,
						hidden
					})	
				);
			}
			else {
				elements.push(
					React.createElement(Toolbars.AddBlockElement, {
						key: `addBlock-before${blockIndex}`,
						blockTypeGroups,
						blockGroupIDsToTypesMap,
						onCreateBlockOfType: createBlockOfTypeAtIndex.bind(null, blockIndex)
					})
				);
				
				if (!currentBlockIsSubsection && !previousBlockWasSubsection) {
					elements.push(
						React.createElement(Toolbars.ChangeSubsectionElement, {
							key: `changeSubsection-${blockIndex}`,
							isCreate: true,
							followingBlockIndex: blockIndex,
							subsectionsSpecs,
							actions
						})	
					);
				}
			}
		
			previousBlockWasSubsection = currentBlockIsSubsection;
		
			let blockElement = elementsForBlocks.get(blockIndex);
			if (blockElement) {
				elements.push(blockElement);
			}
		}
	
		/*
		if (!isReordering) {	
			elements.push(
				React.createElement(Toolbars.AddBlockElement, {
					key: `addBlock-end`,
					addAtEnd: true,
					blockTypeGroups,
					blockGroupIDsToTypesMap,
					onCreateBlockOfType: createBlockOfTypeAtIndex.bind(null, blockCount)
				})
			);
		}*/
		
		var isEditingBlock = (editedBlockIdentifier != null);
		if (isEditingBlock) {
			classNameExtensions.push('-hasEditedBlock');
		}
		
		return React.createElement('div', {
			className: this.getClassNameStringWithExtensions(classNameExtensions)
		}, elements);
	}
})

EditorElementCreator.SectionElement = React.createClass({
	mixins: [BaseClassNamesMixin],
	
	getDefaultProps() {
		return {
			baseClassNames: ['document_section'],
			documentID: null,
			sectionID: null,
			contentImmutable: null,
			specsImmutable: null,
			actions: {},
			editedBlockIdentifier: null,
			editedBlockKeyPath: null,
			editedTextItemIdentifier: null,
			editedTextItemKeyPath: null,
			isReordering: false,
			focusedBlockIdentifierForReordering: null,
			focusedBlockKeyPathForReordering: null,
			showSectionTitle: false
		};
	},
	
	getInitialState() {
		return {
			editingTitle: false
		}
	},
	
	onClick(event) {
		event.stopPropagation();
		
		//if (event.target === React.findDOMNode(this)) {
			console.log('main element clicked', event);
		
			let actions = this.props.actions;
			actions.finishEditing();
		//}
	},
	
	editTitle(event) {
		this.setState({
			editingTitle: true
		})
	},
	
	onTitleChanged(event) {
		
	},
	
	onKeyPress(event) {
		let actions = this.props.actions;
		
		/*if (event.which === KeyCodes.ReturnOrEnter) {
			actions.insertRelatedBlockAfterEditedBlock();
		}*/
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
			sectionID,
			contentImmutable,
			specsImmutable,
			blockTypeGroups,
			editedBlockIdentifier,
			editedBlockKeyPath,
			editedTextItemIdentifier,
			editedTextItemKeyPath,
			isReordering,
			focusedBlockIdentifierForReordering,
			focusedBlockKeyPathForReordering,
			actions,
			showSectionTitle
		} = this.props;
		let {
			editingTitle
		} = this.state;
		
		let blocksImmutable = contentImmutable.get('blocks');
		var classNames = ['blocks'];
		var elements = [];
		
		if (showSectionTitle) {
			if (editingTitle && false) {
				elements.push(React.createElement('input', {
					key: 'editedTitle',
					value: sectionID,
					onChange: this.onTitleChanged,
					className: this.getChildClassNameStringWithSuffix('_editedTitle')
				}));
			}
			else {
				elements.push(React.createElement('h3', {
					key: 'title',
					className: this.getChildClassNameStringWithSuffix('_title'),
					onClick: this.editTitle
				}, sectionID));
			}
		}
		
		elements.push(
			React.createElement(EditorElementCreator.BlocksElement, {
				key: 'blocks',
				baseClassNames: this.getChildClassNamesWithSuffix('_blocks'),
				blocksImmutable,
				specsImmutable,
				blockTypeGroups,
				editedBlockIdentifier,
				editedBlockKeyPath,
				editedTextItemIdentifier,
				editedTextItemKeyPath,
				isReordering,
				focusedBlockIdentifierForReordering,
				focusedBlockKeyPathForReordering,
				actions
			})
		);
	
		return React.createElement('div', {
			className: this.getClassNameStringWithExtensions(),
			onClick: this.onClick,
			onKeyPress: this.onKeyPress
		}, elements);
	}
});

EditorElementCreator.DocumentSectionsElement = React.createClass({
	getDefaultProps() {
		return {
			documentID: null,
			documentSections: null,
			specs: null,
			actions: {},
			focusedSectionID: null,
			editedBlockIdentifier: null,
			editedBlockKeyPath: null,
			editedTextItemIdentifier: null,
			editedTextItemKeyPath: null,
			isReordering: false,
			focusedBlockIdentifierForReordering: null,
			focusedBlockKeyPathForReordering: null
		};
	},
	
	render() {
		let {
			documentID,
			documentSections,
			focusedSectionID,
			specs,
			blockTypeGroups,
			editedBlockIdentifier,
			editedBlockKeyPath,
			editedTextItemIdentifier,
			editedTextItemKeyPath,
			isReordering,
			focusedBlockIdentifierForReordering,
			focusedBlockKeyPathForReordering,
		} = this.props;
		
		let documentActions = ContentActions.getActionsForDocument(documentID);
		
		let writingElements = [];
		let catalogElements = [];
		
		documentSections.forEach(function(sectionContent, sectionID) {
			var sectionProps = {
				key: sectionID,
				documentID,
				sectionID,
				contentImmutable: documentSections.get(sectionID),
				specsImmutable: specs,
				blockTypeGroups,
				isReordering,
				actions: ContentActions.getActionsForDocumentSection(documentID, sectionID),
				showSectionTitle: true
			};
			if (sectionID == focusedSectionID) {
				objectAssign(sectionProps, {
					editedBlockIdentifier,
					editedBlockKeyPath,
					editedTextItemIdentifier,
					editedTextItemKeyPath,
					focusedBlockIdentifierForReordering,
					focusedBlockKeyPathForReordering,
				});
			}
			
			let sectionElement = React.createElement(EditorElementCreator.SectionElement, sectionProps);
			
			let isExternal = sectionContent.get('isExternal', false);
			if (isExternal) {
				let isLoading = true;	
			}
			
			let sectionType = sectionContent.get('type', 'writing');
			if (sectionType === 'writing') {
				writingElements.push(sectionElement);
			}
			else if (sectionType === 'catalog') {
				catalogElements.push(sectionElement);
			}
		});
		
		
		if (ConfigurationStore.getWantsMultipleSectionsFunctionality()) {
			writingElements.push(
				React.createElement(Toolbars.CreateSectionElement, {
					key: 'createWritingSection',
					type: 'writing',
					onCreateNewSection() {
						documentActions.createNewWritingSection()
					},
					onAddExternalSection() {
						documentActions.addExternalWritingSection()
					}
				})
			);
		}
		
		if (ConfigurationStore.getWantsCreateCatalogsFunctionality()) {
			catalogElements.push(
				React.createElement(Toolbars.CreateSectionElement, {
					key: 'createLinkCatalog',
					type: 'catalogLinks',
					onCreateNewSection() {
						documentActions.createNewCatalogSection('link')
					},
					onAddExternalSection() {
						documentActions.addExternalCatalogSection('link')
					}
				}),
				
				React.createElement(Toolbars.CreateSectionElement, {
					key: 'createElementCatalog',
					type: 'catalogElements',
					onCreateNewSection() {
						documentActions.createNewCatalogSection('element')
					},
					onAddExternalSection() {
						documentActions.addExternalCatalogSection('element')
					}
				})
			);
		}
		
		
		return React.createElement('div', {
			className: 'documentSections',
		}, [
			React.createElement('section', {
				key: 'writingSections',
				className: 'writingSections'
			}, writingElements),
			React.createElement('section', {
				key: 'catalogSections',
				className: 'catalogSections'
			}, catalogElements)
		]);
	}
});

module.exports = EditorElementCreator;