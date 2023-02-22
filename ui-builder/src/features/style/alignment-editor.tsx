import { ActionIcon, ColorInput, Select } from '@mantine/core'
import { Element } from '../elements/element'
import { CollapseLine } from '../ui/collapse-line'
import { useEditStyle } from './use-edit-style'
import {
	TbLayoutAlignTop,
	TbLayoutAlignBottom,
	TbLayoutAlignCenter,
	TbLayoutAlignLeft,
	TbLayoutAlignRight,
} from 'react-icons/tb'

const backgroundClippings = [
	{ label: 'None', value: 'border-box' },
	{ label: 'Padding', value: 'padding-box' },
	{ label: 'Content', value: 'content-box' },
	{ label: 'Text', value: 'text' },
]

export function AlignmentEditor({
	element,
	direction,
}: {
	element?: Element | Element[]
	direction: 'row' | 'column'
}) {
	const { style: styles, editStyle } = useEditStyle(element)

	return (
		<CollapseLine label="Alignment" defaultClosed>
			<div className="flex justify-between items-center">
				<ActionIcon
					variant={styles.justifyContent === 'flex-start' ? 'filled' : 'transparent'}
					size="sm"
					className="bg-gray-100"
					onClick={() => {
						editStyle('justifyContent', 'flex-start')
					}}
				>
					{direction === 'row' ? <TbLayoutAlignLeft /> : <TbLayoutAlignTop />}
				</ActionIcon>
				<ActionIcon
					variant={styles.justifyContent === 'center' ? 'filled' : 'transparent'}
					size="sm"
					onClick={() => {
						editStyle('justifyContent', 'center')
					}}
				>
					<TbLayoutAlignCenter />
				</ActionIcon>
				<ActionIcon
					variant={styles.justifyContent === 'flex-end' ? 'filled' : 'transparent'}
					size="sm"
					onClick={() => {
						editStyle('justifyContent', 'flex-end')
					}}
				>
					{direction === 'row' ? <TbLayoutAlignRight /> : <TbLayoutAlignBottom />}
				</ActionIcon>

			</div>
		</CollapseLine>
	)
}
