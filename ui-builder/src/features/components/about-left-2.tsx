import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/about-left-2.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { IconElement } from '../elements/extensions/icon'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { color } from '../simple/palette'
import { IconPicker } from '../simple/stylers/icon-picker'
import { ImageStyler } from '../simple/stylers/image-styler'
import { LinkStyler } from '../simple/stylers/link-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'

export class AboutLeft2 extends Component {
	name = 'About us with details on the left - 2'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(): ReactNode {
		return <AboutLeft2Options />
	}
}

// =============  renderOptions =============

function AboutLeft2Options() {
	const component = useSelectedElement<BoxElement>()!
	const heroImage = component.find<ImageElement>(tagIds.heroImage)!
	const title = component.find<TextElement>(tagIds.title)!
	const subtitleText = component.find<TextElement>(tagIds.subtitleText)!
	const subtitleIcon = component.find<IconElement>(tagIds.subtitleIcon)!
	const featureLinesWrapper = component.find<BoxElement>(tagIds.featureLinesWrapper)!
	const cta = component.find<LinkElement>(tagIds.cta)!
	const ctaText = component.find<TextElement>(tagIds.ctaText)!

	return (
		<ComponentWrapper name="About us with details on the left">
			<ImageStyler element={heroImage} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Subtitle" element={subtitleText} />
			<IconPicker element={subtitleIcon} />
			<p className="font-medium cursor-default">Lines</p>
			<DndTabs
				containerElement={featureLinesWrapper}
				renderItemOptions={(item) => <TextStyler label='Text' element={item as TextElement} />}
				insertElement={() => createLine('Lorem ipsum dolor sit amet')}
			/>
			<div className='mt-2'></div>
			<TextStyler label="CTA" element={ctaText} />
			<LinkStyler label="CTA Link" element={cta} />
		</ComponentWrapper>
	)
}

const tagIds = {
	heroImage: 'heroImage',
	title: 'title',
	subtitle: 'subtitle',
	featureLinesWrapper: 'featureLinesWrapper',
	cta: 'cta',
	ctaText: 'ctaText',
	subtitleIcon: 'subtitleIcon',
	subtitleText: 'subtitleText',
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
		},
	}
	draft.style.tablet = {
		default: {
			gridTemplateColumns: ' 1fr ',
			paddingLeft: '10%',
			paddingRight: '10%',
			rowGap: '30px',
		},
	}
	draft.style.mobile = {
		default: {
			paddingLeft: '5%',
			paddingRight: '5%',
			rowGap: '20px',
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
		},
	}
}).serialize()

const title = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '35px',
			fontWeight: 'bold',
			color: color('primary'),
		},
	}
	draft.style.tablet = {
		default: {
			fontSize: '25px',
		},
	}
	draft.style.mobile = {
		default: {
			fontSize: '20px',
		},
	}
	draft.data.text = Expression.fromString('Simplify your business')
	draft.tagId = tagIds.title
}).serialize()

const subtitle = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			alignItems: 'center',
			marginBottom: '10px',
		},
	}
	const icon = produce(new IconElement(), (draft) => {
		draft.style.desktop = {
			default: {
				flex: '0 0 auto',
				width: '16px',
				height: '16px',
				fontSize: '16px',
				marginRight: '12px',
				color: color('secondary'),
			},
		}
		draft.style.tablet = {
			default: {
				width: '12px',
				height: '12px',
				fontSize: '12px',
				marginRight: '8px',
			},
		}
		draft.data.name = 'code'
		draft.data.type = 'fas'
		draft.tagId = tagIds.subtitleIcon
	})

	const text = produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				color: color('secondary'),
				fontSize: '16px'
			},
		}
		draft.style.tablet = {
			default: {
				fontSize: '12px'
			},
		}
		draft.data.text = Expression.fromString(
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
		)
		draft.tagId = tagIds.subtitleText
	})

	draft.children = [icon, text]
}).serialize()

const featureLinesWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			alignItems: 'flex-start',
			marginTop: '20px',
			marginBottom: '20px',
		},
	}
	draft.style.tablet = {
		default: {
			marginTop: '15px',
			marginBottom: '15px',
		},
	}
	draft.style.mobile = {
		default: {
			marginTop: '10px',
			marginBottom: '10px',
		},
	}
	draft.tagId = tagIds.featureLinesWrapper
}).serialize()


const createLine = (text: string) =>
	produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				color: color('text'),
				fontSize: '15px'
			},
		}
		draft.style.tablet = {
			default: {
				fontSize: '12px'
			},
		}
		draft.data.text = Expression.fromString(text)
	})

const featureLines = [
	createLine('Your brand is your promise to your customers').serialize(),
	createLine('Having a simple UI is a great way to improve your brand').serialize(),
	createLine('Creativity is just connecting things').serialize(),
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
	element.data.text = Expression.fromString('Learn more →')
	element.tagId = tagIds.ctaText
	element.style.desktop = {
		default: {
			color: color('primary'),
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
		{
			...detailsWrapper,
			components: [
				subtitle,
				title,
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
