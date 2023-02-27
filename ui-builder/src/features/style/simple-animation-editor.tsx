import { Select, Slider } from '@mantine/core'
import _ from 'lodash'
import { PRESETS } from '../animations/presets'
import { Element } from '../elements/element'
import { useSetWithElement } from '../elements/elements-store'
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
					value={element.animation?.name}
					onChange={(value) => {
						if (value === 'No animation') {
							set((draft) => (draft.animation = {}))
						} else {
							set((draft) => _.set(draft, 'animation.name', value ?? undefined))
						}
					}}
				/>
				<p>Duration</p>
				<Slider
					defaultValue={1}
					min={0}
					max={10}
					label={(value) => value.toFixed(1)}
					step={0.1}
					styles={{ markLabel: { display: 'none' } }}
					onChange={(value) =>
						set((draft) => _.set(draft, 'animation.duration', value * 1000))
					}
				/>
				<p>Delay</p>
				<Slider
					defaultValue={1}
					min={0}
					max={10}
					label={(value) => value.toFixed(1)}
					step={0.1}
					styles={{ markLabel: { display: 'none' } }}
					onChange={(value) =>
						set((draft) => _.set(draft, 'animation.delay', value * 1000))
					}
				/>
				<Select
					label="Easing"
					size="xs"
					name="easing"
					mb="xs"
					data={['linear', 'spring']}
					defaultValue="linear"
					onChange={(value) =>
						set((draft) => _.set(draft, 'animation.easing', value ?? undefined))
					}
				/>
			</div>
		</CollapseLine>
	)
}
