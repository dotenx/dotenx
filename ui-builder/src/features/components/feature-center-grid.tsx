import { produce } from 'immer'
import _ from 'lodash'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/feature-center-grid.png'
import { deserializeElement } from '../../utils/deserialize'
import { regenElement } from '../clipboard/copy-paste'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { IconElement } from '../elements/extensions/icon'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { ColumnsStyler } from '../simple/stylers/columns-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'
import { Element } from '../elements/element'
import { IconPicker } from '../simple/stylers/icon-picker'
import { BoxStyler } from '../simple/stylers/box-styler'

export class FeatureCenterGrid extends Component {
	name = 'Feature grid'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FeatureCenterGridOptions />
	}
}

// =============  renderOptions =============

// TODO: The options are rendered too slowly. We need to optimize it.

function FeatureCenterGridOptions() {
	const component = useSelectedElement<BoxElement>()!
	const title = component.find<TextElement>(tagIds.title)!
	const subtitle = component.find<TextElement>(tagIds.subtitle)!
	const grid = component.find<ColumnsElement>(tagIds.grid)!

	return (
		<ComponentWrapper
			name="Feature grid"
			stylers={['backgrounds', 'spacing', 'background-image']}
		>
			<TextStyler label="Main title" element={title} />
			<TextStyler label="Second title" element={subtitle} />
			<ColumnsStyler element={grid} />
			<DndTabs
				containerElement={grid}
				renderItemOptions={(item) => <CellOptions item={item} />}
				insertElement={() => regenElement(tile)}
			/>
		</ComponentWrapper>
	)
}

function CellOptions({ item }: { item: Element }) {
	const icon = item.children?.[0] as IconElement
	const title = item.children?.[1] as TextElement
	const description = item.children?.[2] as TextElement

	return (
		<OptionsWrapper>
			<TextStyler label="Feature title" element={title} />
			<TextStyler label="Feature description" element={description} />
			<BoxStyler label="Block" element={item} />
			<IconPicker element={icon} />
		</OptionsWrapper>
	)
}

// =============  defaultData =============

const tagIds = {
	title: 'title',
	subtitle: 'subtitle',
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

	draft.style.tablet = {
		default: {
			fontSize: '28px',
		},
	}

	draft.style.mobile = {
		default: {
			fontSize: '24px',
		},
	}

	draft.data.text = Expression.fromString('Features')
	draft.tagId = tagIds.title
}).serialize()

const subtitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '24px',
			marginBottom: '12px',
		},
	}

	draft.style.tablet = {
		default: {
			fontSize: '20px',
		},
	}

	draft.style.mobile = {
		default: {
			fontSize: '16px',
		},
	}

	draft.data.text = Expression.fromString('With our platform you can do this and that')
	draft.tagId = tagIds.subtitle
}).serialize()

const tileTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '16px',
			marginBottom: '18px',
		},
	}
	draft.data.text = Expression.fromString('Feature')
})

const tileDetails = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '14px',
		},
	}
	draft.data.text = Expression.fromString('Feature description goes here')
})

const tileIcon = produce(new IconElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '20px',
			height: '20px',
			color: '#ff0000',
			marginBottom: '10px',
		},
	}
	draft.data.name = 'bell'
	draft.data.type = 'fas'
})

const tile = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
		},
	}
	draft.children = [tileIcon, tileTitle, tileDetails]
})

function createTile({
	icon,
	title,
	description,
}: {
	icon: { color: string; name: string; type: string }
	title: string
	description: string
}) {
	return produce(tile, (draft) => {
		const iconElement = draft.children?.[0] as IconElement
		iconElement.data.name = icon.name
		iconElement.data.type = icon.type
		iconElement.style.desktop!.default!.color = icon.color
		const titleElement = draft.children?.[1] as TextElement
		titleElement.data.text = Expression.fromString(title)
		const descriptionElement = draft.children?.[2] as TextElement
		descriptionElement.data.text = Expression.fromString(description)
	})
}

const tiles = [
	createTile({
		icon: { name: 'code', type: 'fas', color: '#ff0000' },
		title: 'Customizable',
		description: 'Change the content and style and make it your own.',
	}),
	createTile({
		icon: { name: 'rocket', type: 'fas', color: '#a8a8a8' },
		title: 'Fast',
		description: 'Fast load times and lag free interaction, my highest priority.',
	}),
	createTile({
		icon: { name: 'heart', type: 'fas', color: '#ff0000' },
		title: 'Made with Love',
		description: 'Increase sales by showing true dedication to your customers.',
	}),
	createTile({
		icon: { name: 'cog', type: 'fas', color: '#e6e6e6' },
		title: 'Easy to Use',
		description: 'Ready to use with your own content, or customize the source files!',
	}),
	createTile({
		icon: { name: 'bolt', type: 'fas', color: '#01a9b4' },
		title: 'Instant Setup',
		description: 'Get your projects up and running in no time using the theme documentation.',
	}),
	createTile({
		icon: { name: 'cloud', type: 'fas', color: '#1c7430' },
		title: 'Cloud Storage',
		description: 'Access your documents anywhere and share them with others.',
	}),
]

const grid = produce(new ColumnsElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr',
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
