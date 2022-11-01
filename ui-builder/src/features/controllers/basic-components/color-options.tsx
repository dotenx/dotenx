import { BoxElement } from '../../elements/extensions/box'
import { ColorInput } from '@mantine/core'
import produce from 'immer'
import { TextElement } from '../../elements/extensions/text'

function BackgroundColorOption({
	options,
	wrapperDiv,
	title,
	mapDiv,
}: {
	options: any
	wrapperDiv: BoxElement
	title?: string
	mapDiv?: any
}) {
	return (
		<div className="my-4">
			<ColorInput
				value={wrapperDiv.style.desktop!.default!.backgroundColor}
				label={title || 'Background color'}
				onChange={(value: any) => {
					if (mapDiv) {
						mapDiv?.map((d: BoxElement) => {
							options.set(
								produce(d as BoxElement, (draft) => {
									draft.style.desktop!.default!.backgroundColor = value
								})
							)
						})
					} else
						options.set(
							produce(wrapperDiv as BoxElement, (draft) => {
								draft.style.desktop!.default!.backgroundColor = value
							})
						)
				}}
				className="col-span-9"
				size="xs"
				format="hsla"
			/>
		</div>
	)
}
function TextColorOption({
	options,
	wrapperDiv,
	title,
	childIndex,
	mapDiv,
}: {
	options: any
	wrapperDiv: TextElement
	title: string
	mapDiv?: any
	childIndex?: number
}) {
	return (
		<div className="my-4">
			<ColorInput
				value={wrapperDiv.style.desktop!.default!.color}
				label={title}
				onChange={(value: any) => {
					if (mapDiv) {
						mapDiv?.map((d: any) => {
							options.set(
								produce(d.children?.[childIndex || 0] as TextElement, (draft) => {
									draft.style.desktop!.default!.color = value
								})
							)
						})
					} else
						options.set(
							produce(wrapperDiv as TextElement, (draft) => {
								draft.style.desktop!.default!.color = value
							})
						)
				}}
				className="col-span-9"
				size="xs"
				format="hsla"
			/>
		</div>
	)
}

export default class ColorOptions {
	static getBackgroundOption = ({
		options,
		wrapperDiv,
		title,
		mapDiv,
	}: {
		options: any
		mapDiv?: any
		wrapperDiv: any
		title?: string
	}) => (
		<BackgroundColorOption
			options={options}
			wrapperDiv={wrapperDiv}
			mapDiv={mapDiv}
			title={title}
		/>
	)
	static getTextColorOption = ({
		options,
		wrapperDiv,
		title,
		mapDiv,
		childIndex,
	}: {
		options: any
		wrapperDiv: any
		title: string
		mapDiv?: any
		childIndex?: number
	}) => (
		<TextColorOption
			options={options}
			wrapperDiv={wrapperDiv}
			title={title}
			mapDiv={mapDiv}
			childIndex={childIndex}
		/>
	)
}
