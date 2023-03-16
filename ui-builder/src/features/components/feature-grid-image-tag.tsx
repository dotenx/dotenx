import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/feature-grid-image-tag.png'
import { deserializeElement } from '../../utils/deserialize'
import { regenElement } from '../clipboard/copy-paste'
import { box } from '../elements/constructor'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { color } from '../simple/palette'
import { BoxStyler } from '../simple/stylers/box-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class FeatureGridImageTag extends Component {
	name = 'Feature grid with image tag'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FeatureGridImageTagOptions />
	}
}

// =============  renderOptions =============

function FeatureGridImageTagOptions() {
	const component = useSelectedElement<BoxElement>()!
	const grid = component.find<ColumnsElement>(tagIds.grid)!

	return (
		<ComponentWrapper name="Feature grid with image tag">
			<DndTabs
				containerElement={grid}
				renderItemOptions={(item) => <TileOptions item={item} />}
				insertElement={() => regenElement(tile)}
				autoAdjustGridTemplateColumns={false}
			/>
		</ComponentWrapper>
	)
}

function TileOptions({ item }: { item: Element }) {
	const title = item.children?.[1] as TextElement
	const details = item.children?.[2] as TextElement
	const image = item.children?.[0] as ImageElement

	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<TextStyler label="Details" element={details} />
			<ImageStyler element={image} />
			<BoxStyler label="Block" element={item} />
		</OptionsWrapper>
	)
}

// =============  defaultData =============

const tagIds = {
	grid: 'grid',
}

const frame = box([])
	.css({
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		paddingTop: '40px',
		paddingBottom: '40px',
		paddingLeft: '15%',
		paddingRight: '15%',
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


const tileTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			color: color('primary'),
			fontSize: '16px',
			marginBottom: '18px',
		},
	}
	draft.data.text = Expression.fromString('Feature')
})

const tileDetails = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			color: color('text'),
			fontSize: '14px',
			textAlign: 'justify',
		},
	}
	draft.data.text = Expression.fromString('Feature description goes here')
})

const tileImage = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '25px',
			height: 'auto',
			objectFit: 'cover',
			objectPosition: 'center center',
			marginBottom: '5px',
		},
	}

	draft.data.src = Expression.fromString('https://files.dotenx.com/assets/icons-cloud-39.png')
})

const tile = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			paddingLeft: '10px',
			paddingRight: '10px',
			paddingTop: '10px',
			paddingBottom: '10px',
			textAlign: 'center',
			borderRadius: '8px',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'flex-start',
			alignItems: 'flex-start',
		},
	}
	draft.style.tablet = {
		default: {
			paddingLeft: '8px',
			paddingRight: '8px',
			paddingTop: '8px',
			paddingBottom: '8px',
		},
	}
	draft.style.mobile = {
		default: {
			paddingLeft: '6px',
			paddingRight: '6px',
			paddingTop: '6px',
			paddingBottom: '6px',
		},
	}
	draft.children = [tileImage, tileTitle, tileDetails]
})

function createTile({
	src,
	title,
	description,
}: {
	src: string
	title: string
	description: string
}) {
	return produce(tile, (draft) => {
		const iconElement = draft.children?.[0] as ImageElement
		iconElement.data.src = Expression.fromString(src)
		const titleElement = draft.children?.[1] as TextElement
		titleElement.data.text = Expression.fromString(title)
		const descriptionElement = draft.children?.[2] as TextElement
		descriptionElement.data.text = Expression.fromString(description)
	})
}
const tiles = [
	createTile({
		src: 'https://files.dotenx.com/assets/icons-cloud-39.png',
		title: 'Customizable',
		
		description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut fermentum lacinia, nunc est aliquam nunc, eu aliquet nisl nisl sit amet 
		erat. Nullam auctor, nunc eget lacinia fermentum, lacus odio aliquam`,
	}),
	createTile({
		src: 'https://files.dotenx.com/assets/icons-combo-chart-vii.png',
		title: 'Fast',
		description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut fermentum lacinia, nunc est aliquam nunc, eu aliquet nisl nisl sit amet 
		erat. Nullam auctor, nunc eget lacinia fermentum, lacus odio aliquam`,
	}),
	createTile({
		src: 'https://files.dotenx.com/assets/icons-credit-card-hwer.png',
		title: 'Made with Love',
		description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut fermentum lacinia, nunc est aliquam nunc, eu aliquet nisl nisl sit amet 
		erat. Nullam auctor, nunc eget lacinia fermentum, lacus odio aliquam`,
	}),
	createTile({
		src: 'https://files.dotenx.com/assets/icons-luggage-bh.png',
		title: 'Easy to Use',
		description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut fermentum lacinia, nunc est aliquam nunc, eu aliquet nisl nisl sit amet 
		erat. Nullam auctor, nunc eget lacinia fermentum, lacus odio aliquam`,
	}),
	createTile({
		src: 'https://files.dotenx.com/assets/icons-speaker-qer.png',
		title: 'Cloud Storage',
		description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut fermentum lacinia, nunc est aliquam nunc, eu aliquet nisl nisl sit amet 
		erat. Nullam auctor, nunc eget lacinia fermentum, lacus odio aliquam`,
	}),
	createTile({
		src: 'https://files.dotenx.com/assets/icons-stellar-bb.png',
		title: 'Instant Setup',
		description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut fermentum lacinia, nunc est aliquam nunc, eu aliquet nisl nisl sit amet 
		erat. Nullam auctor, nunc eget lacinia fermentum, lacus odio aliquam`,
	}),
]

const grid = produce(new ColumnsElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr 1fr',
			gridGap: '20px',
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
	...frame,
	components: [
		{
			...grid,
			components: tiles.map((tile) => tile.serialize()),
		},
	],
}
