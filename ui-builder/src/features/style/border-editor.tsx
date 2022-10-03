import { ColorInput, SegmentedControl } from '@mantine/core'
import { TbLineDashed, TbLineDotted, TbMinus, TbX } from 'react-icons/tb'
import { toCenter } from '../../utils/center'
import { CollapseLine } from '../ui/collapse-line'
import { InputWithUnit } from '../ui/style-input'
import { useEditStyle } from './use-edit-style'

const borderStyles = [
	{ label: <TbX />, title: 'None', value: 'none' },
	{ label: <TbMinus />, title: 'Solid', value: 'solid' },
	{ label: <TbLineDashed />, title: 'Dashed', value: 'dashed' },
	{ label: <TbLineDotted />, title: 'Dotted', value: 'dotted' },
].map(toCenter)

export function BordersEditor({ simple }: { simple?: boolean }) {
	const { style: styles, editStyle } = useEditStyle()

	const nonSimple = (
		<>
			<p className="col-span-3">Style</p>
			<SegmentedControl
				value={styles.borderStyle ?? 'none'}
				onChange={(value) => editStyle('borderStyle', value)}
				data={borderStyles}
				className="col-span-9"
				size="xs"
			/>

			<p className="col-span-3">Width</p>
			<div className="col-span-9">
				<InputWithUnit
					value={styles.borderWidth?.toString()}
					onChange={(value) => editStyle('borderWidth', value)}
				/>
			</div>

			<p className="col-span-3">Color</p>
			<ColorInput
				value={styles.borderColor ?? ''}
				onChange={(value) => editStyle('borderColor', value)}
				className="col-span-9"
				size="xs"
				autoComplete="off"
				name="color"
				format="hsla"
			/>
		</>
	)

	return (
		<CollapseLine label="Borders">
			<div className="grid items-center grid-cols-12 gap-y-2">
				<p className="col-span-3">Radius</p>
				<div className="col-span-9">
					<InputWithUnit
						value={styles.borderRadius?.toString()}
						onChange={(value) => editStyle('borderRadius', value)}
					/>
				</div>

				{!simple && nonSimple}
			</div>
		</CollapseLine>
	)
}
