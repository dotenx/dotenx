import { TextInput } from '@mantine/core'
import { ReactNode } from 'react'
import { TbBrandYoutube } from 'react-icons/tb'
import { useSelectedElement } from '../../selection/use-selected-component'
import { Element } from '../element'
import { useSetElement } from '../elements-store'
import { Style } from '../style'

export class YouTubeElement extends Element {
	name = 'YouTube'
	icon = (<TbBrandYoutube />)
	style: Style = { desktop: { default: { minHeight: '150px', width: '100%' } } }
	data = { src: '' }

	render() {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100%',
				}}
				className={this.generateClasses()}
			>
				<TbBrandYoutube size={50} />
			</div>
		)
	}

	renderPreview() {
		return (
			<iframe
				src={this.data.src}
				title="YouTube video player"
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				className={this.generateClasses()}
			/>
		)
	}

	renderOptions(): ReactNode {
		return <YouTubeOptions />
	}
}

function YouTubeOptions() {
	const element = useSelectedElement() as YouTubeElement
	const set = useSetElement()

	return (
		<div className="space-y-6">
			<TextInput
				size="xs"
				label="Source"
				value={element.data.src}
				onChange={(event) => set(element, (draft) => (draft.data.src = event.target.value))}
			/>
		</div>
	)
}
