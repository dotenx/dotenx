import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/about-right.png'
import { deserializeElement } from '../../utils/deserialize'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { IconElement } from '../elements/extensions/icon'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { color } from '../simple/palette'
import { IconStyler } from '../simple/stylers/icon-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { LinkStyler } from '../simple/stylers/link-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'
import { frameGrid } from '../elements/constructor'

export class AboutRight extends Component {
	name = 'About us with details on the right'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(): ReactNode {
		return <AboutRightOptions />
	}
}

// =============  renderOptions =============

function AboutRightOptions() {
	const component = useSelectedElement<BoxElement>()!
	const heroImage = component.find<ImageElement>(tagIds.heroImage)!
	const title = component.find<TextElement>(tagIds.title)!
	const subtitle = component.find<TextElement>(tagIds.subtitle)!
	const featureLinesWrapper = component.find<BoxElement>(tagIds.featureLinesWrapper)!
	const cta = component.find<LinkElement>(tagIds.cta)!
	const ctaText = component.find<TextElement>(tagIds.ctaText)!

	return (
		<ComponentWrapper name="About us with details on the left">
			<ImageStyler element={heroImage} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Subtitle" element={subtitle} />
			<TextStyler label="CTA" element={ctaText} />
			<LinkStyler label="CTA Link" element={cta} />
			<DndTabs
				containerElement={featureLinesWrapper}
				renderItemOptions={(item) => <ItemOptions item={item} />}
				insertElement={() => createLine('Lorem ipsum dolor sit amet')}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: Element }) {
	const icon = item.children?.[0] as IconElement
	const text = item.children?.[1] as TextElement

	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={text} />
			<IconStyler label="Icon color" element={icon} />
		</OptionsWrapper>
	)
}

const tagIds = {
	heroImage: 'heroImage',
	title: 'title',
	subtitle: 'subtitle',
	featureLinesWrapper: 'featureLinesWrapper',
	cta: 'cta',
	ctaText: 'ctaText',
}

// =============  defaultData =============

const component = frameGrid().serialize()

const heroImage = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '100%',
			maxWidth: '600px',
			height: 'auto',
		},
	}
	draft.data.src = Expression.fromString('https://files.dotenx.com/assets/hero-bg-wva.jpeg')
	draft.tagId = tagIds.heroImage
}).serialize()

const detailsWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'flex-start',
		},
	}
	draft.style.tablet = {
		default: {
			textAlign: 'center',
			justifyContent: 'center',
			alignItems: 'center',
			lineHeight: '1.3',
		},
	}
	draft.style.mobile = {
		default: {
			lineHeight: '1.2',
		},
	}
}).serialize()

const title = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '50px',
			fontWeight: 'bold',
			color: color('primary'),
			marginBottom: '10px',
		},
	}
	draft.style.mobile = {
		default: {
			fontSize: '30px',
		},
	}
	draft.data.text = Expression.fromString('Simplify your business')
	draft.tagId = tagIds.title
}).serialize()

const subtitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '16px',
			color: color('primary', 0.9),
		},
	}
	draft.style.mobile = {
		default: {
			fontSize: '12px',
			marginBottom: '10px',
		},
	}
	draft.data.text = Expression.fromString('Branding starts from the inside out')
	draft.tagId = tagIds.subtitle
}).serialize()

const featureLinesWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			marginTop: '20px',
			marginBottom: '20px',
			fontSize: '15px',
		},
	}
	draft.style.mobile = {
		default: {
			marginTop: '0px',
			marginBottom: '12px',
			fontSize: '12px',
		},
	}
	draft.tagId = tagIds.featureLinesWrapper
}).serialize()

const createFeatureLine = () =>
	produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				display: 'flex',
				alignItems: 'center',
				marginTop: '10px',
				marginBottom: '10px',
				marginLeft: '0px',
				marginRight: '0px',
			},
		}
		const icon = produce(new IconElement(), (draft) => {
			draft.style.desktop = {
				default: {
					flex: '0 0 auto',
					width: '16px',
					height: '16px',
					marginRight: '10px',
					color: color('accent'),
				},
			}
			draft.style.tablet = {
				default: {
					width: '12px',
					height: '12px',
					marginRight: '8px',
				},
			}
			draft.style.mobile = {
				default: {
					width: '8px',
					height: '8px',
					marginRight: '4px',
				},
			}
			draft.data.name = 'check'
			draft.data.type = 'fas'
		})

		const text = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					marginLeft: '8px',
					color: color('text'),
				},
			}
			draft.data.text = Expression.fromString(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
			)
		})

		draft.children = [icon, text]
	})

const createLine = (text: string) => {
	return produce(createFeatureLine(), (draft) => {
		const textElement = draft.children[1]! as TextElement
		textElement.data.text = Expression.fromString(text)
	})
}

const featureLines = [
	createLine('Your brand is your promise to your customers').serialize(),
	createLine('Having a simple UI is a great way to improve your brand').serialize(),
	createLine('Creativity is just connecting things').serialize(),
]

const cta = produce(new LinkElement(), (draft) => {
	draft.style.desktop = {
		default: {
			backgroundColor: color('primary'),
			border: 'none',
			borderRadius: '10px',
			textAlign: 'center',
			textDecoration: 'none',
			cursor: 'pointer',
			paddingTop: '5px',
			paddingBottom: '5px',
			paddingLeft: '15px',
			paddingRight: '15px',
		},
	}
	draft.style.tablet = {
		default: {
			justifySelf: 'center',
		},
	}

	const element = new TextElement()
	element.data.text = Expression.fromString('Learn more')
	element.tagId = tagIds.ctaText
	element.style.desktop = {
		default: {
			color: 'hsla(0, 0%, 100%, 1)',
			fontSize: '20px',
			fontWeight: '400',
		},
	}
	element.style.tablet = {
		default: {
			fontSize: '18px',
		},
	}
	element.style.mobile = {
		default: {
			fontSize: '14px',
		},
	}

	draft.data.href = Expression.fromString('#')
	draft.data.openInNewTab = false

	draft.children = [element]
	draft.tagId = tagIds.cta
}).serialize()

const defaultData = {
	...component,
	components: [
		heroImage,
		{
			...detailsWrapper,
			components: [
				title,
				subtitle,
				{
					...featureLinesWrapper,
					components: featureLines,
				},
				cta,
			],
		},
	],
}
