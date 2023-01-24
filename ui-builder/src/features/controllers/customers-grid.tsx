import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/customer-grid.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { BoxStylerSimple } from '../simple/stylers/box-styler'
import { ColumnsStyler } from '../simple/stylers/columns-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { inteliText } from '../ui/intelinput'
import { Controller, ElementOptions } from './controller'
import { ComponentName } from './helpers'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class CustomersGrid extends Controller {
	name = 'Customers grid'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <CustomersGridOptions />
	}
}

// =============  renderOptions =============

function CustomersGridOptions() {
	const component = useSelectedElement<BoxElement>()!
	const titleText = component.find<TextElement>(tagIds.titleText)!
	const subtitleText = component.find<TextElement>(tagIds.subtitleText)!
	const grid = component.find<ColumnsElement>(tagIds.grid)!

	const addGridItem = () =>
		createTile('https://cdn4.iconfinder.com/data/icons/social-media-logos-6/512/88-kik-256.png')

	return (
		<OptionsWrapper>
			<ComponentName name="Customers grid" />
			<ColumnsStyler element={grid} />
			<BoxStylerSimple label="Background color" element={component} />
			<TextStyler label="Title" element={titleText} />
			<TextStyler label="Subtitle" element={subtitleText} />
			<DndTabs
				containerElement={grid}
				renderItemOptions={(item) => <ImageStyler element={item as ImageElement} />}
				insertElement={addGridItem}
			/>
		</OptionsWrapper>
	)
}

const tagIds = {
	titleText: 'titleText',
	subtitleText: 'subtitleText',
	grid: 'grid',
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

const topDiv = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			textAlign: 'center',
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

const title = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '32px',
			marginBottom: '8px',
		},
	}
	draft.data.text = inteliText('Trusted by the world’s best')
	draft.tagId = tagIds.titleText
}).serialize()

const subtitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '24px',
			marginBottom: '12px',
		},
	}
	draft.data.text = inteliText('We’re proud to work with the world’s best brands')
	draft.tagId = tagIds.subtitleText
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
			...topDiv,
			components: [title, subtitle],
		},
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
