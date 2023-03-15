import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/about-right-3.png'
import { deserializeElement } from '../../utils/deserialize'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { fontSizes } from '../simple/font-sizes'
import { color } from '../simple/palette'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class AboutRight3 extends Component {
	name = 'About us with details on the right - 3'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(): ReactNode {
		return <AboutRight3Options />
	}
}

// =============  renderOptions =============

function AboutRight3Options() {
	const component = useSelectedElement<BoxElement>()!
	const heroImage = component.find<ImageElement>(tagIds.heroImage)!
	const title = component.find<TextElement>(tagIds.title)!
	const subtitle = component.find<TextElement>(tagIds.subtitle)!
	const featureLinesWrapper = component.find<BoxElement>(tagIds.featureLinesWrapper)!

	return (
		<ComponentWrapper name="About us with details on the right - 3">
			<ImageStyler element={heroImage} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Subtitle" element={subtitle} />
			<DndTabs
				containerElement={featureLinesWrapper}
				renderItemOptions={(item) => <ItemOptions item={item} />}
				insertElement={() => createFeatureLine('Lorem ipsum dolor sit amet', 'https://files.dotenx.com/assets/icons-cloud-39.png')}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: Element }) {
	const icon = item.children?.[0] as ImageElement
	const text = item.children?.[1] as TextElement

	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={text} />
			<ImageStyler element={icon} />
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

const component = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr ',
			width: '100%',
			alignItems: 'center',
			justifyContent: 'center',
			paddingLeft: '15%',
			paddingRight: '15%',
			paddingTop: '40px',
			paddingBottom: '40px',
			gap: '30px',
		},
	}
	draft.style.tablet = {
		default: {
			gridTemplateColumns: ' 1fr ',
			paddingLeft: '10%',
			paddingRight: '10%',
			gap: '30px',
		},
	}
	draft.style.mobile = {
		default: {
			paddingLeft: '5%',
			paddingRight: '5%',
			gap: '20px',
		},
	}
}).serialize()

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
			justifyContent: 'space-between',
			alignItems: 'flex-start',
			textAlign: 'justify',
		},
	}
	draft.style.tablet = {
		default: {
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
			fontSize: fontSizes.h1.desktop,
			fontWeight: 'bold',
			color: color('primary'),
		},
	}
	draft.style.tablet = {
		default: {
			fontSize: fontSizes.h1.tablet,
		},
	}
	draft.style.mobile = {
		default: {
			fontSize: fontSizes.h1.mobile,
		},
	}
	draft.data.text = Expression.fromString('Simplify your business with access to the best talent')
	draft.tagId = tagIds.title
}).serialize()

const subtitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: fontSizes.h4.desktop,
			color: color('primary', 0.9),
		},
	}
	draft.style.tablet = {
		default: {
			fontSize: fontSizes.h4.tablet,
		},
	}
	draft.style.mobile = {
		default: {
			fontSize: fontSizes.h4.mobile,
			marginBottom: '10px',
		},
	}
	draft.data.text = Expression.fromString('Branding starts from the inside out and we are here to help your awesome build a brand')
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

const createFeatureLine = (txt: string, imageUrl: string) =>
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
		const icon = produce(new ImageElement(), (draft) => {
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
			draft.data.src = Expression.fromString(imageUrl)
		})
		const text = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					marginLeft: '8px',
					color: color('text'),
				},
			}
			draft.data.text = Expression.fromString(txt)
		})

		draft.children = [icon, text]
	})


const featureLines = [
	createFeatureLine('Your brand is your promise to your customers', 'https://files.dotenx.com/assets/icons-cloud-39.png').serialize(),
	createFeatureLine('Your brand is your promise to your customers', 'https://files.dotenx.com/assets/icons-combo-chart-vii.png').serialize(),
	createFeatureLine('Having a simple UI is a great way to improve your brand', 'https://files.dotenx.com/assets/icons-credit-card-hwer.png').serialize(),
	createFeatureLine('Creativity is just connecting things', 'https://files.dotenx.com/assets/icons-luggage-bh.png').serialize(),
	createFeatureLine('Design is not just what it looks like and feels like', 'https://files.dotenx.com/assets/icons-speaker-qer.png').serialize(),
	createFeatureLine('You deserve a brand that makes you proud', 'https://files.dotenx.com/assets/icons-stellar-bb.png').serialize(),
]

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
			],
		},
	],
}
