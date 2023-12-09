import { produce } from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/about-left-with-link.png'
import { deserializeElement } from '../../utils/deserialize'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { fontSizes } from '../simple/font-sizes'
import { color } from '../simple/palette'
import { ImageStyler } from '../simple/stylers/image-styler'
import { LinkStyler } from '../simple/stylers/link-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class AboutLeftWithLink extends Component {
	name = 'About us with details and link on the left'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(): ReactNode {
		return <AboutLeftWithLinkOptions />
	}
}

// =============  renderOptions =============

function AboutLeftWithLinkOptions() {
	const component = useSelectedElement<BoxElement>()!
	const heroImage = component.find<ImageElement>(tagIds.heroImage)!
	const title = component.find<TextElement>(tagIds.title)!
	const subtitle = component.find<TextElement>(tagIds.subtitle)!
	const featureLinesWrapper = component.find<BoxElement>(tagIds.featureLinesWrapper)!
	const cta = component.find<LinkElement>(tagIds.cta)!
	const ctaText = component.find<TextElement>(tagIds.ctaText)!

	return (
		<ComponentWrapper name="About us with details and link on the left">
			<ImageStyler element={heroImage} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Subtitle" element={subtitle} />
			<DndTabs
				containerElement={featureLinesWrapper}
				renderItemOptions={(item) => <ItemOptions item={item} />}
				insertElement={() =>
					createFeatureLine(
						'Lorem ipsum dolor sit amet',
						'https://files.dotenx.com/assets/icons-cloud-39.png'
					)
				}
			/>
			<TextStyler label="CTA" element={ctaText} />
			<LinkStyler label="CTA Link" element={cta} />
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
	draft.style.tablet = {
		default: {
			order: 1,
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
			order: 2,
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
			fontSize: fontSizes.h2.desktop,
			fontWeight: 'bold',
			textAlign: 'left',
			color: color('primary'),
			marginBottom: '10px',
		},
	}
	draft.style.tablet = {
		default: {
			fontSize: fontSizes.h3.tablet,
		},
	}
	draft.style.mobile = {
		default: {
			fontSize: fontSizes.h3.mobile,
		},
	}
	draft.data.text = Expression.fromString('Simplify your business')
	draft.tagId = tagIds.title
}).serialize()

const subtitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: fontSizes.normal.desktop,
			textAlign: 'left',
			color: color('primary', 0.9),
		},
	}
	draft.style.tablet = {
		default: {
			fontSize: fontSizes.normal.tablet,
		},
	}
	draft.style.mobile = {
		default: {
			fontSize: fontSizes.normal.mobile,
			marginBottom: '10px',
		},
	}
	draft.data.text = Expression.fromString(
		'Internal branding, in broad terms, refers to a company’s strategy for integrating internal with external brand identity and perceptions, to reflect core values and mission statements, through alignment of enterprise-wide brand communications at all touch points.'
	)
	draft.tagId = tagIds.subtitle
}).serialize()

const featureLinesWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			textAlign: 'left',
			marginTop: '10px',
			marginBottom: '10px',
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
	createFeatureLine(
		'Your brand is your promise to your customers',
		'https://files.dotenx.com/assets/icons-cloud-39.png'
	).serialize(),
	createFeatureLine(
		'Your brand is your promise to your customers',
		'https://files.dotenx.com/assets/icons-combo-chart-vii.png'
	).serialize(),
	createFeatureLine(
		'Having a simple UI is a great way to improve your brand',
		'https://files.dotenx.com/assets/icons-credit-card-hwer.png'
	).serialize(),
]
const cta = produce(new LinkElement(), (draft) => {
	draft.style.desktop = {
		default: {
			border: 'none',
			borderRadius: '10px',
			textAlign: 'center',
			textDecoration: 'none',
			cursor: 'pointer',
			paddingTop: '5px',
			paddingBottom: '5px',
		},
	}
	draft.style.tablet = {
		default: {
			justifySelf: 'center',
		},
	}

	const element = new TextElement()
	element.data.text = Expression.fromString('Learn more →')
	element.tagId = tagIds.ctaText
	element.style.desktop = {
		default: {
			color: color('primary'),
			fontSize: fontSizes.normal.desktop,
			fontWeight: '400',
		},
	}
	element.style.tablet = {
		default: {
			fontSize: fontSizes.normal.tablet,
		},
	}
	element.style.mobile = {
		default: {
			fontSize: fontSizes.normal.mobile,
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
		heroImage,
	],
}
