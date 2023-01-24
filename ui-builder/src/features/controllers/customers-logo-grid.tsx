import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/customer-logo-grid.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { ImageElement } from '../elements/extensions/image'
import { useSelectedElement } from '../selection/use-selected-component'
import { Expression } from '../states/expression'
import { BoxElementInputSimple } from '../ui/box-element-input'
import { ImageElementInput } from '../ui/image-element-input'
import { Controller, ElementOptions } from './controller'
import { ComponentName } from './helpers'
import { DndTabs } from './helpers/dnd-tabs'

export class CustomersLogoGrid extends Controller {
	name = 'Customers logo grid'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <CustomersLogoGridOptions />
	}
}

// =============  renderOptions =============

function CustomersLogoGridOptions() {
	const component = useSelectedElement()!
	const grid = component.find<BoxElement>(tagIds.grid)!

	const addGridItem = () =>
		createTile('https://cdn4.iconfinder.com/data/icons/social-media-logos-6/512/88-kik-256.png')

	return (
		<div className="space-y-6">
			<ComponentName name="Customers logo grid" />
			<BoxElementInputSimple label="Background color" element={component} />
			<DndTabs
				containerElement={grid}
				renderItemOptions={(item) => <ImageElementInput element={item as ImageElement} />}
				insertElement={addGridItem}
			/>
		</div>
	)
}

// =============  defaultData =============

const tagIds = {
	grid: 'grid',
}

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

const tile = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			aspectRatio: '1',
		},
	}
	draft.data.src = Expression.fromString(
		'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/87_Diaspora_logo_logos-256.png'
	)
})

const createTile = (image: string) => {
	return produce(tile, (draft) => {
		draft.data.src = Expression.fromString(image)
	})
}

const tiles = [
	createTile(
		'https://cdn4.iconfinder.com/data/icons/social-media-logos-6/512/117-Evernote-256.png'
	),
	createTile(
		'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/11_Airbnb_logo_logos-256.png'
	),
	createTile(
		'https://cdn4.iconfinder.com/data/icons/social-media-logos-6/512/53-pandora-256.png'
	),
	createTile('https://cdn4.iconfinder.com/data/icons/social-media-logos-6/512/50-picasa-256.png'),
	createTile(
		'https://cdn0.iconfinder.com/data/icons/brands-flat-2/187/vimeo-social-network-brand-logo-256.png'
	),
	createTile('https://cdn4.iconfinder.com/data/icons/social-media-logos-6/512/88-kik-256.png'),
]

const grid = produce(new ColumnsElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
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
	draft.tagId = tagIds.grid
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
