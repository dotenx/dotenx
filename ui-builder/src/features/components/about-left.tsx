import produce from 'immer'
import imageUrl from '../../assets/components/about-left.png'
import { deserializeElement } from '../../utils/deserialize'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { IconElement } from '../elements/extensions/icon'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { BoxStylerSimple } from '../simple/stylers/box-styler'
import { IconStyler } from '../simple/stylers/icon-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { LinkStyler } from '../simple/stylers/link-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component } from './component'
import { DividerCollapsible } from './helpers'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class AboutLeft extends Component {
	name = 'About us with details on the left'
	image = imageUrl
	defaultData = defaultData
	renderOptions = () => <AboutLeftOptions />
}

// =============  renderOptions =============

function AboutLeftOptions() {
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
			<DividerCollapsible closed title="color">
				<BoxStylerSimple label="Background color" element={component} />
				<BoxStylerSimple label="Button background color" element={cta} />
			</DividerCollapsible>
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

const component = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr ',
			width: '100%',
			minHeight: '600px',
			alignItems: 'center',
			justifyContent: 'center',
			fontFamily: 'Rubik sans-serif',
			paddingLeft: '10%',
			paddingRight: '10%',
			paddingTop: '40px',
			paddingBottom: '40px',
		},
	}
	draft.style.tablet = {
		default: {
			height: 'auto',
			gridTemplateColumns: ' 1fr ',
		},
	}
	draft.style.mobile = {
		default: {
			paddingLeft: '10%',
			paddingRight: '10%',
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
	draft.data.src = Expression.fromString(
		'https://files.dotenx.com/68c53d72-a5b6-4be5-b0b4-498bd6b43bfd.png'
	)
	draft.tagId = tagIds.heroImage
}).serialize()

const detailsWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'flex-start',
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
			marginBottom: '30px',
			color: '#333333',
		},
	}
	draft.style.mobile = {
		default: {
			fontSize: '30px',
			marginBottom: '20px',
			color: '#333333',
		},
	}
	draft.data.text = Expression.fromString('Simplify your business')
	draft.tagId = tagIds.title
}).serialize()

const subtitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '18px',
			color: '#696969',
		},
	}
	draft.style.mobile = {
		default: {
			fontSize: '14px',
			marginBottom: '10px',
		},
	}
	draft.data.text = Expression.fromString(
		'Branding starts from the inside out. We help you build a strong brand from the inside out.'
	)
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
					color: '#6aa512',
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
					color: '#717171',
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
			backgroundColor: '#7670f1',
			border: 'none',
			alignSelf: 'center',
			borderRadius: '15px',
			marginTop: '10px',
			color: '#ffffff',
			fontSize: '26px',
			fontWeight: 'bold',
			textAlign: 'center',
			textDecoration: 'none',
			cursor: 'pointer',
		},
	}
	draft.style.tablet = {
		default: {
			justifySelf: 'center',
		},
	}
	draft.style.mobile = {
		default: {
			marginTop: '8px',
			width: '120px',
			fontSize: '14px',
			fontWeight: 'bold',
		},
	}

	const element = new TextElement()
	element.data.text = Expression.fromString('Get Started')
	element.tagId = tagIds.ctaText
	element.style.desktop = {
		default: {
			paddingTop: '15px',
			paddingBottom: '15px',
			paddingLeft: '15px',
			paddingRight: '15px',
		},
	}

	draft.data.href = Expression.fromString('#')
	draft.data.openInNewTab = false

	draft.children = [element]
	draft.tagId = tagIds.cta
}).serialize()

const defaultData = deserializeElement({
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
})
