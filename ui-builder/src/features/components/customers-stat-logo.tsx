import { produce } from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/customers-stat-logo.png'
import { deserializeElement } from '../../utils/deserialize'
import { box, txt } from '../elements/constructor'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { fontSizes } from '../simple/font-sizes'
import { color } from '../simple/palette'
import { ColumnsStyler } from '../simple/stylers/columns-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'

export class CustomersStatLogo extends Component {
	name = 'Customers logos with stat'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <CustomersStatLogoOptions />
	}
}

const tagIds = {
	statHeader: 'statHeader',
	statText: 'statText',
	grid: 'grid',
	stats: 'stats',
}

// =============  renderOptions =============

function CustomersStatLogoOptions() {
	const component = useSelectedElement<BoxElement>()!
	const grid = component.find<ColumnsElement>(tagIds.grid)!
	const statHeader = component.find<TextElement>(tagIds.statHeader)!
	const statText = component.find<TextElement>(tagIds.statText)!

	const addGridItem = () => createTile('https://files.dotenx.com/assets/logo1-fwe14we.png')

	return (
		<ComponentWrapper name="Customers logos with stat">
			<TextStyler label="Stat header" element={statHeader} />
			<TextStyler label="Stat text" element={statText} />
			<ColumnsStyler element={grid} maxColumns={6} />
			<DndTabs
				containerElement={grid}
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
		},
	}
	draft.style.tablet = {
		default: {
			gridTemplateColumns: '1fr 1fr 1fr 1fr',
		},
	}
	draft.style.mobile = {
		default: {
			gridTemplateColumns: '1fr 1fr',
		},
	}
	draft.tagId = tagIds.grid
}).serialize()

const stat = box([
	txt('7000+')
		.tag(tagIds.statHeader)
		.css({
			fontSize: fontSizes.h1.desktop,
			color: color('primary'),
		})
		.cssTablet({
			fontSize: fontSizes.h1.tablet,
		})
		.cssMobile({
			fontSize: fontSizes.h1.mobile,
		}),
	txt('Users have already trusted us')
		.tag(tagIds.statText)
		.css({
			fontSize: fontSizes.h4.desktop,
			color: color('primary', 0.9),
		})
		.cssTablet({
			fontSize: fontSizes.h4.tablet,
		})
		.cssMobile({
			fontSize: fontSizes.h4.mobile,
		}),
])
	.tag(tagIds.stats)
	.css({
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		justifyContent: 'flex-start',
		borderRightStyle: 'solid',
		borderRightWidth: '2px',
		borderRightColor: color('primary', 0.7),
		paddingRight: '15px',
		paddingTop: '5px',
		paddingBottom: '5px',
	})
	.cssTablet({
		paddingRight: '10px',
		paddingTop: '3px',
		paddingBottom: '3px',
	})
	.cssMobile({
		paddingRight: '5px',
		paddingTop: '2px',
		paddingBottom: '2px',
	})
	.serialize()

const wrapper = box([])
	.css({
		display: 'flex',
		alignItems: 'center',
		paddingLeft: '15%',
		paddingRight: '15%',
		paddingTop: '40px',
		paddingBottom: '40px',
	})
	.cssTablet({
		paddingLeft: '10%',
		paddingRight: '10%',
		paddingTop: '30px',
		paddingBottom: '30px',
	})
	.cssMobile({
		paddingLeft: '5%',
		paddingRight: '5%',
		paddingTop: '20px',
		paddingBottom: '20px',
	})
	.serialize()

const defaultData = {
	...wrapper,
	components: [
		stat,
		{
			...grid,
			components: tiles.map((tile) => tile.serialize()),
		},
	],
}
