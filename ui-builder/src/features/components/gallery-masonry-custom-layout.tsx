import { ReactNode } from 'react'
import imageUrl from '../../assets/components/gallery-masonry-custom-layout.png'
import { deserializeElement } from '../../utils/deserialize'
import { box, img } from '../elements/constructor'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { ImageElement } from '../elements/extensions/image'
import { useSelectedElement } from '../selection/use-selected-component'
import { ImageStyler } from '../simple/stylers/image-styler'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'
import { Element } from '../elements/element'
import { useSetElement } from '../elements/elements-store'
import { Select } from '@mantine/core'
import { produce } from 'immer'

export class GalleryMasonryCustomLayout extends Component {
	name = 'Masonry gallery with custom layout'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <GalleryMasonryCustomLayoutOptions />
	}
}

// =============  renderOptions =============

const tagIds = {
	grid: 'grid',
	image: 'image',
}

function GalleryMasonryCustomLayoutOptions() {
	const component = useSelectedElement<BoxElement>()!
	const grid = component.find(tagIds.grid) as ColumnsElement

	return (
		<ComponentWrapper name="Masonry gallery with custom layout">
			<DndTabs
				containerElement={grid}
				renderItemOptions={(item) => <TileOptions item={item} />}
				insertElement={insertTab}
				autoAdjustGridTemplateColumns={false}
			/>
		</ComponentWrapper>
	)
}

function TileOptions({ item }: { item: Element }) {

	const set = useSetElement()

	return (
		<OptionsWrapper>
			<ImageStyler element={item as ImageElement} />
			<Select
				label="Image mode"
				value={item.classes[0]}
				onChange={(value) => set(item, (draft) => (draft.classes = [value as string]))}
				data={[
					{ value: 'default', label: 'Default' },
					{ value: 'tall', label: 'Tall' },
					{ value: 'wide', label: 'Wide' },
				]}
			/>
		</OptionsWrapper>
	)
}

const insertTab = () => createTile('https://files.dotenx.com/assets/random-10-b01.jpg', 'default')

// =============  defaultData =============

const createTile = (src: string, imageClass: string) =>
img(src)
.css({
	width: '100%',
	height: '100%',
	borderRadius: '10px',
	objectFit: 'cover',
})
.tag(tagIds.image)
.class(imageClass)

const tiles = [
	createTile('https://files.dotenx.com/assets/random-10-b01.jpg', 'default'),
	createTile('https://files.dotenx.com/assets/random-120-zed.jpg', 'wide'),
	createTile('https://files.dotenx.com/assets/random-200-o24.jpg', 'default'),
	createTile('https://files.dotenx.com/assets/random-220-zx9.jpg', 'wide'),
	createTile('https://files.dotenx.com/assets/random-300-iu42.jpg', 'default'),
	createTile('https://files.dotenx.com/assets/random-300-mb.jpg', 'tall'),
	createTile('https://files.dotenx.com/assets/random-400-32.jpg', 'default'),
	createTile('https://files.dotenx.com/assets/random-50-iyr.jpg', 'tall'),
	createTile('https://files.dotenx.com/assets/random-600-7bg.jpg', 'wide'),
	createTile('https://files.dotenx.com/assets/random-70-qoc.jpg', 'default'),
]

const tilesWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: 'repeat(4, 1fr)',
			gap: '16px',
			gridAutoRows: '200px',
	gridAutoFlow: 'dense',
		},
	}
	draft.style.tablet = {
		default: {
			gridTemplateColumns: 'repeat(2, 1fr)',
		},
	}
	draft.style.mobile = {
		default: {
		},
	}
	draft.children = tiles
	draft.tagId = tagIds.grid
	draft.customStyle.desktop = {
		'.tall' : {
			gridRow: 'span 2',
		},
		'.wide' : {
			gridColumn: 'span 2',
		}
	}
})


const defaultData = box([tilesWrapper])
	.css({
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		paddingLeft: '10%',
		paddingRight: '10%',
		paddingTop: '40px',
		paddingBottom: '40px',
	})
	.cssTablet({
		paddingLeft: '8%',
		paddingRight: '8%',
		paddingTop: '20px',
		paddingBottom: '20px',
	})
	.css({
		paddingLeft: '3%',
		paddingRight: '3%',
		paddingTop: '10px',
		paddingBottom: '10px',
	})
	.serialize()
