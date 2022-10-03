import { ColorInput } from '@mantine/core'
import produce from 'immer'
import { CollapseLine } from '../ui/collapse-line'
import { InputWithUnit } from '../ui/style-input'
import { useEditStyle } from './use-edit-style'

export function ShadowsEditor() {
	const { style: styles, editStyle } = useEditStyle()
	const shadowProperties = styles.boxShadow?.split(' ')
	const shadowX = shadowProperties?.[0]
	const shadowY = shadowProperties?.[1]
	const shadowBlur = shadowProperties?.[2]
	const shadowSpread = shadowProperties?.[3]
	const shadowColor = shadowProperties?.[4]

	return (
		<CollapseLine label="Shadows">
			<div className="grid items-center grid-cols-12 gap-y-2 gap-x-3">
				<p className="col-span-3">Color</p>
				<div className="col-span-9">
					<ColorInput
						value={shadowColor}
						onChange={(value) =>
							editStyle(
								'boxShadow',
								produce(shadowProperties, (draft) => {
									const withoutSpace = value.replaceAll(' ', '')
									if (draft) draft[4] = withoutSpace
									else return ['0px', '0px', '0px', '0px', withoutSpace]
								})?.join(' ') ?? ''
							)
						}
						format="hsla"
					/>
				</div>

				<p className="col-span-3">X</p>
				<div className="col-span-3">
					<InputWithUnit
						value={shadowX}
						onChange={(value) =>
							editStyle(
								'boxShadow',
								produce(shadowProperties, (draft) => {
									if (draft) draft[0] = value
									else return [value, '0px', '0px', '0px', 'rgba(0,0,0,0.5)']
								})?.join(' ') ?? ''
							)
						}
					/>
				</div>

				<p className="col-span-3">Y</p>
				<div className="col-span-3">
					<InputWithUnit
						value={shadowY}
						onChange={(value) =>
							editStyle(
								'boxShadow',
								produce(shadowProperties, (draft) => {
									if (draft) draft[1] = value
									else return ['0px', value, '0px', '0px', 'rgba(0,0,0,0.5)']
								})?.join(' ') ?? ''
							)
						}
					/>
				</div>

				<p className="col-span-3">Blur</p>
				<div className="col-span-3">
					<InputWithUnit
						value={shadowBlur}
						onChange={(value) =>
							editStyle(
								'boxShadow',
								produce(shadowProperties, (draft) => {
									if (draft) draft[2] = value
									else return ['0px', '0px', value, '0px', 'rgba(0,0,0,0.5)']
								})?.join(' ') ?? ''
							)
						}
					/>
				</div>

				<p className="col-span-3">Spread</p>
				<div className="col-span-3">
					<InputWithUnit
						value={shadowSpread}
						onChange={(value) =>
							editStyle(
								'boxShadow',
								produce(shadowProperties, (draft) => {
									if (draft) draft[3] = value
									else return ['0px', '0px', '0px', value, 'rgba(0,0,0,0.5)']
								})?.join(' ') ?? ''
							)
						}
					/>
				</div>
			</div>
		</CollapseLine>
	)
}
