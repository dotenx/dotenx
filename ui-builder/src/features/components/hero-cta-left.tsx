import { produce } from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/hero-cta-left.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { BoxStyler } from '../simple/stylers/box-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { LinkStyler } from '../simple/stylers/link-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'

export class HeroCtaLeft extends Component {
	name = 'Hero with CTA on the left'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <HeroCtaLeftOptions />
	}
}

// =============  renderOptions =============

function HeroCtaLeftOptions() {
	const component = useSelectedElement<BoxElement>()!
	const image = component.find<ImageElement>(tagIds.image)!
	const title = component.find<TextElement>(tagIds.title)!
	const subtitle = component.find<TextElement>(tagIds.subtitle)!
	const cta = component.find<LinkElement>(tagIds.cta)!
	const ctaText = cta.children?.[0] as TextElement

	return (
		<ComponentWrapper 
	stylers={['background-image']} 
		name="Hero with CTA on the left">
			<ImageStyler element={image} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Subtitle" element={subtitle} />
			<TextStyler label="CTA" element={ctaText} />
			<LinkStyler label="CTA Link" element={cta} />
			<BoxStyler label="Animation" element={cta} stylers={['animation']} />
		</ComponentWrapper>
	)
}

// =============  defaultData =============
const tagIds = {
	image: 'image',
	title: 'title',
	subtitle: 'subtitle',
	cta: 'cta',
}

const wrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gap: '20px',
			gridTemplateColumns: '1fr 1fr',
			width: '100%',
			alignItems: 'center',
			justifyContent: 'center',
			paddingLeft: '15%',
			paddingRight: '15%',
			paddingTop: '5%',
			paddingBottom: '5%',
			columnGap: '10px',
		},
	}

	draft.style.tablet = {
		default: {
			gridTemplateColumns: '1fr',
			paddingLeft: '10%',
			paddingRight: '10%',
		},
	}

	draft.style.tablet = {
		default: {
			gridTemplateColumns: '1fr',
			paddingLeft: '5%',
			paddingRight: '5%',
		},
	}
}).serialize()

const imageContainer = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '100%',
			height: 'auto',
		},
	}
	draft.data.src = Expression.fromString('https://files.dotenx.com/assets/hero-bg-wo4.jpeg')
	draft.tagId = tagIds.image
}).serialize()

const detailsWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			alignItems: 'flex-start',
			lineHeight: '1.6',
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

const subTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '18px',
			marginBottom: '30px',
			color: '#696969',
		},
	}
	draft.style.mobile = {
		default: {
			fontSize: '14px',
			marginBottom: '20px',
		},
	}
	draft.data.text = Expression.fromString(
		'Branding starts from the inside out. We help you build a strong brand from the inside out.'
	)
	draft.tagId = tagIds.subtitle
}).serialize()

const cta = produce(new LinkElement(), (draft) => {
	draft.style.desktop = {
		default: {
			backgroundColor: '#000000',
			border: 'none',
			paddingTop: '15px',
			paddingBottom: '15px',
			paddingLeft: '30px',
			paddingRight: '30px',
			borderRadius: '10px',
			fontSize: '24px',
			fontWeight: 'bold',
			textAlign: 'center',
			textDecoration: 'none',
			cursor: 'pointer',
		},
	}

	draft.style.tablet = {
		default: {
			fontSize: '20px',
			paddingTop: '10px',
			paddingBottom: '10px',
			paddingLeft: '20px',
			paddingRight: '20px',
		},
	}

	draft.style.mobile = {
		default: {
			fontSize: '16px',
			paddingTop: '10px',
			paddingBottom: '10px',
			paddingLeft: '20px',
			paddingRight: '20px',
		},
	}

	const element = new TextElement()
	element.data.text = Expression.fromString('Get Started')
	element.style.desktop = {
		default: {
			color: '#ffffff',
		},
	}

	draft.data.href = Expression.fromString('#')
	draft.data.openInNewTab = false
	draft.children = [element]
	draft.tagId = tagIds.cta
}).serialize()

const defaultData = {
	...wrapper,
	components: [
		{
			...detailsWrapper,
			components: [title, subTitle, cta],
		},
		{
			...imageContainer,
		},
	],
}
