import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/hero-cta-right.png'

import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { Expression } from '../states/expression'
import { ImageDrop } from '../ui/image-drop'
import { Intelinput, inteliText } from '../ui/intelinput'
import ColorOptions from './basic-components/color-options'
import { Controller, ElementOptions } from './controller'
import {
	ComponentName,
	DividerCollapsible,
	extractUrl,
	SimpleComponentOptionsProps,
} from './helpers'

export class HeroCtaRight extends Controller {
	name = 'Hero with CTA on the right'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <HeroCtaRightOptions options={options} />
	}
}

// =============  renderOptions =============

function HeroCtaRightOptions({ options }: SimpleComponentOptionsProps) {
	const wrapper = options.element as BoxElement
	const title = options.element.children?.[0].children?.[0] as TextElement
	const subTitle = options.element.children?.[0].children?.[1] as TextElement
	const cta = options.element.children?.[0].children?.[2] as LinkElement
	const ctaText = cta.children?.[0] as TextElement

	return (
		<div className="space-y-6">
			<ComponentName name="Hero with CTA on the right" />
			<ImageDrop
				onChange={(src) =>
					options.set(
						produce(wrapper, (draft) => {
							draft.style.desktop!.default!.backgroundImage = `url(${src})`
						})
					)
				}
				src={extractUrl(wrapper.style.desktop!.default!.backgroundImage as string)}
			/>
			<Intelinput
				label="Title"
				name="title"
				size="xs"
				value={title.data.text}
				onChange={(value) =>
					options.set(
						produce(title, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<Intelinput
				label="Sub-title"
				name="subtitle"
				size="xs"
				value={subTitle.data.text}
				onChange={(value) =>
					options.set(
						produce(subTitle, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<DividerCollapsible closed title="Color">
				{ColorOptions.getBackgroundOption({ options, wrapperDiv: wrapper })}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: title,
					title: 'Title color',
				})}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: subTitle,
					title: 'Subtitle color',
				})}
				{ColorOptions.getBackgroundOption({
					options,
					wrapperDiv: cta,
					title: 'CTA background color',
				})}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: cta,
					title: 'CTA text color',
				})}
			</DividerCollapsible>
			<Intelinput
				label="CTA"
				name="cta"
				size="xs"
				value={ctaText.data.text}
				onChange={(value) =>
					options.set(
						produce(ctaText, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<Intelinput
				label="CTA Link"
				name="ctaLink"
				size="xs"
				value={cta.data.href}
				onChange={(value) =>
					options.set(
						produce(cta, (draft) => {
							draft.data.href = value
						})
					)
				}
			/>
		</div>
	)
}

// =============  defaultData =============

const wrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'row-reverse',
			width: '100%',
			height: '600px',
			alignItems: 'center',
			justifyContent: 'flex-start',
			fontFamily: 'Rubik sans-serif',
			backgroundImage:
				'url(https://img.freepik.com/free-vector/tired-overworked-secretary-accountant-working-laptop-near-pile-folders-throwing-papers-vector-illustration-stress-work-workaholic-busy-office-employee-concept_74855-13264.jpg?w=1380&t=st=1665974691~exp=1665975291~hmac=099a0bacfb35efb0ab7f891c9e84d97e5f1adfe24049895efe2a1514964f8106)',
			backgroundRepeat: 'no-repeat',
			backgroundAttachment: 'fixed',
			backgroundPosition: 'left',
			backgroundSize: '60% auto',
			paddingLeft: '10%',
			paddingRight: '10%',
		},
	}
	draft.style.mobile = {
		default: {
			height: '350px',
			backgroundPosition: 'left 10% bottom 80%', // todo: check why this is not working as expected. Expected left center to work
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

	draft.data.text = inteliText('Simplify your business')
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
	draft.data.text = inteliText(
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
	element.data.text = inteliText('Get Started')

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
