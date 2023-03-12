import { ColorInput, Select } from '@mantine/core'
import { useAtomValue } from 'jotai'
import { Element } from '../elements/element'
import { colorNames, colorNamesSchema, selectedPaletteAtom } from '../simple/palette'
import { CollapseLine } from '../ui/collapse-line'
import { useEditStyle } from './use-edit-style'

const backgroundClippings = [
	{ label: 'None', value: 'border-box' },
	{ label: 'Padding', value: 'padding-box' },
	{ label: 'Content', value: 'content-box' },
	{ label: 'Text', value: 'text' },
]

export function BackgroundsEditor({
	simple,
	element,
}: {
	simple?: boolean
	element?: Element | Element[]
}) {
	const { style: styles, editStyle } = useEditStyle(element)
	const bgColor = useParseBgColor(styles.backgroundColor ?? '')
	const palette = useAtomValue(selectedPaletteAtom)

	return (
		<CollapseLine label="Background" defaultClosed>
			<div className="grid items-center grid-cols-12 gap-y-2">
				<p className="col-span-3">Color</p>
				<ColorInput
					value={bgColor}
					onChange={(value) => editStyle('backgroundColor', value)}
					className="col-span-9"
					size="xs"
					format="hsla"
					swatches={palette.colors}
				/>

				{!simple && (
					<>
						<p className="col-span-3">Clipping</p>
						<Select
							value={styles.backgroundClip ?? ''}
							onChange={(value) => editStyle('backgroundClip', value ?? '')}
							data={backgroundClippings}
							className="col-span-9"
							size="xs"
						/>
					</>
				)}
			</div>
		</CollapseLine>
	)
}

const useParseBgColor = (color: string) => {
	const palette = useAtomValue(selectedPaletteAtom)
	const colorName = colorNamesSchema.safeParse(color.split('--')?.[1]?.split(')')?.[0])
	if (!colorName.success) return color
	const paletteColorIndex = colorNames.indexOf(colorName.data)
	const paletteColor = palette.colors[paletteColorIndex]
	return paletteColor
}
