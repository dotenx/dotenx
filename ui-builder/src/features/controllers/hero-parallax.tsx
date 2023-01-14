import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/hero-parallax.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { Controller, ElementOptions } from './controller'
import { ComponentName, extractUrl, SimpleComponentOptionsProps } from './helpers'

import { ImageDrop } from '../ui/image-drop'
import TitleSubtitleCta from './basic-components/title-subtitle-cta'
import { OptionsWrapper } from './helpers/options-wrapper'
export class HeroParallax extends Controller {
	name = 'Hero with parallax'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <HeroParallaxOptions options={options} />
	}
}

// =============  renderOptions =============

function HeroParallaxOptions({ options }: SimpleComponentOptionsProps) {
	const wrapper = options.element as BoxElement
	const titleSubtitleCtaOptions = titleSubtitleCta.getOptions({
		root: wrapper.children![0] as BoxElement,
	})

	return (
		<OptionsWrapper>
			<ComponentName name="Hero with parallax" />
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
			<>{titleSubtitleCtaOptions}</>
		</OptionsWrapper>
	)
}

// #region defaultData

/*
This component renders a table with a grid of divs.
*/

const wrapperDiv = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			paddingLeft: '10%',
			paddingRight: '10%',
			backgroundImage:
				'url(https://img.freepik.com/free-photo/white-chrysanthemum-flowers-leaves-yellow-card_23-2148048390.jpg?w=900&t=st=1667055536~exp=1667056136~hmac=f232c6ad4062b0268f9527068ff24de1c0523e043db0c7623cedfc1ae3b52fd6)',
			height: '600px',
			backgroundAttachment: 'fixed',
			backgroundPosition: 'center',
			backgroundRepeat: 'no-repeat',
			backgroundSize: 'cover',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			textAlign: 'center',
		},
	}
}).serialize()

const titleSubtitleCta = new TitleSubtitleCta()

const defaultData = {
	...wrapperDiv,
	components: [titleSubtitleCta.getComponent().serialize()],
}

// #endregion
