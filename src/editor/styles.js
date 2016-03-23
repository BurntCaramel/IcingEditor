import sow from 'react-sow';
import rgba from 'react-sow/rgba';
import { fallow } from 'react-sow/dom';

const editorMaxWidth = 400;
const editorWidth = '40vw';

const fontSize = 16;
const lineHeight = 1.3;

const keyColor = rgba(20, 150, 255, 1.0);
const darkColor = rgba(16, 16, 16);
const lightColor = rgba(244, 244, 244);

const slightBoxShadow = '0 1px 1px rgba(0, 0, 0, 0.07)';
//const slightBoxShadow = `0 1px 1px ${ rgba.black(0.07) }`;

export const unorderedListItem = fallow({
	before: {
		content: '•',
		position: 'absolute',
		left: '-0.5em'
	},
});

export const sectionsStyler = sow(() => ({
	position: 'relative',
	//left: '-5vw',
	maxWidth: 400,
	width: '40vw',
	fontFamily: 'sans-serif',
}), {
	section: sow(() => ({
		fontSize,
		lineHeight,
	}), {
		blocks: sow(() => ({
			position: 'relative',
			marginBottom: 40,
			padding: '8px 0',
			transition: 'left 0.7s ease-out, background-color 0.25s ease',
		}), {
			subsection: sow(() => ({
				marginBottom: '1em',
			})),
			block: sow(({ typeGroup, type, subsectionType, subsectionChildIndex }) => Object.assign({
				marginBottom: '1em',
			}, (subsectionType === 'unorderedList') && {
				classes: [unorderedListItem]
			})),
		}),
	}),
});

export const textEditorStyler = sow(() => ({
	position: 'absolute',
	left: '100%',
	marginLeft: '3vw',
	marginTop: -13,
	borderTop: `1px solid ${keyColor}`,
}), {
	textarea: sow(() => ({
		boxSizing: 'border-box',
		maxWidth: '40vw',
		width: 500,
		height: 140,
		padding: 10,
		fontSize,
		lineHeight,
		backgroundColor: 'white',
		border: 'none',
		outline: 'none',
		
		transition: 'height 0.38s ease-out',
	})),
	instructions: sow(() => ({
		display: 'none',
		position: 'absolute',
		top: -16,
		right: 0,
		opacity: 0.25,
		fontSize: 10,
		lineHeight: 1,
	})),
});

const toolbarItemStyler = sow(() => ({
	display: 'inline-block',
	margin: 0,
	paddingTop: 3,
	paddingBottom: 3,
	paddingLeft: 6,
	paddingRight: 6,
	fontSize: 12,
	whiteSpace: 'nowrap',
	border: 'none',
	background: 'none',
}));

export const toolbarButtonStyler = sow.combine([
	toolbarItemStyler,
	sow(({ small = false, dark = false }) => Object.assign(
		{
			borderRadius: 2,
			//boxShadow: slightBoxShadow,
		},
		small ? {
			fontSize: 10,	
		} : {
			fontSize: 12,
		},
		dark ? {
			color: lightColor,
			backgroundColor: darkColor,
		} : {
			color: darkColor,
			backgroundColor: lightColor,
		}
	))
]);

export const traitHolderStyler = sow(() => ({
	display: 'inline-block',
	marginLeft: 4,
	marginRight: 4,
}));
