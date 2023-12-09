import { produce } from 'immer'
import { BoxElement } from '../../elements/extensions/box'
import { LinkElement } from '../../elements/extensions/link'
import { TextElement } from '../../elements/extensions/text'
import { LinkStyler } from '../../simple/stylers/link-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { Expression } from '../../states/expression'
import { inteliText } from '../../ui/intelinput'

const layout = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			maxWidth: '70%',
			height: '400px',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: '40px',
		},
	}

	const title = produce(new TextElement(), (draft) => {
		draft.data.text = inteliText('Invest in best ideas')
		draft.style.desktop = {
			default: {
				fontSize: '48px',
				fontWeight: '600',
			},
		}
	})

	const subTitle = produce(new TextElement(), (draft) => {
		draft.data.text = inteliText(
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc auctor, nisl eget luctus lacinia, nunc nisl aliquam nunc, eget aliquam nunc nisl eget nunc.'
		)
		draft.style.desktop = {
			default: {
				fontSize: '28px',
				color: '#6a6a6a',
			},
		}
	})

	const cta = produce(new LinkElement(), (draft) => {
		draft.style.desktop = {
			default: {
				fontSize: '24px',
				padding: '10px 20px',
				borderRadius: '10px',
				backgroundColor: '#000000',
				color: '#ffffff',
				fontWeight: '600',
			},
		}

		const text = produce(new TextElement(), (draft) => {
			draft.data.text = inteliText('Click here')
		})
		draft.children = [text]
		draft.data.href = Expression.fromString('#')
		draft.data.openInNewTab = false
	})

	draft.children = [title, subTitle, cta]
})

type OptionsProps = {
	root: BoxElement
}

function Options({ root }: OptionsProps): JSX.Element {
	const title = root.children[0] as TextElement
	const subtitle = root.children[1] as TextElement
	const ctaLink = root.children[2] as LinkElement
	const ctaText = ctaLink.children[0] as TextElement

	return (
		<>
			<TextStyler label="Title" element={title} />
			<TextStyler label="Subtitle" element={subtitle} />
			<LinkStyler label="CTA Link" element={ctaLink} />
			<TextStyler label="CTA Text" element={ctaText} />
		</>
	)
}

export default class TitleSubtitleCta {
	getWrapper = () => layout
	getTitle = () => layout.children[0] as TextElement
	getSubtitle = () => layout.children[1] as TextElement
	getCtaLink = () => layout.children[2] as LinkElement
	getCtaText = () => this.getCtaLink().children[0] as TextElement
	getComponent = () => layout
	getOptions = ({ root }: { root: BoxElement }) => <Options root={root} />
}
