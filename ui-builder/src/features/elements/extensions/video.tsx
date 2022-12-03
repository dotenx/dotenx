import { TextInput } from '@mantine/core'
import { ReactNode } from 'react'
import { TbVideo } from 'react-icons/tb'
import { useSelectedElement } from '../../selection/use-selected-component'
import { Element } from '../element'
import { useSetElement } from '../elements-store'
import { Style } from '../style'

export class VideoElement extends Element {
	name = 'Video'
	icon = (<TbVideo />)
	style: Style = { desktop: { default: { minHeight: '150px', width: '100%' } } }
	data = { src: '' }

	render(): ReactNode {
		return (
			<video controls src={this.data.src} className={this.generateClasses()}>
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
		<div>
			<TextInput
				size="xs"
				label="Alt text"
				value={element.data.src}
				onChange={(event) => set(element, (draft) => (draft.data.src = event.target.value))}
			/>
		</div>
	)
}
