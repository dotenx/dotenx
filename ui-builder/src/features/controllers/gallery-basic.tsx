import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/gallery-basic.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { ImageElement } from '../elements/extensions/image'
import { useSelectedElement } from '../selection/use-selected-component'
import { Expression } from '../states/expression'
import { BoxElementInputSimple } from '../ui/box-element-input'
import { ColumnsElementInput } from '../ui/columns-element-input'
import { ImageElementInput } from '../ui/image-element-input'
import { Controller, ElementOptions } from './controller'
import { ComponentName } from './helpers'
import { DndTabs } from './helpers/dnd-tabs'

export class GalleryBasic extends Controller {
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
		<div className="space-y-6">
			<ComponentName name="Basic Gallery" />
			<ColumnsElementInput element={grid} />
			<BoxElementInputSimple label="Background color" element={component} />
			<DndTabs
				containerElement={grid}
				renderItemOptions={(item) => <ImageElementInput element={item as ImageElement} />}
				insertElement={insertTab}
			/>
		</div>
	)
}

const insertTab = () =>
	createTile({
		image: 'https://images.unsplash.com/photo-1657310217253-176cd053e07e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
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

const imgEl = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			backgroundColor: '#fff',
			aspectRatio: '1',
			backgroundSize: 'cover',
			backgroundPosition: 'center center',
			height: '210px',
			objectFit: 'cover',
			width: '100%',
		},
	}
})

const container = produce(new ColumnsElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr',
			gridGap: '0px',
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
	draft.tagId = tagIds.grid
}).serialize()

function createTile({ image }: { image: string }) {
	return produce(imgEl, (draft) => {
		draft.data.src = Expression.fromString(image)
	})
}

const tiles = [
	createTile({
		image: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=435&q=80',
	}),

	createTile({
		image: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80',
	}),
	createTile({
		image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=464&q=80',
	}),
	createTile({
		image: 'https://images.unsplash.com/photo-1543076659-9380cdf10613?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
	}),
	createTile({
		image: 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=464&q=80',
	}),
	createTile({
		image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
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
