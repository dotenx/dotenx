import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/feature-grid-images.png'
import { deserializeElement } from '../../utils/deserialize'
import { regenElement } from '../clipboard/copy-paste'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { BoxStylerSimple } from '../simple/stylers/box-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component, ElementOptions } from './controller'
import { ComponentName } from './helpers'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class FeatureGridImages extends Component {
	name = 'Feature Grid with images'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FeatureGridImagesOptions />
	}
}

// =============  renderOptions =============

function FeatureGridImagesOptions() {
	const component = useSelectedElement<BoxElement>()!
	const title = component.find<TextElement>(tagIds.title)!
	const subtitle = component.find<TextElement>(tagIds.subtitle)!
	const grid = component.find<ColumnsElement>(tagIds.grid)!

	return (
		<OptionsWrapper>
			<ComponentName name="Feature Grid with images" />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Subtitle" element={subtitle} />
			<BoxStylerSimple label="Background color" element={component} />
			<DndTabs
				containerElement={grid}
				renderItemOptions={(item) => <TileOptions item={item} />}
				insertElement={() => regenElement(tile)}
			/>
		</OptionsWrapper>
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

const tileImage = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '100%',
			maxHeight: '400px',
			height: 'auto',
			objectFit: 'cover',
			objectPosition: 'center center',
		},
	}

	draft.data.src = Expression.fromString('https://i.ibb.co/GHCF717/Marketing-bro.png')
})

const tile = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			padding: '10px',
			textAlign: 'center',
			borderRadius: '8px',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
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
		src: 'https://i.ibb.co/GHCF717/Marketing-bro.png',
		title: 'Customizable',
		description: 'Change the content and style and make it your own.',
	}),
	createTile({
		src: 'https://i.ibb.co/Jmrc06m/Construction-costs-amico.png',
		title: 'Fast',
		description: 'Fast load times and lag free interaction, my highest priority.',
	}),
	createTile({
		src: 'https://i.ibb.co/CWRLMwY/Marketing-cuate.png',
		title: 'Made with Love',
		description: 'Increase sales by showing true dedication to your customers.',
	}),
	createTile({
		src: 'https://i.ibb.co/Jmrc06m/Construction-costs-amico.png',
		title: 'Easy to Use',
		description: 'Ready to use with your own content, or customize the source files!',
	}),
	createTile({
		src: 'https://i.ibb.co/CWRLMwY/Marketing-cuate.png',
		title: 'Cloud Storage',
		description: 'Access your documents anywhere and share them with others.',
	}),
	createTile({
		src: 'https://i.ibb.co/GHCF717/Marketing-bro.png',
		title: 'Instant Setup',
		description: 'Get your projects up and running in no time using the theme documentation.',
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
