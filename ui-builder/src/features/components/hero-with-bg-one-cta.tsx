import produce from 'immer'
import imageUrl from '../../assets/components/hero-with-bg-one-cta.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { fontSizes } from '../simple/font-sizes'
import { ImageStyler } from '../simple/stylers/image-styler'
import { LinkStyler } from '../simple/stylers/link-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { frame, txt } from '../elements/constructor'

export class HeroWithBgOneCta extends Component {
	name = 'Hero with background image and one CTA'
	image = imageUrl
	defaultData = deserializeElement(defaultData)
	renderOptions = () => <HeroWithBgOneCtaOptions />
}

// =============  renderOptions =============

function HeroWithBgOneCtaOptions() {
	const component = useSelectedElement<BoxElement>()!
	const heroImage = component.find<ImageElement>(tagIds.heroImage)!
	const title = component.find<TextElement>(tagIds.title)!
	const subtitle = component.find<TextElement>(tagIds.subtitle)!
	const cta1 = component.find<LinkElement>(tagIds.cta1)!
	const cta1Text = component.find<TextElement>(tagIds.cta1Text)!

	return (
		<ComponentWrapper name="Hero with background image and one CTA">
			<ImageStyler element={heroImage} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Subtitle" element={subtitle} />
			<TextStyler label="CTA1" element={cta1Text} />
			<LinkStyler label="CTA1 Link" element={cta1} />
		</ComponentWrapper>
	)
}

const tagIds = {
	heroImage: 'heroImage',
	title: 'title',
	subtitle: 'subtitle',
	cta1: 'cta1',
	cta1Text: 'cta1Text',
}

// =============  defaultData =============

const component = frame().css({
	minHeight: '100svh',
	maxHeight: '60rem',
	justifyContent: 'start',
	position: 'relative',
}).serialize()

const overlay = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			position: 'absolute',
			left: '0',
			top: '0',
			right: '0',
			bottom: '0',
			width: '100%',
			height: '100%',
			zIndex: '-1',
			backgroundColor: 'hsla(0, 0%, 0%, 0.5)',
		},
	}
	draft.children = [
		txt('') // This is a hack to remove the plus button appearing on the box
	]
}).serialize()


const heroImage = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			position: 'absolute',
			left: '0',
			top: '0',
			right: '0',
			bottom: '0',
			width: '100%',
			height: '100%',
			objectFit: 'cover',
			zIndex: '-2',
		},
	}
	draft.data.src = Expression.fromString('https://files.dotenx.com/assets/bg-light-138489.jpg')
	draft.tagId = tagIds.heroImage
}).serialize()

const detailsWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			alignItems: 'flex-start',
			maxWidth: '35vw',
		},
	}
	draft.style.tablet = {
		default: {
			textAlign: 'center',
			justifyContent: 'center',
			alignItems: 'center',
			maxWidth: '100%',
		},
	}
}).serialize()

const title = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: fontSizes.h1.desktop,
			fontWeight: 'bold',
			color: 'hsla(0, 0%, 100%, 1)',
			marginBottom: '20px',
			marginTop: '5px',
		},
	}
	draft.style.tablet = {
		default: {
			marginBottom: '15px',
			fontSize: fontSizes.h1.tablet,
		},
	}
	draft.style.mobile = {
		default: {
			marginBottom: '10px',
			fontSize: fontSizes.h1.mobile,
		},
	}
	draft.data.text = Expression.fromString('Simplify your business')
	draft.tagId = tagIds.title
}).serialize()

const subtitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '18px',
			color: 'hsla(0, 0%, 100%, 1)',
			marginBottom: '30px',
		},
	}
	draft.style.tablet = {
		default: {
			fontSize: '15px',
			marginBottom: '20px',
		},
	}
	draft.style.mobile = {
		default: {
			fontSize: '12px',
			marginBottom: '10px',
		},
	}
	draft.data.text =
		Expression.fromString(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod nunc non risus ultrices, nec ultrices nisl aliquam. 
		Aliquam erat volutpat. Donec auctor, nisl eget ultricies ultricies, nisl nisl aliquam nisl, nec ultrices nisl nisl nec nisl.
	`)
	draft.tagId = tagIds.subtitle
}).serialize()

const ctaWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			columnGap: '20px',
		},
	}
	draft.style.tablet = {
		default: {
			columnGap: '10px',
		},
	}
	draft.style.mobile = {
		default: {
			columnGap: '5px',
		},
	}
}).serialize()

const cta1 = produce(new LinkElement(), (draft) => {
	draft.style.desktop = {
		default: {
			backgroundColor: 'hsla(0, 0%, 0%, 1)',
			border: 'none',
			borderRadius: '10px',
			textAlign: 'center',
			textDecoration: 'none',
			cursor: 'pointer',
			paddingTop: '8px',
			paddingBottom: '8px',
			paddingLeft: '20px',
			paddingRight: '20px',
		},
	}
	draft.style.tablet = {
		default: {
			justifySelf: 'center',
			paddingLeft: '15px',
			paddingRight: '15px',
		},
	}

	const element = new TextElement()
	element.data.text = Expression.fromString('Get Started Now')
	element.tagId = tagIds.cta1Text
	element.style.desktop = {
		default: {
			color: 'hsla(0, 0%, 100%, 1)',
			fontSize: '22px',
			fontWeight: 'bold',
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
	draft.tagId = tagIds.cta1
}).serialize()

const defaultData = {
	...component,
	components: [
		{
			...detailsWrapper,
			components: [
				title,
				subtitle,
				{ ...ctaWrapper, components: [cta1] },
			],
		},
		overlay,
		heroImage,
	],
}
