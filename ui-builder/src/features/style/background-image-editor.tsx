import { ActionIcon, Select } from '@mantine/core'
import {
	TbLayoutAlignBottom,
	TbLayoutAlignCenter,
	TbLayoutAlignLeft,
	TbLayoutAlignRight,
	TbLayoutAlignTop,
} from 'react-icons/tb'
import { extractUrl } from '../components/helpers'
import { Element } from '../elements/element'
import { CollapseLine } from '../ui/collapse-line'
import { ImageDrop } from '../ui/image-drop'
import { useEditStyle } from './use-edit-style'

export function BackgroundImageEditor({ element }: { element?: Element | Element[] }) {
	const { style: styles, editStyle } = useEditStyle(element)

	return (
		<CollapseLine label="Background image" defaultClosed>
			<ImageDrop
				src={extractUrl(styles.backgroundImage as string)}
				onChange={(value) => {
					editStyle('backgroundImage', `url(${value})`)
					if (!styles.backgroundRepeat) {
						editStyle('backgroundRepeat', 'no-repeat')
					}
					if (!styles.backgroundSize) {
						editStyle('backgroundSize', 'contain')
					}
				}}
			/>
			<div className="flex justify-between items-center my-2">
				<ActionIcon
					variant={styles.backgroundPositionX === 'left' ? 'filled' : 'transparent'}
					size="sm"
					className="bg-gray-100"
					onClick={() => {
						editStyle('backgroundPositionX', 'left')
					}}
				>
					<TbLayoutAlignLeft />
				</ActionIcon>
				<ActionIcon
					variant={styles.backgroundPositionX === 'center' ? 'filled' : 'transparent'}
					size="sm"
					onClick={() => {
						editStyle('backgroundPositionX', 'center')
					}}
				>
					<TbLayoutAlignCenter />
				</ActionIcon>
				<ActionIcon
					variant={styles.backgroundPositionX === 'right' ? 'filled' : 'transparent'}
					size="sm"
					onClick={() => {
						editStyle('backgroundPositionX', 'right')
					}}
				>
					<TbLayoutAlignRight />
				</ActionIcon>
			</div>
			<div className="flex justify-between items-center  mb-2">
				<ActionIcon
					variant={styles.backgroundPositionY === 'top' ? 'filled' : 'transparent'}
					size="sm"
					className="bg-gray-100"
					onClick={() => {
						editStyle('backgroundPositionY', 'top')
					}}
				>
					<TbLayoutAlignTop />
				</ActionIcon>
				<ActionIcon
					variant={styles.backgroundPositionY === 'center' ? 'filled' : 'transparent'}
					size="sm"
					onClick={() => {
						editStyle('backgroundPositionY', 'center')
					}}
				>
					<TbLayoutAlignCenter />
				</ActionIcon>
				<ActionIcon
					variant={styles.backgroundPositionY === 'bottom' ? 'filled' : 'transparent'}
					size="sm"
					onClick={() => {
						editStyle('backgroundPositionY', 'bottom')
					}}
				>
					<TbLayoutAlignBottom />
				</ActionIcon>
			</div>
			<div className="grid items-center grid-cols-12 gap-y-2 mb-2">
				<p className="col-span-3">Repeat</p>
				<Select
					value={styles.backgroundRepeat}
					onChange={(value) => editStyle('backgroundRepeat', value)}
					data={[
						{ label: 'No repeat', value: 'no-repeat' },
						{ label: 'Repeat', value: 'repeat' },
						{ label: 'Repeat X', value: 'repeat-x' },
						{ label: 'Repeat Y', value: 'repeat-y' },
						{ label: 'Round', value: 'round' },
					]}
					className="col-span-9"
					size="xs"
				/>
			</div>
			<div className="grid items-center grid-cols-12 gap-y-2">
				<p className="col-span-3">Size</p>
				<Select
					value={(styles.backgroundSize as string) ?? 'auto'}
					onChange={(value) => editStyle('backgroundSize', value)}
					data={[
						{ label: 'Auto', value: 'auto' },
						{ label: 'Cover', value: 'cover' },
						{ label: 'Contain', value: 'contain' },
					]}
					className="col-span-9"
					size="xs"
				/>
			</div>
		</CollapseLine>
	)
}
