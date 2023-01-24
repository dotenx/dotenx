import { Button, Select } from '@mantine/core'
import produce from 'immer'
import _ from 'lodash'
import { ReactNode, useState } from 'react'
import { TbMinus, TbPlus } from 'react-icons/tb'
import imageUrl from '../../assets/components/gelly-with-caption.png'
import { deserializeElement } from '../../utils/deserialize'
import { regenElement } from '../clipboard/copy-paste'
import { useSetElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { Expression } from '../states/expression'
import { BoxElementInputSimple } from '../ui/box-element-input'
import { ColumnsElementInput } from '../ui/columns-element-input'
import { ImageElementInput } from '../ui/image-element-input'
import { TextElementInput } from '../ui/text-element-input'
import { Controller, ElementOptions } from './controller'
import { ComponentName } from './helpers'

export class GalleryWithCaptions extends Controller {
	name = 'Gallery with image captions'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <GalleryWithCaptionsOptions />
	}
}

// =============  renderOptions =============

function GalleryWithCaptionsOptions() {
	const component = useSelectedElement<BoxElement>()!
	const [selectedTile, setSelectedTile] = useState(0)
	const set = useSetElement()
	const grid = component.children?.[0].children?.[0] as ColumnsElement
	const selectedItem = grid.children?.[selectedTile] as BoxElement
	const selectedTileImage = selectedItem.children?.[0] as ImageElement
	const tiles = grid.children?.map((_child, index) => ({
		label: `Tile ${index + 1}`,
		value: index.toString(),
	}))

	const addFeature = () => {
		set(grid, (draft) => draft.children?.push(regenElement(tile)))
	}

	const deleteFeature = () => {
		set(grid, (draft) => draft.children?.splice(selectedTile, 1))
		setSelectedTile(selectedTile > 0 ? selectedTile - 1 : 0)
	}

	return (
		<div className="space-y-6">
			<ComponentName name="Gallery with image captions" />
			<ColumnsElementInput element={grid} />
			<BoxElementInputSimple label="Background color" element={component} />
			<Button
				size="xs"
				fullWidth
				variant="outline"
				onClick={addFeature}
				leftIcon={<TbPlus />}
			>
				Add feature
			</Button>
			<Select
				label="Tiles"
				size="xs"
				placeholder="Select a tile"
				data={tiles}
				onChange={(value) => setSelectedTile(_.parseInt(value ?? '0'))}
				value={selectedTile.toString()}
			/>
			<TextElementInput
				label="Image caption"
				element={selectedItem.children?.[1] as TextElement}
			/>
			<ImageElementInput element={selectedTileImage} />
			<Button
				disabled={grid.children?.length === 1}
				size="xs"
				fullWidth
				variant="outline"
				onClick={deleteFeature}
				leftIcon={<TbMinus />}
			>
				Delete feature
			</Button>
		</div>
	)
}

// =============  defaultData =============

const wrapperDiv = produce(new BoxElement(), (draft) => {
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

const divFlex = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
		},
	}
}).serialize()

const tileTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '18px',
			fontWeight: '400',
			marginTop: '10px',
			color: 'black',
		},
	}
	draft.data.text = Expression.fromString('Caption')
})

const tileImage = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '100%',
			maxHeight: '400px',
			height: '100%',
			minHeight: '300px',
			objectFit: 'cover',
			objectPosition: 'center center',
		},
	}
	draft.data.src = Expression.fromString(
		'https://img.freepik.com/free-vector/pink-purple-shades-wavy-background_23-2148897830.jpg?w=740&t=st=1667653845~exp=1667654445~hmac=16b4314931be627c9c54ac2fc0ea554a9ee1b5d74458608932743cc34ac5cc56'
	)
})

const tile = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			padding: '10px',
			textAlign: 'center',
			borderRadius: '8px',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
		},
	}
	draft.children = [tileImage, tileTitle]
})

function createTile({ src, title }: { src: string; title: string }) {
	return produce(tile, (draft) => {
		const imageElement = draft.children[0] as ImageElement
		imageElement.data.src = Expression.fromString(src)
		const titleElement = draft.children?.[1] as TextElement
		titleElement.data.text = Expression.fromString(title)
	})
}
const tiles = [
	createTile({
		src: 'https://img.freepik.com/free-vector/green-shades-wavy-background_23-2148897829.jpg?w=740&t=st=1667653664~exp=1667654264~hmac=9526cd24b0865b9b6ed785cf3cfb27993f80343136cfb88551550d143f5b6b44',
		title: 'Customizable',
	}),
	createTile({
		src: 'https://img.freepik.com/free-vector/abstract-wallpaper-with-halftone_23-2148585152.jpg?t=st=1667653639~exp=1667654239~hmac=da2ff3def2e5cb24eeab3a1979b8701238081a3ed82ef3f58dd6216e8381fdae',
		title: 'Fast',
	}),
	createTile({
		src: 'https://img.freepik.com/free-vector/abstract-halftone-background-concept_23-2148605018.jpg?t=st=1667653639~exp=1667654239~hmac=00369d4f05fcda0c7131e9487f27e583f7a557ab648e593326d9fe9c86b10293',
		title: 'Made with Love',
	}),
	createTile({
		src: 'https://img.freepik.com/free-vector/halftone-effect-gradient-background_23-2148593366.jpg?w=740&t=st=1667653718~exp=1667654318~hmac=f661bfe1fc3b108ae80e4178f12893c7b2c9364f818de2ceb276edb9004cbfef',
		title: 'Easy to Use',
	}),
	createTile({
		src: 'https://img.freepik.com/free-vector/abstract-backgroud-concept_52683-43706.jpg?t=st=1667653639~exp=1667654239~hmac=45b124f9def8278922834cc158986cfaf6b3fc10f1a0f5a0d54e9c30b385800b',
		title: 'Cloud Storage',
	}),
	createTile({
		src: 'https://img.freepik.com/free-vector/abstract-neon-lights-background_52683-45117.jpg?t=st=1667653639~exp=1667654239~hmac=44d9c26a7c8f22bd2752f6785556945db7e7cb42b65987a534bfc28ec962ccdd',
		title: 'Instant Setup',
	}),
]

const grid = produce(new BoxElement(), (draft) => {
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
	...wrapperDiv,
	components: [
		{
			...divFlex,
			components: [
				{
					...grid,
					components: tiles.map((tile) => tile.serialize()),
				},
			],
		},
	],
}
