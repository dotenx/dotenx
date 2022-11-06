import produce from 'immer'
import { TextElement } from '../../elements/extensions/text'
import { Style } from '../../elements/style'
import { Expression } from '../../states/expression'
import { elementBase } from './base'
type roundInputWithLabelProps = {
	label: string
	inputType: string
	inputName: string
	inputStyle?: Style
	padding?: string
}

const element = ({
	label,
	inputType,
	inputName,
	inputStyle,
	padding,
}: roundInputWithLabelProps) => [
	{
		kind: 'Box',
		...elementBase,
		data: {
			style: {
				desktop: {
					default: {
						display: 'block',
						height: '64px',
						padding: padding ?? '31px 0px 9px',
						width: '100%',
					},
				},
				tablet: {},
				mobile: {},
			},
		},
		components: [
			produce(new TextElement(), (draft) => {
				draft.style = {
					desktop: {
						default: {
							border: '0px none rgb(85, 85, 85)',
							borderBlock: '0px none rgb(85, 85, 85)',
							borderBlockColor: 'rgb(85, 85, 85)',
							borderBlockEnd: '0px none rgb(85, 85, 85)',
							borderBlockEndColor: 'rgb(85, 85, 85)',
							borderBlockStart: '0px none rgb(85, 85, 85)',
							borderBlockStartColor: 'rgb(85, 85, 85)',
							borderBottom: '0px none rgb(85, 85, 85)',
							borderBottomColor: 'rgb(85, 85, 85)',
							borderColor: 'rgb(85, 85, 85)',
							borderInline: '0px none rgb(85, 85, 85)',
							borderInlineColor: 'rgb(85, 85, 85)',
							borderInlineEnd: '0px none rgb(85, 85, 85)',
							borderInlineEndColor: 'rgb(85, 85, 85)',
							borderInlineStart: '0px none rgb(85, 85, 85)',
							borderInlineStartColor: 'rgb(85, 85, 85)',
							borderLeft: '0px none rgb(85, 85, 85)',
							borderLeftColor: 'rgb(85, 85, 85)',
							borderRight: '0px none rgb(85, 85, 85)',
							borderRightColor: 'rgb(85, 85, 85)',
							borderTop: '0px none rgb(85, 85, 85)',
							borderTopColor: 'rgb(85, 85, 85)',
							caretColor: 'rgb(85, 85, 85)',
							color: 'rgb(85, 85, 85)',
							columnRule: '0px none rgb(85, 85, 85)',
							columnRuleColor: 'rgb(85, 85, 85)',
							fontSize: '16px',
							outline: 'rgb(85, 85, 85) none 0px',
							outlineColor: 'rgb(85, 85, 85)',
							textDecoration: 'none solid rgb(85, 85, 85)',
							textDecorationColor: 'rgb(85, 85, 85)',
							textEmphasis: 'none rgb(85, 85, 85)',
							textEmphasisColor: 'rgb(85, 85, 85)',
						},
					},
					tablet: {},
					mobile: {},
				}
				draft.data.text = Expression.fromString(label)
			}).serialize(),
		],
	},
	{
		kind: 'Box',
		...elementBase,
		data: {
			style: {
				desktop: {
					default: {
						blockSize: '62px',
						backgroundColor: 'rgb(247, 247, 247)',
						border: '1px solid rgb(230, 230, 230)',
						borderRadius: '10px',
						bottom: '0px',
						display: 'block',
						height: '62px',
						position: 'relative',
						width: '100%',
					},
				},
				tablet: {},
				mobile: {},
			},
		},
		components: [
			{
				kind: 'Input',
				classNames: [],
				bindings: {},
				events: [],
				id: '',
				parentId: '',
				repeatFrom: null,
				data: {
					style: {
						desktop: {
							default: {
								border: '0px none rgb(51, 51, 51)',
								backgroundColor: 'transparent',
								color: 'rgb(51, 51, 51)',
								columnRule: '0px none rgb(51, 51, 51)',
								columnRuleColor: 'rgb(51, 51, 51)',
								display: 'block',
								font: '18px / 21.6px',
								fontSize: '18px',
								height: '60px',
								inlineSize: '458px',
								lineHeight: '21.6px',
								outline: 'rgb(51, 51, 51) none 0px',
								outlineColor: 'rgb(51, 51, 51)',
								paddingLeft: '10px',
								paddingRight: '10px',
								width: '100%',
							},
						},
						tablet: {},
						mobile: {},
					},
					name: inputName,
					defaultValue: '',
					placeholder: '',
					value: '',
					type: inputType,
					required: false,
				},
				components: [],
			},
		],
	},
]

export default element
