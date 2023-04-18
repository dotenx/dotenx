import produce from 'immer'
import imageUrl from '../../assets/components/hero-with-image-two-cta.png'
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
import { frame } from '../elements/constructor'

export class HeroWithImageTwoCta extends Component {
	name = 'Hero with image at the bottom and two CTAs'
	image = imageUrl
	defaultData = deserializeElement(defaultData)
	renderOptions = () => <HeroWithImageTwoCtaOptions />
}

// =============  renderOptions =============

function HeroWithImageTwoCtaOptions() {
	const component = useSelectedElement<BoxElement>()!
	const heroImage = component.find<ImageElement>(tagIds.heroImage)!
	const title = component.find<TextElement>(tagIds.title)!
	const subtitle = component.find<TextElement>(tagIds.subtitle)!
	const cta1 = component.find<LinkElement>(tagIds.cta1)!
	const cta1Text = component.find<TextElement>(tagIds.cta1Text)!
	const cta2 = component.find<LinkElement>(tagIds.cta2)!
	const cta2Text = component.find<TextElement>(tagIds.cta2Text)!

	return (
		<ComponentWrapper name="Hero with image at the bottom and two CTAs">
			<ImageStyler element={heroImage} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Subtitle" element={subtitle} />
			<TextStyler label="CTA1" element={cta1Text} />
			<LinkStyler label="CTA1 Link" element={cta1} />
			<TextStyler label="CTA2" element={cta2Text} />
			<LinkStyler label="CTA2 Link" element={cta2} />
		</ComponentWrapper>
	)
}

const tagIds = {
	heroImage: 'heroImage',
	title: 'title',
	subtitle: 'subtitle',
	cta1: 'cta1',
	cta1Text: 'cta1Text',
	cta2: 'cta2',
	cta2Text: 'cta2Text',
}

// =============  defaultData =============

const component = frame().css({
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'center',
	rowGap: '5rem'
}).cssTablet({
	rowGap: '3rem'
}).cssMobile({
	rowGap: '2rem'
})
.serialize()


const heroImage = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '100%',
			height: '100%',
			objectFit: 'cover',
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
			alignItems: 'center',
			maxWidth: '35vw',
		},
	}
	draft.style.tablet = {
		default: {
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
			color: 'hsla(0, 0%, 0%, 1)',
			marginBottom: '20px',
			marginTop: '5px',
			textAlign: 'center',
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
			color: 'hsla(0, 0%, 0%, 1)',
			marginBottom: '30px',
			textAlign: 'center',
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

const cta2 = produce(new LinkElement(), (draft) => {
	draft.style.desktop = {
		default: {
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: 'hsla(0, 0%, 0%, 1)',
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
	element.data.text = Expression.fromString('Request a Demo')
	element.tagId = tagIds.cta2Text
	element.style.desktop = {
		default: {
			color: 'hsla(0, 0%, 0%, 1)',
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
	draft.tagId = tagIds.cta2
}).serialize()

const defaultData = {
	...component,
	components: [
		{
			...detailsWrapper,
			components: [
				title,
				subtitle,
				{ ...ctaWrapper, components: [cta1, cta2] },
			],
		},
		heroImage,
	],
}
