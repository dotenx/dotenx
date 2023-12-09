import { produce } from 'immer'
import _ from 'lodash'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/feature-cards-image.png'
import { deserializeElement } from '../../utils/deserialize'
import { regenElement } from '../clipboard/copy-paste'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
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
import { BoxStyler } from '../simple/stylers/box-styler'
import { color } from '../simple/palette'
import { ImageElement } from '../elements/extensions/image'
import { ImageStyler } from '../simple/stylers/image-styler'

export class FeatureCardsImage extends Component {
	name = 'Feature cards with images'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FeatureCardsImageOptions />
	}
}

// =============  renderOptions =============

function FeatureCardsImageOptions() {
	const component = useSelectedElement<BoxElement>()!
	const title = component.find<TextElement>(tagIds.title)!
	const subtitle = component.find<TextElement>(tagIds.subtitle)!
	const grid = component.find<ColumnsElement>(tagIds.grid)!

	return (
		<ComponentWrapper name="Feature cards with images">
			<TextStyler label="Title" element={title} />
			<TextStyler label="Subtitle" element={subtitle} />
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
	const icon = item.children?.[0] as ImageElement
	const title = item.children?.[1] as TextElement
	const description = item.children?.[2] as TextElement

	return (
		<OptionsWrapper>
			<ImageStyler element={icon} />
			<TextStyler label="Feature title" element={title} />
			<TextStyler label="Feature description" element={description} />
			<BoxStyler label="Block" element={item} />
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
			color: color('primary'),
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
			color: color('primary', 0.9),
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
			color: color('secondary'),
			fontSize: '16px',
			marginBottom: '18px',
		},
	}
	draft.data.text = Expression.fromString('Feature')
})

const tileDetails = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			color: color('primary', 0.7),
			fontSize: '14px',
		},
	}
	draft.data.text = Expression.fromString('Feature description goes here')
})

const tileIcon = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '20px',
			height: '20px',
			marginBottom: '10px',
		},
	}
	draft.data.src = Expression.fromString('https://files.dotenx.com/assets/icons-cloud-39.png')
})

const tile = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '100%',
			minHeight: '60%',
			paddingLeft: '10px',
			paddingRight: '10px',
			paddingTop: '20px',
			paddingBottom: '20px',
			backgroundColor: 'rgb(248 250 252)',
			textAlign: 'center',
			boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.16)',
			borderRadius: '8px',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
		},
	}
	draft.children = [tileIcon, tileTitle, tileDetails]
})

function createTile({
	imageUrl,
	title,
	description,
}: {
	imageUrl: string
	title: string
	description: string
}) {
	return produce(tile, (draft) => {
		const iconElement = draft.children?.[0] as ImageElement
		iconElement.data.src = Expression.fromString(imageUrl)
		const titleElement = draft.children?.[1] as TextElement
		titleElement.data.text = Expression.fromString(title)
		const descriptionElement = draft.children?.[2] as TextElement
		descriptionElement.data.text = Expression.fromString(description)
	})
}

const tiles = [
	createTile({
		imageUrl: 'https://files.dotenx.com/assets/icons-cloud-39.png',
		title: 'Customizable',
		description:
			'Change the content and style and make it your own.Change the content and style and make it your own.',
	}),
	createTile({
		imageUrl: 'https://files.dotenx.com/assets/icons-combo-chart-vii.png',
		title: 'Fast',
		description:
			'Fast load times and lag free interaction, my highest priority.Fast load times and lag free interaction, my highest priority.',
	}),
	createTile({
		imageUrl: 'https://files.dotenx.com/assets/icons-credit-card-hwer.png',
		title: 'Made with Love',
		description:
			'Increase sales by showing true dedication to your customers.Increase sales by showing true dedication to your customers.',
	}),
	createTile({
		imageUrl: 'https://files.dotenx.com/assets/icons-luggage-bh.png',
		title: 'Easy to Use',
		description:
			'Ready to use with your own content, or customize the source files!Ready to use with your own content, or customize the source files!',
	}),
	createTile({
		imageUrl: 'https://files.dotenx.com/assets/icons-speaker-qer.png',
		title: 'Instant Setup',
		description:
			'Get your projects up and running in no time using the theme documentation.Get your projects up and running in no time using the theme documentation.',
	}),
	createTile({
		imageUrl: 'https://files.dotenx.com/assets/icons-stellar-bb.png',
		title: 'Cloud Storage',
		description:
			'Access your documents anywhere and share them with others.Access your documents anywhere and share them with others.',
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
