import { Switch, TextInput } from '@mantine/core'
import { ReactNode } from 'react'
import { TbVideo } from 'react-icons/tb'
import { useSelectedElement } from '../../selection/use-selected-component'
import { Element } from '../element'
import { useSetElement } from '../elements-store'
import { Style } from '../style'

export class VideoElement extends Element {
	name = 'Video'
	icon = (<TbVideo />)
	style: Style = { desktop: { default: {  width: '100%' } } }
	data = { src: '', poster: '', controls: true, autoplay: false, loop: false, muted: false }

	render(): ReactNode {
		return (
			<video {...this.data} className={this.generateClasses()}>
				Sorry, your browser doesn&apos;t support embedded videos.
			</video>
		)
	}

	renderOptions(): ReactNode {
		return <VideoOptions />
	}
}

function VideoOptions() {
	const element = useSelectedElement() as VideoElement
	const set = useSetElement()

	return (
		<div className="space-y-6">
			<TextInput
				size="xs"
				label="Source"
				value={element.data.src}
				onChange={(event) => set(element, (draft) => (draft.data.src = event.target.value))}
			/>
			<TextInput
				size="xs"
				label="Poster"
				value={element.data.poster}
				onChange={(event) =>
					set(element, (draft) => (draft.data.poster = event.target.value))
				}
			/>
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
		</div>
	)
}
