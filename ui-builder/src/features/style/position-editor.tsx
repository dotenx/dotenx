import { Select } from '@mantine/core'
import { CollapseLine } from '../ui/collapse-line'
import { MarginPaddingInput } from '../ui/style-input'
import { useEditStyle } from './use-edit-style'

const positions = [
	{ label: 'Static', value: 'static' },
	{ label: 'Relative', value: 'relative' },
	{ label: 'Absolute', value: 'absolute' },
	{ label: 'Fixed', value: 'fixed' },
	{ label: 'Sticky', value: 'sticky' },
]
export function PositionEditor() {
	const { style, editStyle } = useEditStyle()
	return (
		<CollapseLine label="Position" defaultClosed>
			<div>
				<Select
					value={style.position ?? ''}
					onChange={(value) => editStyle('position', value ?? '')}
					data={positions}
					size="xs"
				/>
				<div className="flex flex-col gap-2 px-2 py-2 mt-2 font-mono bg-white border rounded">
					<MarginPaddingInput
						value={style.top?.toString() ?? '0px'}
						onChange={(value) => editStyle('top', value)}
					/>
					<div className="flex items-center gap-2">
						<MarginPaddingInput
							value={style.left?.toString() ?? '0px'}
							onChange={(value) => editStyle('left', value)}
						/>
						<div className="h-4 bg-gray-200 border rounded grow" />
						<MarginPaddingInput
							value={style.right?.toString() ?? '0px'}
							onChange={(value) => editStyle('right', value)}
						/>
					</div>
					<MarginPaddingInput
						value={style.bottom?.toString() ?? '0px'}
						onChange={(value) => editStyle('bottom', value)}
					/>
				</div>
			</div>
		</CollapseLine>
	)
}
