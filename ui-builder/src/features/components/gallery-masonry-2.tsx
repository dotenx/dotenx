import { ReactNode } from 'react'
import imageUrl from '../../assets/components/gallery-masonry-2.png'
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

export class GalleryMasonryTwo extends Component {
	name = 'Masonry gallery - 2'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <GalleryMasonryTwoOptions />
	}
}

// =============  renderOptions =============

const tagIds = {
	grid: 'grid',
}

function GalleryMasonryTwoOptions() {
	const component = useSelectedElement<BoxElement>()!
	const grid = component.find(tagIds.grid) as ColumnsElement

	return (
		<ComponentWrapper name="Masonry gallery - 2">
			<DndTabs
				containerElement={grid}
				renderItemOptions={(item) => (
					<ImageStyler element={item.children![0] as ImageElement} />
				)}
				insertElement={insertTab}
				autoAdjustGridTemplateColumns={false}
			/>
		</ComponentWrapper>
	)
}

const insertTab = () => createTile('https://files.dotenx.com/assets/random-10-b01.jpg')

// =============  defaultData =============

const createTile = (src: string) =>
	box([
		img(src).css({
			width: '100%',
		}),
	]).css({
		float: 'left',
		display: 'inline-block',
		width: '100%',
	})

const tiles = [
	createTile('https://files.dotenx.com/assets/random-10-b01.jpg'),
	createTile('https://files.dotenx.com/assets/random-120-zed.jpg'),
	createTile('https://files.dotenx.com/assets/random-200-o24.jpg'),
	createTile('https://files.dotenx.com/assets/random-220-zx9.jpg'),
	createTile('https://files.dotenx.com/assets/random-300-iu42.jpg'),
	createTile('https://files.dotenx.com/assets/random-70-qoc.jpg'),
	createTile('https://files.dotenx.com/assets/random-300-mb.jpg'),
	createTile('https://files.dotenx.com/assets/random-400-32.jpg'),
	createTile('https://files.dotenx.com/assets/random-220-zx9.jpg'),
	createTile('https://files.dotenx.com/assets/random-50-iyr.jpg'),
	createTile('https://files.dotenx.com/assets/random-200-o24.jpg'),
	createTile('https://files.dotenx.com/assets/random-600-7bg.jpg'),
	createTile('https://files.dotenx.com/assets/random-120-zed.jpg'),
	createTile('https://files.dotenx.com/assets/random-400-32.jpg'),
	createTile('https://files.dotenx.com/assets/random-70-qoc.jpg'),
]
const defaultData = box([
	box(tiles).tag(tagIds.grid).css({
		columnCount: '4',
		columnGap: '0px',
		rowGap: '0px',
	}),
])
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
