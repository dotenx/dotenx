import { SegmentedControl, Select } from '@mantine/core'
import { TbArrowAutofitHeight, TbEye, TbEyeOff } from 'react-icons/tb'
import { toCenter } from '../../utils/center'
import { CollapseLine } from '../ui/collapse-line'
import { InputWithUnit } from '../ui/style-input'
import { useEditStyle } from './use-edit-style'

export const overflows = [
	{ label: <TbEye />, title: 'Visible', value: 'visible' },
	{ label: <TbEyeOff />, title: 'Hidden', value: 'hidden' },
	{ label: <TbArrowAutofitHeight />, title: 'Scroll', value: 'scroll' },
	{ label: <p className="text-xs leading-none">Auto</p>, title: 'Auto', value: 'auto' },
].map(toCenter)

export function SizeEditor({ simple }: { simple?: boolean }) {
	const { style: styles, editStyle } = useEditStyle()

	const widthInput = (
		<>
			<p className="col-span-3">Width</p>
			<div className="col-span-3">
				<InputWithUnit
					value={styles.width?.toString()}
					onChange={(value) => editStyle('width', value)}
				/>
			</div>
		</>
	)
	const heightInput = (
		<>
			<p className="col-span-3">Height</p>
			<div className="col-span-3">
				<InputWithUnit
					value={styles.height?.toString()}
					onChange={(value) => editStyle('height', value)}
				/>
			</div>
		</>
	)

	if (simple)
		return (
			<CollapseLine label="Size">
				<div className="grid items-center grid-cols-12 gap-x-3 gap-y-3">
					{widthInput}
					{heightInput}
				</div>
			</CollapseLine>
		)

	return (
		<CollapseLine label="Size">
			<div>
				<div className="grid items-center grid-cols-12 gap-x-3 gap-y-3">
					{widthInput}
					{heightInput}
					<p className="col-span-3">Min W</p>
					<div className="col-span-3">
						<InputWithUnit
							value={styles.minWidth?.toString()}
							onChange={(value) => editStyle('minWidth', value)}
						/>
					</div>
					<p className="col-span-3">Min H</p>
					<div className="col-span-3">
						<InputWithUnit
							value={styles.minHeight?.toString()}
							onChange={(value) => editStyle('minHeight', value)}
						/>
					</div>
					<p className="col-span-3">Max W</p>
					<div className="col-span-3">
						<InputWithUnit
							value={styles.maxWidth?.toString()}
							onChange={(value) => editStyle('maxWidth', value)}
						/>
					</div>
					<p className="col-span-3">Max H</p>
					<div className="col-span-3">
						<InputWithUnit
							value={styles.maxHeight?.toString()}
							onChange={(value) => editStyle('maxHeight', value)}
						/>
					</div>
				</div>
				<div className="grid items-center grid-cols-4 gap-2 mt-6">
					<p className="whitespace-nowrap">Overflow</p>
					<SegmentedControl
						data={overflows}
						value={styles.overflow ?? ''}
						onChange={(value) => editStyle('overflow', value)}
						size="xs"
						fullWidth
						className="col-span-3"
					/>
					<p className="whitespace-nowrap">Fit</p>
					<Select
						data={[
							{ label: 'Fill', value: 'fill' },
							{ label: 'Contain', value: 'contain' },
							{ label: 'Cover', value: 'cover' },
							{ label: 'None', value: 'none' },
							{ label: 'Scale Down', value: 'scale-down' },
						]}
						value={styles.objectFit ?? ''}
						onChange={(value) => editStyle('objectFit', value ?? '')}
						size="xs"
						className="col-span-3"
					/>
				</div>
			</div>
		</CollapseLine>
	)
}
