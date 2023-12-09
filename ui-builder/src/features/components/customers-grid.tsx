import { produce } from 'immer'
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
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'

export class CustomersGrid extends Component {
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

	const addGridItem = () => createTile('https://files.dotenx.com/assets/logo1-fwe14we.png')

	return (
		<ComponentWrapper name="Customers grid">
			<ColumnsStyler element={grid} maxColumns={6} />
			<BoxStylerSimple label="Background color" element={component} />
			<TextStyler label="Title" element={titleText} />
			<TextStyler label="Subtitle" element={subtitleText} />
			<DndTabs
				containerElement={grid}
				renderItemOptions={(item) => <ImageStyler element={item as ImageElement} />}
				insertElement={addGridItem}
			/>
		</ComponentWrapper>
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

const title = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '32px',
			marginBottom: '8px',
		},
	}
	draft.data.text = inteliText("Trusted by the world's best")
	draft.tagId = tagIds.titleText
}).serialize()

const subtitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '24px',
			marginBottom: '12px',
		},
	}
	draft.data.text = inteliText("We're proud to work with the world's best brands")
	draft.tagId = tagIds.subtitleText
}).serialize()

const createTile = (image: string) => {
	return produce(new ImageElement(), (draft) => {
		draft.data.src = Expression.fromString(image)
		draft.style.desktop = {
			default: {
				marginLeft: 'auto',
				marginRight: 'auto',
				width: 'min(120px, 60%)',
			},
		}
		draft.style.tablet = {
			default: {
				width: 'min(80px, 60%)',
			},
		}
	})
}

const tiles = [
	createTile('https://files.dotenx.com/assets/Logo10-nmi1.png'),
	createTile('https://files.dotenx.com/assets/Logo7-32bn9.png'),
	createTile('https://files.dotenx.com/assets/Logo6-98ju.png'),
	createTile('https://files.dotenx.com/assets/Logo2-o234snoi.png'),
	createTile('https://files.dotenx.com/assets/Logo3-oo23coi.png'),
	createTile('https://files.dotenx.com/assets/Logo11-mn91.png'),
]

const grid = produce(new ColumnsElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
			justifyContent: 'space-between',
			alignItems: 'center',
			gridGap: '20px',
			width: '100%',
			paddingLeft: '15%',
			paddingRight: '15%',
			paddingTop: '40px',
			paddingBottom: '40px',
		},
	}
	draft.style.tablet = {
		default: {
			gridTemplateColumns: '1fr 1fr 1fr 1fr',
			paddingTop: '30px',
			paddingBottom: '30px',
		},
	}
	draft.style.mobile = {
		default: {
			gridTemplateColumns: '1fr 1fr',
			paddingTop: '20px',
			paddingBottom: '20px',
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
			...grid,
			components: tiles.map((tile) => tile.serialize()),
		},
	],
}
