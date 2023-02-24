import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/basic-youtube.png'
import { deserializeElement } from '../../utils/deserialize'
import { useSetElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { YouTubeElement } from '../elements/extensions/youtube'
import { useSelectedElement } from '../selection/use-selected-component'
import { YoutubeStyler } from '../simple/stylers/youtube-styler'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'

export class BasicYouTube extends Component {
	name = 'YouTube'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <BasicYouTubeOptions />
	}
}

// =============  renderOptions =============

function BasicYouTubeOptions() {
	const component = useSelectedElement<BoxElement>()!
	const element = component.children[0] as YouTubeElement
	const set = useSetElement()

	return (
		<ComponentWrapper name="Text">
			<YoutubeStyler element={element} />
		</ComponentWrapper>
	)
}

// =============  defaultData =============

const defaultData = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
		},
	}

	draft.children = [new YouTubeElement()]
}).serialize()
