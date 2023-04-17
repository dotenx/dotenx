import { ColorInput } from '@mantine/core'
import { useAtomValue } from 'jotai'
import _ from 'lodash'
import { useSetWithElement } from '../../elements/elements-store'
import { IconElement } from '../../elements/extensions/icon'
import { Expression } from '../../states/expression'
import { useParseBgColor } from '../../style/background-editor'
import { selectedPaletteAtom } from '../palette'
import { useEditStyle } from '../../style/use-edit-style'

export function IconStyler({ label, element }: { label: string; element: IconElement }) {

	const palette = useAtomValue(selectedPaletteAtom)
	const { style, editStyle } = useEditStyle(element)
	const color = useParseBgColor(style.color ?? '')

	return (
		<ColorInput
			label={label}
			value={color}
			onChange={(value) => editStyle('color', value)}
			size="xs"
			format="hsla"
			swatches={palette.colors}
		/>
	)
}
