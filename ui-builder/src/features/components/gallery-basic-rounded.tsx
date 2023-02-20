import { Button, Select } from '@mantine/core'
import produce from 'immer'
import _ from 'lodash'
import { ReactNode, useState } from 'react'
import { TbMinus, TbPlus } from 'react-icons/tb'
import imageUrl from '../../assets/components/gallery-basic-rounded.png'
import { deserializeElement } from '../../utils/deserialize'
import { regenElement } from '../clipboard/copy-paste'
import { useSetElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { ImageElement } from '../elements/extensions/image'
import { useSelectedElement } from '../selection/use-selected-component'
import { BoxStylerSimple } from '../simple/stylers/box-styler'
import { ColumnsStyler } from '../simple/stylers/columns-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { Expression } from '../states/expression'
import { Component, ElementOptions } from './component'
import { ComponentName, repeatObject } from './helpers'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class GalleryBasicRounded extends Component {
	name = 'Basic Gallery rounded'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <GalleryBasicRoundedOptions />
	}
}

// =============  renderOptions =============

const tagIds = {
	grid: 'grid',
}

function GalleryBasicRoundedOptions() {
	const component = useSelectedElement<BoxElement>()!
	const grid = component.find(tagIds.grid) as ColumnsElement

	return (
		<ComponentWrapper name="Gallery with rounded images">
			<ColumnsStyler element={grid} />
			<BoxStylerSimple label="Background color" element={component} />
			<DndTabs
				containerElement={grid}
				renderItemOptions={(item) => <ImageStyler element={item as ImageElement} />}
				insertElement={insertTab}
			/>
		</ComponentWrapper>
	)
}

const insertTab = () =>
	createTile({
		image: 'https://files.dotenx.com/assets/dessert-12455.jpeg',
	})

// =============  defaultData =============

const divFlex = produce(new BoxElement(), (draft) => {
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

const container = produce(new ColumnsElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr',
			gridGap: '20px',
			paddingLeft: '15%',
			paddingRight: '15%',
		},
	}
	draft.style.tablet = {
		default: {
			gridTemplateColumns: '1fr 1fr',
			paddingLeft: '10%',
			paddingRight: '10%',
		},
	}
	draft.style.mobile = {
		default: {
			gridTemplateColumns: '1fr',
			paddingLeft: '5%',
			paddingRight: '5%',
		},
	}
	draft.tagId = tagIds.grid
}).serialize()

function createTile({ image }: { image: string }) {
	return produce(new ImageElement(), (draft) => {
		draft.style.desktop = {
			default: {
				objectFit: 'cover',
				width: '100%',
				borderRadius: '15px',
			},
		}
		draft.data.src = Expression.fromString(image)
	})
}

const tiles = [
	createTile({
		image: 'https://files.dotenx.com/assets/dessert-iwr.jpeg',
	}),

	createTile({
		image: 'https://files.dotenx.com/assets/dessert-4324.jpeg',
	}),
	createTile({
		image: 'https://files.dotenx.com/assets/dessert-n234.jpeg',
	}),
	createTile({
		image: 'https://files.dotenx.com/assets/dessert-374.jpeg',
	}),
	createTile({
		image: 'https://files.dotenx.com/assets/dessert-v123.jpeg',
	}),
	createTile({
		image: 'https://files.dotenx.com/assets/dessert-12455.jpeg',
	}),
]
const defaultData = {
	...divFlex,
	components: [
		{
			...container,
			components: tiles.map((tile) => tile.serialize()),
		},
	],
}
