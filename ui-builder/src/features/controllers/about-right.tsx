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
import { Expression } from '../states/expression'
import { BoxElementInputSimple } from '../ui/box-element-input'
import { IconElementInput } from '../ui/icon-element-input'
import { ImageElementInput } from '../ui/image-element-input'
import { LinkElementInput } from '../ui/link-element-input'
import { TextElementInput } from '../ui/text-element-input'
import { Controller, ElementOptions } from './controller'
import { ComponentName, DividerCollapsible } from './helpers'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class AboutRight extends Controller {
	name = 'About us with details on the right'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
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
		<OptionsWrapper>
			<ComponentName name="About us with details on the right" />
			<ImageElementInput element={heroImage} />
			<TextElementInput label="Title" element={title} />
			<TextElementInput label="Subtitle" element={subtitle} />
			<TextElementInput label="CTA" element={ctaText} />
			<LinkElementInput label="CTA Link" element={cta} />
			<DividerCollapsible closed title="color">
				<BoxElementInputSimple label="Background color" element={component} />
				<BoxElementInputSimple label="Button background color" element={cta} />
			</DividerCollapsible>
			<DndTabs
				containerElement={featureLinesWrapper}
				renderItemOptions={(item) => <ItemOptions item={item} />}
				insertElement={() => createLine('Lorem ipsum dolor sit amet')}
			/>
		</OptionsWrapper>
	)
}

function ItemOptions({ item }: { item: Element }) {
	const icon = item.children?.[0] as IconElement
	const text = item.children?.[1] as TextElement

	return (
		<OptionsWrapper>
			<TextElementInput label="Title" element={text} />
			<IconElementInput label="Icon color" element={icon} />
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

const wrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr ',
			width: '100%',
			minHeight: '600px',
			alignItems: 'center',
			justifyContent: 'flex-start',
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
			justifyContent: 'center',
			maxWidth: '50%',
			lineHeight: '1.6',
		},
	}
	draft.style.tablet = {
		default: {
			width: '100%',
			maxWidth: '100%',
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
			padding: '15px',
			borderRadius: '15px',
			marginTop: '10px',
			width: '180px',
			height: 'auto',
			color: 'white',
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

	draft.data.href = Expression.fromString('#')
	draft.data.openInNewTab = false

	draft.children = [element]
	draft.tagId = tagIds.cta
}).serialize()

const defaultData = {
	...wrapper,
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
