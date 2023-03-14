import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/about-long-details-left.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { color } from '../simple/palette'
import { ImageStyler } from '../simple/stylers/image-styler'
import { LinkStyler } from '../simple/stylers/link-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'

export class AboutLongDetailsLeft extends Component {
	name = 'About us with long details on the left'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(): ReactNode {
		return <AboutLongDetailsLeftOptions />
	}
}

// =============  renderOptions =============

function AboutLongDetailsLeftOptions() {
	const component = useSelectedElement<BoxElement>()!
	const heroImage = component.find<ImageElement>(tagIds.heroImage)!
	const title = component.find<TextElement>(tagIds.title)!
	const details = component.find<TextElement>(tagIds.details)!
	const cta = component.find<LinkElement>(tagIds.cta)!
	const ctaText = component.find<TextElement>(tagIds.ctaText)!

	return (
		<ComponentWrapper name="About us with long details on the left">
			<ImageStyler element={heroImage} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Details" element={details} />
			<TextStyler label="CTA" element={ctaText} />
			<LinkStyler label="CTA Link" element={cta} />
		</ComponentWrapper>
	)
}

const tagIds = {
	heroImage: 'heroImage',
	title: 'title',
	details: 'details',
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
			rowGap: '30px',
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

const details = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			maxWidth: '70%',
		},
	}
	draft.style.tablet = {
		default: {
			maxWidth: '100%',
		},
	}

	const text = produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				color: color('text'),
				fontSize: '15px',
			},
		}
		draft.style.tablet = {
			default: {
				fontSize: '12px',
			},
		}
		draft.data.text =
			Expression.fromString(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec ultrices ultrices, nunc nisl aliquam lorem, nec ultrices lorem ipsum nec lorem.
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec ultrices ultrices, nunc nisl aliquam lorem, nec ultrices lorem ipsum nec lorem.`)
		draft.tagId = tagIds.details
	})

	draft.children = [text]
}).serialize()

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
			components: [title, details, cta],
		},
		heroImage,
	],
}
