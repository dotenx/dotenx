import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/hero-parallax.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { Controller, ElementOptions } from './controller'
import { extractUrl, SimpleComponentOptionsProps } from './helpers'

import TitleSubtitleCta from './basic-components/title-subtitle-cta'
import { ImageDrop } from '../ui/image-drop'

export class HeroParallax extends Controller {
	name = 'Hero with parallax'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		// return <div>options</div>
		return <HeroParallaxOptions options={options} />
	}
}

// =============  renderOptions =============

function HeroParallaxOptions({ options }: SimpleComponentOptionsProps) {
	const wrapper = options.element as BoxElement

	const titleSubtitleCtaOptions = titleSubtitleCta.getOptions({
		set: options.set,
		root: wrapper.children![0] as BoxElement,
	})

	return (
		<div className="space-y-6">
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
			{titleSubtitleCtaOptions}
		</div>
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
				'url(https://images.unsplash.com/photo-1506269996138-4c6d92fbd8a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2050&q=80)',
			height: '600px',
			backgroundAttachment: 'fixed',
			backgroundPosition: 'center',
			backgroundRepeat: 'no-repeat',
			backgroundSize: 'cover',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		},
	}
}).serialize()

const titleSubtitleCta = new TitleSubtitleCta()

const defaultData = {
	...wrapperDiv,
	components: [titleSubtitleCta.getComponent().serialize()],
}

// #endregion
