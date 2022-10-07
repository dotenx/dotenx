import _ from 'lodash'
import { Style } from '../../elements/style'
import { elementBase } from './base'

type basicRoundButtonProp = {
	buttonStyle?: Style
	label: string
	submit?: boolean
}

const defaultButtonStyle: Style = {
	desktop: {
		default: {
			alignItems: 'center',
			appearance: 'button',
			backgroundColor: 'rgb(51, 51, 51)',
			border: '0px none rgb(255, 255, 255)',
			borderBlock: '0px none rgb(255, 255, 255)',
			borderBlockColor: 'rgb(255, 255, 255)',
			borderBlockEnd: '0px none rgb(255, 255, 255)',
			borderBlockEndColor: 'rgb(255, 255, 255)',
			borderBlockStart: '0px none rgb(255, 255, 255)',
			borderBlockStartColor: 'rgb(255, 255, 255)',
			borderBottom: '0px none rgb(255, 255, 255)',
			borderBottomColor: 'rgb(255, 255, 255)',
			borderBottomLeftRadius: '10px',
			borderBottomRightRadius: '10px',
			borderColor: 'rgb(255, 255, 255)',
			borderEndEndRadius: '10px',
			borderEndStartRadius: '10px',
			borderInline: '0px none rgb(255, 255, 255)',
			borderInlineColor: 'rgb(255, 255, 255)',
			borderInlineEnd: '0px none rgb(255, 255, 255)',
			borderInlineEndColor: 'rgb(255, 255, 255)',
			borderInlineStart: '0px none rgb(255, 255, 255)',
			borderInlineStartColor: 'rgb(255, 255, 255)',
			borderLeft: '0px none rgb(255, 255, 255)',
			borderLeftColor: 'rgb(255, 255, 255)',
			borderRadius: '10px',
			borderRight: '0px none rgb(255, 255, 255)',
			borderRightColor: 'rgb(255, 255, 255)',
			borderStartEndRadius: '10px',
			borderStartStartRadius: '10px',
			borderTop: '0px none rgb(255, 255, 255)',
			borderTopColor: 'rgb(255, 255, 255)',
			borderTopLeftRadius: '10px',
			borderTopRightRadius: '10px',
			bottom: '0px',
			caretColor: 'rgb(255, 255, 255)',
			color: 'rgb(255, 255, 255)',
			columnRule: '0px none rgb(255, 255, 255)',
			columnRuleColor: 'rgb(255, 255, 255)',
			cursor: 'pointer',
			display: 'flex',
			font: '16px / 19.2px',
			height: '60px',
			inlineSize: '460px',
			inset: '0px',
			insetBlock: '0px',
			insetBlockEnd: '0px',
			insetBlockStart: '0px',
			insetInline: '0px',
			insetInlineEnd: '0px',
			insetInlineStart: '0px',
			justifyContent: 'center',
			left: '0px',
			lineHeight: '19.2px',
			minHeight: 'auto',
			minInlineSize: 'auto',
			outline: 'rgb(255, 255, 255) none 0px',
			outlineColor: 'rgb(255, 255, 255)',
			perspectiveOrigin: '230px 30px',
			placeContent: 'normal center',
			placeItems: 'center normal',
			position: 'relative',
			right: '0px',
			textAlign: 'center',
			textDecoration: 'none solid rgb(255, 255, 255)',
			textDecorationColor: 'rgb(255, 255, 255)',
			textEmphasis: 'none rgb(255, 255, 255)',
			textEmphasisColor: 'rgb(255, 255, 255)',
			top: '0px',
			touchAction: 'manipulation',
			transformOrigin: '230px 30px',
			transition: 'all 0.4s ease 0s',
			transitionDuration: '0.4s',
			width: '100%',
			zIndex: '1',
		},
	},
	tablet: {},
	mobile: {},
}

const element = ({ buttonStyle, label, submit }: basicRoundButtonProp) => [
	{
		kind: 'Box',
		...elementBase,
		data: {
			style: {
				desktop: {
					default: {
						display: 'flex',
						flexFlow: 'row wrap',
						flexWrap: 'wrap',
						height: '60px',
						inlineSize: '460px',
						margin: '17px 0px 0px',
						marginBlock: '17px 0px',
						marginBlockStart: '17px',
						marginTop: '17px',
						minBlockSize: 'auto',
						minHeight: 'auto',
						minInlineSize: 'auto',
						minWidth: 'auto',
						perspectiveOrigin: '230px 30px',
						transformOrigin: '230px 30px',
						width: '100%',
					},
				},
				tablet: {},
				mobile: {},
			},
		},
		components: [
			{
				kind: submit ? 'Submit' : 'Button',
				classNames: [],
				bindings: {},
				events: [],
				id: '',
				parentId: '',
				repeatFrom: null,
				data: {
					style: buttonStyle
						? _.merge(defaultButtonStyle, buttonStyle)
						: defaultButtonStyle,
					text: label,
				},
				components: [],
			},
		],
	},
]

export default element
