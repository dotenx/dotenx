import { Switch, TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/basic-video.png'
import { deserializeElement } from '../../utils/deserialize'
import { useSetElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { VideoElement } from '../elements/extensions/video'
import { useSelectedElement } from '../selection/use-selected-component'
import { VideoStyler } from '../simple/stylers/video-styler'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'

export class BasicVideo extends Component {
	name = 'Video'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <BasicVideoOptions />
	}
}

// =============  renderOptions =============

function BasicVideoOptions() {
	const component = useSelectedElement<BoxElement>()!
	const element = component.children[0] as VideoElement
	const set = useSetElement()

	return (
		<ComponentWrapper name="Video" stylers={['alignment', 'backgrounds', 'borders', 'spacing']}>
			<VideoStyler element={element} />
			<Switch
				size="xs"
				label="Controls"
				checked={element.data.controls}
				onChange={(event) =>
					set(element, (draft) => (draft.data.controls = event.target.checked))
				}
			/>
			<Switch
				size="xs"
				label="Auto play"
				checked={element.data.autoplay}
				onChange={(event) =>
					set(element, (draft) => (draft.data.autoplay = event.target.checked))
				}
			/>
			<Switch
				size="xs"
				label="Loop"
				checked={element.data.loop}
				onChange={(event) =>
					set(element, (draft) => (draft.data.loop = event.target.checked))
				}
			/>
			<Switch
				size="xs"
				label="Muted"
				checked={element.data.muted}
				onChange={(event) =>
					set(element, (draft) => (draft.data.muted = event.target.checked))
				}
			/>
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

	draft.children = [new VideoElement()]
}).serialize()
