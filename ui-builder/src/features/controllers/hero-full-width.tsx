import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/hero-full-width.png'

import { deserializeElement } from '../../utils/deserialize'
import { useSetElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { Expression } from '../states/expression'
import { BoxElementInput } from '../ui/box-element-input'
import { ImageDrop } from '../ui/image-drop'
import { LinkElementInput } from '../ui/link-element-input'
import { TextElementInput } from '../ui/text-element-input'
import { Controller, ElementOptions } from './controller'
import { ComponentName, extractUrl } from './helpers'
import { OptionsWrapper } from './helpers/options-wrapper'

export class HeroFullWidth extends Controller {
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
	const title = component.children?.[0].children?.[0] as TextElement
	const subTitle = component.children?.[0].children?.[1] as TextElement
	const cta = component.children?.[0].children?.[2] as LinkElement
	const ctaText = cta.children?.[0] as TextElement
	const set = useSetElement()

	return (
		<OptionsWrapper>
			<ComponentName name="Full width background hero" />
			<ImageDrop
				onChange={(src) =>
					set(
						component,
						(draft) => (draft.style.desktop!.default!.backgroundImage = `url(${src})`)
					)
				}
				src={extractUrl(component.style.desktop!.default!.backgroundImage as string)}
			/>
			<TextElementInput label="Title" element={title} />
			<TextElementInput label="Sub-title" element={subTitle} />
			<BoxElementInput label="Background color" element={component} />
			<BoxElementInput label="CTA background color" element={component} />
			<TextElementInput label="CTA" element={ctaText} />
			<LinkElementInput label="CTA Link" element={cta} />
		</OptionsWrapper>
	)
}

// =============  defaultData =============

const wrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			width: '100%',
			height: '600px',
			alignItems: 'center',
			justifyContent: 'flex-start',
			fontFamily: 'Rubik sans-serif',
			backgroundImage:
				'url(https://img.freepik.com/free-vector/tired-overworked-secretary-accountant-working-laptop-near-pile-folders-throwing-papers-vector-illustration-stress-work-workaholic-busy-office-employee-concept_74855-13264.jpg?w=1380&t=st=1665974691~exp=1665975291~hmac=099a0bacfb35efb0ab7f891c9e84d97e5f1adfe24049895efe2a1514964f8106)',
			backgroundRepeat: 'no-repeat',
			backgroundAttachment: 'fixed',
			backgroundPosition: 'right',
			backgroundSize: '100% auto',
			paddingLeft: '10%',
			paddingRight: '10%',
		},
	}
	draft.style.mobile = {
		default: {
			height: '350px',
			backgroundPosition: 'right 10% bottom 80%', // todo: check why this is not working as expected. Expected right center to work
			backgroundSize: '60% auto',
			paddingLeft: '10%',
			paddingRight: '10%',
		},
	}
}).serialize()

const detailsWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'flex-start',
			maxWidth: '30%',
			lineHeight: '1.78',
		},
	}
	draft.style.tablet = {
		default: {
			lineHeight: '1.3',
		},
	}
	draft.style.mobile = {
		default: {
			maxWidth: '50%',
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
}).serialize()

const cta = produce(new LinkElement(), (draft) => {
	draft.style.desktop = {
		default: {
			backgroundColor: '#7670f1',
			border: 'none',
			padding: '15px',
			borderRadius: '10px',
			marginTop: '10px',
			width: '180px',
			height: 'auto',
			color: 'white',
			fontSize: '24px',
			fontWeight: 'bold',
			textAlign: 'center',
			textDecoration: 'none',
			cursor: 'pointer',
		},
	}
	draft.style.mobile = {
		default: {
			padding: '10px',
			borderRadius: '8px',
			marginTop: '8px',
			width: '100px',
			fontSize: '16px',
			fontWeight: 'bold',
		},
	}
	const element = new TextElement()
	element.data.text = Expression.fromString('Get Started')
	draft.data.href = Expression.fromString('#')
	draft.data.openInNewTab = false
	draft.children = [element]
}).serialize()

const defaultData = {
	...wrapper,
	components: [
		{
			...detailsWrapper,
			components: [title, subTitle, cta],
		},
	],
}
