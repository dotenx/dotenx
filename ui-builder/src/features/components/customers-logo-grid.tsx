import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/customer-logo-grid.png'
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

export class CustomersLogoGrid extends Component {
	name = 'Customers logo grid'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <CustomersLogoGridOptions />
	}
}

// =============  renderOptions =============

function CustomersLogoGridOptions() {
	const component = useSelectedElement<ColumnsElement>()!

	const addGridItem = () => createTile('https://files.dotenx.com/assets/logo1-fwe14we.png')

	return (
		<ComponentWrapper name="Customers logo grid">
			<ColumnsStyler element={component} maxColumns={6} />
			<BoxStylerSimple label="Background color" element={component} />
			<DndTabs
				containerElement={component}
				renderItemOptions={(item) => <ImageStyler element={item as ImageElement} />}
				insertElement={addGridItem}
			/>
		</ComponentWrapper>
	)
}

// =============  defaultData =============

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
}).serialize()

const defaultData = {
	...grid,
	components: tiles.map((tile) => tile.serialize()),
}
