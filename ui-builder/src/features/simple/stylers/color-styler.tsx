import { ColorInput, Select } from '@mantine/core'
import { useAtomValue } from 'jotai'
import { Element } from '../../elements/element'
import { useEditStyle } from '../../style/use-edit-style'
import { colorNames, colorNamesSchema, selectedPaletteAtom } from '../palette'

export function ColorStyler({
	label,
	element,
	isBackground,
	onChange,
}: {
	label: string
	element?: Element | Element[]
	isBackground?: boolean
	onChange?: (value: string) => void
}) {
	const { style: styles, editStyle } = useEditStyle(element)
	const color = useParseBgColor(isBackground ? styles.backgroundColor ?? '' : styles.color ?? '')
	const palette = useAtomValue(selectedPaletteAtom)

	return (
		<ColorInput
			label={label}
			value={color}
			onChange={(value) => {
				editStyle(isBackground ? 'backgroundColor' : 'color', value)
				onChange?.(value)
			}}
			className="col-span-9"
			size="xs"
			format="hsla"
			swatches={palette.colors}
		/>
	)
}

export const useParseBgColor = (color: string) => {
	const palette = useAtomValue(selectedPaletteAtom)
	const colorName = colorNamesSchema.safeParse(color.split('--')?.[1]?.split(')')?.[0])
	if (!colorName.success) return color
	const paletteColorIndex = colorNames.indexOf(colorName.data)
	const paletteColor = palette.colors[paletteColorIndex]
	return paletteColor
}
