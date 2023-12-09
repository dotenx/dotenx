import { Button, Select } from '@mantine/core'
import { produce } from 'immer'
import _ from 'lodash'
import { ReactNode, useState } from 'react'
import { TbMinus, TbPlus } from 'react-icons/tb'
import imageUrl from '../../assets/components/gelly-with-caption.png'
import { deserializeElement } from '../../utils/deserialize'
import { regenElement } from '../clipboard/copy-paste'
import { Element } from '../elements/element'
import { useSetElement } from '../elements/elements-store'
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
import { Component, ElementOptions } from './component'
import { ComponentName } from './helpers'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class GalleryWithCaptions extends Component {
	name = 'Gallery with image captions'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <GalleryWithCaptionsOptions />
	}
}

// =============  renderOptions =============

const tagIds = {
	grid: 'grid',
}

function GalleryWithCaptionsOptions() {
	const component = useSelectedElement<BoxElement>()!
	const grid = component.find(tagIds.grid) as ColumnsElement

	return (
		<ComponentWrapper name="Gallery with image captions">
			<ColumnsStyler element={grid} />
			<BoxStylerSimple label="Background color" element={component} />
			<DndTabs
				containerElement={grid}
				renderItemOptions={(item) => <CellOptions item={item} />}
				insertElement={insertTab}
			/>
		</ComponentWrapper>
	)
}

const insertTab = () =>
	createTile({
		src: 'https://img.freepik.com/free-vector/green-shades-wavy-background_23-2148897829.jpg?w=740&t=st=1667653664~exp=1667654264~hmac=9526cd24b0865b9b6ed785cf3cfb27993f80343136cfb88551550d143f5b6b44',
		title: 'Customizable',
	})

// =============  defaultData =============

function CellOptions({ item }: { item: Element }) {
	const image = item.children?.[0] as ImageElement
	const caption = item.children?.[1] as TextElement

	return (
		<OptionsWrapper>
			<ImageStyler element={image} />
			<TextStyler label="Caption" element={caption} />
		</OptionsWrapper>
	)
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

const tileTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '18px',
			fontWeight: '400',
			marginTop: '10px',
			color: 'black',
		},
	}
	draft.data.text = Expression.fromString('Caption')
})

const tileImage = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '100%',
			height: 'auto',
			objectFit: 'cover',
		},
	}
	draft.data.src = Expression.fromString('https://files.dotenx.com/assets/abstract-bg-1k.jpeg')
})

const newTile = () =>
	produce(new BoxElement(), (draft) => {
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
		draft.children = [tileImage, tileTitle]
	})

function createTile({ src, title }: { src: string; title: string }) {
	return produce(newTile(), (draft) => {
		const imageElement = draft.children[0] as ImageElement
		imageElement.data.src = Expression.fromString(src)
		const titleElement = draft.children?.[1] as TextElement
		titleElement.data.text = Expression.fromString(title)
	})
}
const tiles = [
	createTile({
		src: 'https://files.dotenx.com/assets/abstract-bg-34k.jpeg',
		title: 'Customizable',
	}),
	createTile({
		src: 'https://files.dotenx.com/assets/abstract-bg-152.jpeg',
		title: 'Fast',
	}),
	createTile({
		src: 'https://files.dotenx.com/assets/abstract-bg-018.jpeg',
		title: 'Made with Love',
	}),
	createTile({
		src: 'https://files.dotenx.com/assets/abstract-bg-117.jpeg',
		title: 'Easy to Use',
	}),
	createTile({
		src: 'https://files.dotenx.com/assets/abstract-bg-1k.jpeg',
		title: 'Cloud Storage',
	}),
	createTile({
		src: 'https://files.dotenx.com/assets/abstract-bg-8k.jpeg',
		title: 'Instant Setup',
	}),
]

const grid = produce(new BoxElement(), (draft) => {
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
