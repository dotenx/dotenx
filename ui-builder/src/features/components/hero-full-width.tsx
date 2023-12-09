import { produce } from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/hero-full-width.png'

import { deserializeElement } from '../../utils/deserialize'
import { useSetElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { BoxStylerSimple } from '../simple/stylers/box-styler'
import { LinkStyler } from '../simple/stylers/link-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { ImageDrop } from '../ui/image-drop'
import { Component, ElementOptions } from './component'
import { extractUrl } from './helpers'
import { ComponentWrapper } from './helpers/component-wrapper'

export class HeroFullWidth extends Component {
	name = 'Full width background hero'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <HeroFullWidthOptions />
	}
}

// =============  renderOptions =============

function HeroFullWidthOptions() {
	const component = useSelectedElement<BoxElement>()!
	const title = component.find(tagIds.title) as TextElement
	const subTitle = component.find(tagIds.subTitle) as TextElement
	const cta = component.find(tagIds.cta) as LinkElement
	const ctaText = cta.children[0]! as TextElement
	const set = useSetElement()

	return (
		<ComponentWrapper name="Full width background hero">
			<ImageDrop
				onChange={(src) =>
					set(
						component,
						(draft) => (draft.style.desktop!.default!.backgroundImage = `url(${src})`)
					)
				}
				src={extractUrl(component.style.desktop!.default!.backgroundImage as string)}
			/>
			<TextStyler label="Title" element={title} />
			<TextStyler label="Sub-title" element={subTitle} />
			<BoxStylerSimple label="CTA background color" element={cta} />
			<LinkStyler label="CTA Link" element={cta} />
			<TextStyler label="CTA" element={ctaText} />
		</ComponentWrapper>
	)
}

// =============  defaultData =============

const tagIds = {
	title: 'title',
	subTitle: 'subTitle',
	cta: 'cta',
}

const wrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			width: '100%',
			height: '600px',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundImage: 'url(https://files.dotenx.com/assets/hero-bg-wva.jpeg)',
			backgroundRepeat: 'no-repeat',
			backgroundAttachment: 'contain',
			backgroundPosition: 'center center',
			paddingLeft: '15%',
			paddingRight: '15%',
		},
	}

	draft.style.tablet = {
		default: {
			height: '500px',
			paddingLeft: '10%',
			paddingRight: '10%',
		},
	}

	draft.style.mobile = {
		default: {
			height: '400px',
			paddingLeft: '5%',
			paddingRight: '5%',
		},
	}
}).serialize()

const title = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '50px',
			fontWeight: 'bold',
			marginBottom: '30px',
			color: '#ffffff',
		},
	}

	draft.style.tablet = {
		default: {
			fontSize: '40px',
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

const subTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '18px',
			marginBottom: '30px',
			color: '#ffffff',
		},
	}

	draft.style.tablet = {
		default: {
			fontSize: '16px',
		},
	}

	draft.style.mobile = {
		default: {
			fontSize: '14px',
		},
	}

	draft.data.text = Expression.fromString(
		'Branding starts from the inside out. We help you build a strong brand from the inside out.'
	)
	draft.tagId = tagIds.subTitle
}).serialize()

const cta = produce(new LinkElement(), (draft) => {
	draft.style.desktop = {
		default: {
			backgroundColor: '#ffffff',
			border: 'none',
			paddingTop: '15px',
			paddingBottom: '15px',
			paddingLeft: '30px',
			paddingRight: '30px',
			borderRadius: '10px',
			marginTop: '10px',
			color: '#000000',
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
	draft.data.href = Expression.fromString('#')
	draft.data.openInNewTab = false
	draft.children = [element]
	draft.tagId = tagIds.cta
}).serialize()

const defaultData = {
	...wrapper,
	components: [title, subTitle, cta],
}
