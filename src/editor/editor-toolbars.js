var React = require('react');


var TextItemTextArea = React.createClass({
	getInitialState: function() {
		return {
			spaceWasJustPressed: false
		};
	},
	
	onChange: function() {
		var actions = this.props.actions;
		var text = this.refs.textarea.getDOMNode().value;
		actions.setTextForEditedTextItem(text);
	},
	
	hasNoText: function() {
		var text = this.refs.textarea.getDOMNode().value;
		return (text.length === 0);
	},
	
	onKeyDown: function(e) {
		var actions = this.props.actions;
		console.log('key down', e.which);
		if (e.which == 32) { // Space key
			if (this.state.spaceWasJustPressed) {
				actions.addNewTextItemAfterEditedTextItem();
				this.setState({spaceWasJustPressed: false});
				e.preventDefault();
			}
			else {
				this.setState({spaceWasJustPressed: true});
			}
		}
		else {
			this.setState({spaceWasJustPressed: false});
		}
		
		if (false) {
			if (e.which == 8) { // Delete/Backspace key
				if (this.performAction('deleteInsideElement')) {
					e.preventDefault();
				}
			}
			else if (e.which == 9) { // Tab key
				/*if (e.shiftKey)
					this.performAction('editPreviousElement');
				else
					this.performAction('editNextElement');*/
	
				this.performAction('addNewElement');
	
				e.preventDefault();
			}
		}
	},
	
	onKeyPress: function(e) {
		var actions = this.props.actions;
		console.log('key press', e.which);
		if (true) {
			if (e.which == 13) { // Return/enter key.
				if (e.shiftKey) {
					actions.addLineBreakAfterEditedTextItem();
				}
				else {
					if (!this.hasNoText()) {
						actions.addNewTextItemAfterEditedTextItem();
					}
				}
				
				e.preventDefault();
			}
		}
	},
	
	componentDidMount: function() {
		var node = this.getDOMNode();
		node.focus();
	},
	
	render: function() {
		var text = this.props.text;
		
		return React.createElement('textarea', {
			ref: 'textarea',
			value: text,
			className: 'editedTextItemTextArea',
			width: 10,
			height: 20,
			//key: 'textarea',
			onChange: this.onChange,
			onKeyDown: this.onKeyDown,
			onKeyPress: this.onKeyPress
		})
	}
});

var ToolbarButton = React.createClass({
	getDefaultProps: function() {
		return {
			selected: false
		};
	},
	
	render: function() {
		var props = this.props;
		var title = props.title;
		
		var classNames = ['toolbarButton'];
		if (props.className) {
			classNames.push(props.className)
		}
		if (props.selected) {
			classNames.push('toolbarButton-selected')
		}
		
		return React.createElement('button', {
			className: classNames.join(' '),
			onClick: props.onClick
		}, title);
	}
});

var ToolbarDivider = React.createClass({
	render: function() {
		return React.createElement('span', {
			className: 'toolbarDivider'
		}, ' · ');
	}
});

var TextItemAttributesToolbar = React.createClass({
	getDefaultProps: function() {
		return {
			bold: false,
			italic: false,
			link: null
		};
	},
	
	onToggleBold: function() {
		var actions = this.props.actions;
		actions.toggleBoldForEditedTextItem();
	},
	
	onToggleItalic: function() {
		var actions = this.props.actions;
		actions.toggleItalicForEditedTextItem();
	},
	
	onToggleEditLink: function() {
		
	},
	
	onToggleShowIdentifier: function() {
		
	},
	
	onToggleShowTraits: function() {
		
	},
	
	onSplit: function() {
		
	},
	
	render: function() {
		var props = this.props;
		
		return React.createElement('div', {
			className: 'textItemEditor-toolbar'
		}, [
			React.createElement(ToolbarButton, {
				key: ('button-bold'),
				title: 'Bold',
				selected: props.bold,
				onClick: this.onToggleBold
			}),
			React.createElement(ToolbarButton, {
				key: ('button-italic'),
				title: 'Italic',
				selected: props.italic,
				onClick: this.onToggleItalic
			}),
			React.createElement(ToolbarDivider),
			React.createElement(ToolbarButton, {
				key: ('button-link'),
				title: (props.link != null) ? 'Edit Link' : 'Link',
				selected: props.link != null,
				onClick: this.onToggleEditLink
			}),
			React.createElement(ToolbarDivider),
			React.createElement(ToolbarButton, {
				key: ('button-identifier'),
				title: 'Identifier',
				selected: props.identifier != null,
				onClick: this.onToggleShowIdentifier
			}),
			React.createElement(ToolbarButton, {
				key: ('button-split'),
				className: 'textItemEditor-toolbar-split',
				title: 'Split',
				onClick: this.onSplit
			})
		]);
	}
});

var ItemTraitsToolbar = React.createClass({
	getDefaultProps: function() {
		return {
			enabledTraits: {}
		};
	},
	
	onToggleTrait: function(traitID) {
		console.log('toggle trait', traitID);
		var actions = this.props.actions;
		actions.toggleTraitForEditedTextItem(traitID);
	},
	
	render: function() {
		var props = this.props;
		var availableTraits = props.availableTraits;
		var attributes = props.attributes;
		
		var itemsByBlock = availableTraits.itemsByBlock;
		var itemsByAnyBlock = itemsByBlock['*'];
		
		var textItemTraits = itemsByAnyBlock.text;
		var textItemTraitButtons = textItemTraits.map(function(textItemTrait) {
			var traitID = textItemTrait.id;
			var onToggleTrait = this.onToggleTrait.bind(this, traitID);
			return React.createElement(ToolbarButton, {
				key: ('button-' + traitID),
				title: textItemTrait.title,
				selected: attributes[traitID] === true,
				onClick: onToggleTrait
			});
		}, this);
		
		return React.createElement('div', {
			className: 'itemEditor-traits-toolbar',
			key: 'holder'
		}, textItemTraitButtons);
	}
});

var TextItemEditor = React.createClass({
	getDefaultProps: function() {
		return {
			text: '',
			attributes: {},
			availableTraits: {}
		};
	},
	
	render: function() {
		var props = this.props;
		var text = props.text;
		var attributes = props.attributes;
		var actions = props.actions;
		var availableTraits = props.availableTraits;
		
		return React.createElement('div', {
			className: 'textItemEditor',
			id: 'icing-textItemEditor',
			key: 'textItemEditor'
		}, [
			React.createElement(TextItemAttributesToolbar, {
				actions: actions,
				availableTraits: availableTraits,
				bold: attributes.bold,
				italic: attributes.italic,
				key: 'attributesToolbar',
			}),
			React.createElement(TextItemTextArea, {
				text: text,
				actions: actions,
				availableTraits: availableTraits,
				key: 'textAreaHolder'
			}),
			React.createElement(ItemTraitsToolbar, {
				actions: actions,
				availableTraits: availableTraits,
				attributes: attributes,
				key: 'traitsToolbar'
			}),
		]);
	}
});

var BlockToolbar = React.createClass({
	getDefaultProps: function() {
		return {
			chosenBlockTypeID: 'body',
			availableBlockTypes: [
				{'id': 'body', 'title': 'Body'},
				{'id': 'heading', 'title': 'Heading'},
				{'id': 'subhead1', 'title': 'Subheading'},
				{'id': 'subhead2', 'title': 'Subheading B'},
				{'id': 'subhead3', 'title': 'Subheading C'},
				{'id': 'figure', 'title': 'Figure'},
				{'id': 'particular', 'title': 'Particular'},
				{'id': 'quote', 'title': 'Quote'},
				{'id': 'placeholder', 'title': 'Placeholder'}
			]
		};
	},
	
	onToggleActive: function() {
		var actions = this.props.actions;
		actions.onToggleActive();
	},
	
	onChangeChosenBlockType: function(blockTypeOptions, event) {
		var actions = this.props.actions;
		actions.onChangeChosenBlockType(blockTypeOptions, event);
	},
	
	makeButtonForBlockTypeOptions: function(blockTypeOptions, chosenBlockTypeID, onClick) {
		return React.createElement(ToolbarButton, {
			key: ('button-type-' + blockTypeOptions.id),
			ref: blockTypeOptions.id,
			title: blockTypeOptions.title,
			selected: chosenBlockTypeID === blockTypeOptions.id,
			onClick: onClick
		});
	},
	
	render: function() {
		var props = this.props;
		var chosenBlockTypeID = props.chosenBlockTypeID;
		var availableBlockTypes = props.availableBlockTypes;
		var actions = props.actions;
		var active = props.active;
		
		var children;
		if (active) {
			children = availableBlockTypes.map(function(blockTypeOptions) {
				var onChangeChosenBlockType = this.onChangeChosenBlockType.bind(this, blockTypeOptions);
				return this.makeButtonForBlockTypeOptions(blockTypeOptions, chosenBlockTypeID, onChangeChosenBlockType);
			}, this);
		}
		else {
			var chosenBlockTypeOptions = availableBlockTypes.find(function(blockTypeOptions) {
				return (blockTypeOptions.id === chosenBlockTypeID);
			}, this);
			
			var button = this.makeButtonForBlockTypeOptions(chosenBlockTypeOptions, chosenBlockTypeID, this.onToggleActive);
			
			children = [
				button
			];
		}
		
		var classes = ['blockItemToolbar'];
		if (active) {
			classes.push('blockItemToolbar-active');
		}
		
		return React.createElement('div', {
			className: classes.join(' ')
		}, children);
	}
});

var ElementToolbars = {
	BlockToolbar: BlockToolbar,
	TextItemEditor: TextItemEditor
};
module.exports = ElementToolbars;