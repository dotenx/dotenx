import { Button, Select } from '@mantine/core'
import produce from 'immer'
import _ from 'lodash'
import { ReactNode, useState } from 'react'
import { TbMinus, TbPlus } from 'react-icons/tb'
import imageUrl from '../../assets/components/gallery-basic-rounded.png'
import { deserializeElement } from '../../utils/deserialize'
import { regenElement } from '../clipboard/copy-paste'
import { useSetElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { ImageElement } from '../elements/extensions/image'
import { useSelectedElement } from '../selection/use-selected-component'
import { Expression } from '../states/expression'
import { BoxElementInput } from '../ui/box-element-input'
import { ColumnsElementInput } from '../ui/columns-element-input'
import { ImageElementInput } from '../ui/image-element-input'
import { Controller, ElementOptions } from './controller'
import { ComponentName, repeatObject } from './helpers'

export class GalleryBasicRounded extends Controller {
	name = 'Basic Gallery rounded'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <GalleryBasicRoundedOptions />
	}
}

// =============  renderOptions =============

function GalleryBasicRoundedOptions() {
	const [selectedTile, setSelectedTile] = useState(0)
	const set = useSetElement()
	const component = useSelectedElement<BoxElement>()!
	const grid = component.children?.[0] as ColumnsElement
	const selectedCell = grid.children?.[selectedTile] as ImageElement
	const tiles = grid.children?.map((child, index) => ({
		label: `Tile ${index + 1}`,
		value: index + '',
	}))

	const addImage = () => {
		set(grid, (draft) => draft.children?.push(regenElement(deserializeElement(imgEl))))
	}

	const deleteImage = () => {
		set(grid, (draft) => draft.children?.splice(selectedTile, 1))
		setSelectedTile(selectedTile > 0 ? selectedTile - 1 : 0)
	}
	return (
		<div className="space-y-6">
			<ComponentName name="Basic Gallery rounded" />
			<ColumnsElementInput element={grid} />
			<Button size="xs" fullWidth variant="outline" onClick={addImage} leftIcon={<TbPlus />}>
				Add image
			</Button>
			<BoxElementInput label="Background color" element={component} />
			<Select
				label="Tiles"
				size="xs"
				placeholder="Select a tile"
				data={tiles}
				onChange={(value) => setSelectedTile(_.parseInt(value ?? '0'))}
				value={selectedTile.toString()}
			/>
			<ImageElementInput element={selectedCell} />
			<Button
				disabled={grid.children?.length === 1}
				size="xs"
				fullWidth
				variant="outline"
				onClick={deleteImage}
				leftIcon={<TbMinus />}
			>
				Delete image
			</Button>
		</div>
	)
}

// =============  defaultData =============

const divFlex = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
			paddingTop: '40px',
			paddingBottom: '40px',
		},
	}
}).serialize()

const imgEl = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			borderRadius: '15px',
			boxShadow:
				'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px',
			backgroundColor: '#ee0000',
			aspectRatio: '1',
			backgroundSize: 'cover',
			backgroundPosition: 'center center',
		},
	}
	draft.data.src = Expression.fromString(
		'https://images.unsplash.com/photo-1665636605198-c480dd90aefc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDM1fHhqUFI0aGxrQkdBfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
	)
}).serialize()

const container = produce(new ColumnsElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr',
			gridGap: '20px',
			width: '70%',
		},
	}
	draft.style.tablet = {
		default: {
			gridTemplateColumns: '1fr 1fr',
		},
	}
	draft.style.mobile = {
		default: {
			gridTemplateColumns: '1fr',
		},
	}
}).serialize()

const defaultData = {
	...divFlex,
	components: [
		{
			...container,
			components: repeatObject(imgEl, 6),
		},
	],
}
