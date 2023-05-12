import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/gallery-basic.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { ImageElement } from '../elements/extensions/image'
import { useSelectedElement } from '../selection/use-selected-component'
import { BoxStylerSimple } from '../simple/stylers/box-styler'
import { ColumnsStyler } from '../simple/stylers/columns-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { Expression } from '../states/expression'
import { Component, ElementOptions } from './component'
import { ComponentName } from './helpers'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'

export class GalleryBasic extends Component {
	name = 'Basic Gallery'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <GalleryBasicOptions />
	}
}

// =============  renderOptions =============

const tagIds = {
	grid: 'grid',
}

function GalleryBasicOptions() {
	const component = useSelectedElement<BoxElement>()!
	const grid = component.find(tagIds.grid) as ColumnsElement

	return (
		<ComponentWrapper name="Basic Gallery">
			<ColumnsStyler element={grid} />
			<BoxStylerSimple label="Background color" element={component} />
			<DndTabs
				containerElement={grid}
				renderItemOptions={(item) => <ImageStyler element={item as ImageElement} />}
				insertElement={insertTab}
			/>
		</ComponentWrapper>
	)
}

const insertTab = () =>
	createTile({
		image: 'https://files.dotenx.com/assets/fruit-n84.jpeg',
	})

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

const container = produce(new ColumnsElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr',
			gridGap: '0px',
			paddingLeft: '15%',
			paddingRight: '15%',
		},
	}
	draft.style.tablet = {
		default: {
			gridTemplateColumns: '1fr 1fr',
			paddingLeft: '10%',
			paddingRight: '10%',
		},
	}
	draft.style.mobile = {
		default: {
			gridTemplateColumns: '1fr',
			paddingLeft: '5%',
			paddingRight: '5%',
		},
	}
	draft.tagId = tagIds.grid
}).serialize()

function createTile({ image }: { image: string }) {
	return produce(new ImageElement(), (draft) => {
		draft.style.desktop = {
			default: {
				objectFit: 'cover',
				width: '100%',
			},
		}
		draft.data.src = Expression.fromString(image)
	})
}

const tiles = [
	createTile({
		image: 'https://files.dotenx.com/assets/fruit-42.jpeg',
	}),

	createTile({
		image: 'https://files.dotenx.com/assets/fruit-bnb1.jpeg',
	}),
	createTile({
		image: 'https://files.dotenx.com/assets/fruit-b4.jpeg',
	}),
	createTile({
		image: 'https://files.dotenx.com/assets/fruit-0o.jpeg',
	}),
	createTile({
		image: 'https://files.dotenx.com/assets/fruit-ower.jpeg',
	}),
	createTile({
		image: 'https://files.dotenx.com/assets/fruit-nq1.jpeg',
	}),
]
const defaultData = {
	...divFlex,
	components: [
		{
			...container,
			components: tiles.map((tile) => tile.serialize()),
		},
	],
}
