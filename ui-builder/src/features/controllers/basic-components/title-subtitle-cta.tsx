import { TextInput } from '@mantine/core'
import produce from 'immer'
import { Element } from '../../elements/element'
import { BoxElement } from '../../elements/extensions/box'
import { LinkElement } from '../../elements/extensions/link'
import { TextElement } from '../../elements/extensions/text'

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
		draft.data.text = 'Invest in best ideas'
		draft.style.desktop = {
			default: {
				fontSize: '48px',
				fontWeight: '600',
			},
		}
	})

	const subTitle = produce(new TextElement(), (draft) => {
		draft.data.text =
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc auctor, nisl eget luctus lacinia, nunc nisl aliquam nunc, eget aliquam nunc nisl eget nunc.'
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
			draft.data.text = 'Click here'
		})
		draft.children = [text]
		draft.data.href = '#'
		draft.data.openInNewTab = false
	})

	draft.children = [title, subTitle, cta]
})

type OptionsProps = {
	set: (element: Element) => void
	root: BoxElement
}

function Options({ set, root }: OptionsProps): JSX.Element {
	const title = root.children[0] as TextElement
	const subtitle = root.children[1] as TextElement
	const ctaLink = root.children[2] as LinkElement
	const ctaText = ctaLink.children[0] as TextElement

	return (
		<>
			<TextInput
				label="Title"
				placeholder="Title"
				name="title"
				size="xs"
				value={title.data.text}
				onChange={(event) =>
					set(
						produce(title, (draft) => {
							draft.data.text = event.target.value
						})
					)
				}
			/>
			<TextInput
				label="Subtitle"
				placeholder="Subtitle"
				name="subtitle"
				size="xs"
				value={subtitle.data.text}
				onChange={(event) =>
					set(
						produce(subtitle, (draft) => {
							draft.data.text = event.target.value
						})
					)
				}
			/>
			<TextInput
				label="CTA Link"
				placeholder="CTA link"
				name="cta"
				size="xs"
				value={ctaLink.data.href}
				onChange={(event) =>
					set(
						produce(ctaLink, (draft) => {
							draft.data.href = event.target.value
						})
					)
				}
			/>
			<TextInput
				label="CTA Text"
				placeholder="CTA text"
				name="cta"
				size="xs"
				value={ctaText.data.text}
				onChange={(event) =>
					set(
						produce(ctaText, (draft) => {
							draft.data.text = event.target.value
						})
					)
				}
			/>
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
	getOptions = ({ set, root }: { set: (element: Element) => void; root: BoxElement }) => (
		<Options set={set} root={root} />
	)
}
