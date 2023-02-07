import { ColorInput } from '@mantine/core'
import _ from 'lodash'
import { useSetWithElement } from '../../elements/elements-store'
import { IconElement } from '../../elements/extensions/icon'
import { Expression } from '../../states/expression'

export function IconStyler({ label, element }: { label: string; element: IconElement }) {
	const set = useSetWithElement(element)
	const setColor = (value: string) => {
		set((draft) => _.set(draft, 'style.desktop.default.color', Expression.fromString(value)))
	}

	return (
		<ColorInput
			label={label}
			value={element.style.desktop?.default?.color}
			onChange={setColor}
			size="xs"
			format="hsla"
		/>
	)
}
