import { Select } from '@mantine/core'
import _ from 'lodash'
import { uuid } from '../../utils'
import { AnimationAction } from '../actions/action'
import { PRESETS } from '../animations/presets'
import { Element } from '../elements/element'
import { useSetWithElement } from '../elements/elements-store'
import { EventKind } from '../elements/event'
import { SliderNoMemo } from '../simple/stylers/columns-styler'
import { CollapseLine } from '../ui/collapse-line'

export function SimpleAnimationEditor({ element }: { element: Element }) {
	const presets = PRESETS.map((preset) => ({ label: preset.name, value: preset.id }))
	const set = useSetWithElement(element)

	return (
		<CollapseLine label="Animation" defaultClosed>
			<div className="space-y-2">
				<Select
					data={[{ label: 'No animation', value: 'No animation' }, ...presets]}
					label="Style"
					size="xs"
					value={element.animation?.data.id}
					onChange={(value) => {
						if (value === 'No animation') {
							set((draft) => (draft.animation = undefined))
						} else {
							set((draft) => {
								if (!draft.animation)
									draft.animation = {
										data: PRESETS[0],
										event: 'onVisible',
									}
								const selectedAnimation = PRESETS.find(
									(preset) => preset.id === value
								)
								if (selectedAnimation) {
									draft.animation.data = selectedAnimation
									draft.events = [
										{
											id: uuid(),
											kind:
												element.animation?.event === 'onVisible'
													? EventKind.Intersection
													: EventKind.MouseEnter,
											actions: [new AnimationAction(selectedAnimation.name)],
										},
									]
								} else console.warn('animation not found')
							})
						}
					}}
				/>
				<Select
					size="xs"
					label="Show"
					data={[
						{
							label: 'on visible',
							value: 'onVisible',
						},
						{
							label: 'on hover',
							value: 'onHover',
						},
					]}
					value={element.animation?.event}
					onChange={(value) => {
						set((draft) => {
							_.set(draft, 'animation.event', value ?? undefined)
							draft.events = [
								{
									id: uuid(),
									kind:
										value === 'onVisible'
											? EventKind.Intersection
											: EventKind.MouseEnter,
									actions: [
										new AnimationAction(element.animation?.data.name ?? ''),
									],
								},
							]
						})
					}}
				/>
				<p>Duration</p>
				<SliderNoMemo
					value={(element.animation?.data.duration ?? 1000) / 1000}
					min={0}
					max={10}
					label={(value) => value.toFixed(1)}
					step={0.1}
					styles={{ markLabel: { display: 'none' } }}
					onChange={(value) =>
						set((draft) => _.set(draft, 'animation.data.duration', value * 1000))
					}
				/>
				<p>Delay</p>
				<SliderNoMemo
					value={(element.animation?.data.delay ?? 1000) / 1000}
					min={0}
					max={10}
					label={(value) => value.toFixed(1)}
					step={0.1}
					styles={{ markLabel: { display: 'none' } }}
					onChange={(value) =>
						set((draft) => _.set(draft, 'animation.data.delay', value * 1000))
					}
				/>
				<Select
					label="Easing"
					size="xs"
					name="easing"
					mb="xs"
					data={['linear', 'spring']}
					value={element.animation?.data.easing}
					onChange={(value) =>
						set((draft) => _.set(draft, 'animation.data.easing', value ?? undefined))
					}
				/>
			</div>
		</CollapseLine>
	)
}
