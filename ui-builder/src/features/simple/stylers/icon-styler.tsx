import { ColorInput } from '@mantine/core'
import { useAtomValue } from 'jotai'
import _ from 'lodash'
import { useSetWithElement } from '../../elements/elements-store'
import { IconElement } from '../../elements/extensions/icon'
import { Expression } from '../../states/expression'
import { useParseBgColor } from '../../style/background-editor'
import { selectedPaletteAtom } from '../palette'

export function IconStyler({ label, element }: { label: string; element: IconElement }) {
	const set = useSetWithElement(element)
	const setColor = (value: string) => {
		set((draft) => _.set(draft, 'style.desktop.default.color', Expression.fromString(value)))
	}
	const color = useParseBgColor(element.style.desktop?.default?.color?.toString() ?? '')
	const palette = useAtomValue(selectedPaletteAtom)

	return (
		<ColorInput
			label={label}
			value={color}
			onChange={setColor}
			size="xs"
			format="hsla"
			swatches={palette.colors}
		/>
	)
}
