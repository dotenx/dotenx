import { ColorInput, Select } from '@mantine/core'
import { useAtomValue } from 'jotai'
import { Element } from '../elements/element'
import { selectedPaletteAtom } from '../simple/palette'
import { useParseBgColor } from './background-editor'
import { useEditStyle } from './use-edit-style'

const shadows = [
	{
		label: 'none',
		value: '-1',
	},
	{
		label: 'extra small',
		value: '0 1px 2px 0',
	},
	{
		label: 'small',
		value: '0 1px 3px 0',
	},
	{
		label: 'medium',
		value: '0 4px 6px -1px',
	},
	{
		label: 'large',
		value: '0 10px 15px -3px',
	},
	{
		label: 'extra large',
		value: '0 25px 50px -12px',
	},
]

export function SimpleModeShadowsEditor({ element }: { element?: Element | Element[] }) {
	const { style: styles, editStyle } = useEditStyle(element)
	const color = useParseBgColor(
		styles.boxShadow
			? (styles.boxShadow as string).match(
					/rgba\(\d*\.?\d*, \d*\.?\d*, \d*\.?\d*, \d*\.?\d*\)/g
			  )?.[0] || ''
			: ''
	)
	const palette = useAtomValue(selectedPaletteAtom)

	return (
		<div className="flex flex-col">
			<Select
				size="xs"
				label="Shadow"
				allowDeselect
				clearable
				data={shadows}
				value={styles.boxShadow ? styles.boxShadow.split(' rgba')?.[0] : '-1'}
				onChange={(value) => {
					if (value === '-1') {
						editStyle('boxShadow', '')
					} else {
						if (!styles.boxShadow) {
							editStyle('boxShadow', value + ' rgba(0, 0, 0, 0.1)')
						} else {
							editStyle(
								'boxShadow',
								replaceShadowSize(value as string, styles.boxShadow as string)
							)
						}
					}
				}}
			/>
			<ColorInput
				value={color}
				onChange={(value) =>
					editStyle('boxShadow', replaceShadowColor(value, styles.boxShadow as string))
				}
				className="col-span-9"
				size="xs"
				format="rgba"
				disabled={!styles.boxShadow}
				swatches={palette.colors}
			/>
		</div>
	)
}

function replaceShadowColor(color: string, shadow: string) {
	// Replace any rgba color in the shadow with the new color
	if (!shadow || !color) return shadow
	const newShadow = shadow.replace(/rgba\(\d*\.?\d*, \d*\.?\d*, \d*\.?\d*, \d*\.?\d*\)/g, color)
	return newShadow
}

function replaceShadowSize(size: string, shadow: string) {
	if (!shadow || !size) return shadow
	const newShadow = size + ` rgba${shadow.split('rgba')?.[1]}`
	console.log(`shadow: ${shadow}`)
	console.log(`size: ${size}`)
	console.log(`newShadow: ${newShadow}`)
	return newShadow
}
