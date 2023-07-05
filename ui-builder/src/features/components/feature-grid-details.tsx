import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/feature-grid-long-description.png'
import { deserializeElement } from '../../utils/deserialize'
import { regenElement } from '../clipboard/copy-paste'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { fontSizes } from '../simple/font-sizes'
import { BoxStyler } from '../simple/stylers/box-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class FeatureGridDetails extends Component {
	name = 'Feature grid with long description'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FeatureGridDetailsOptions />
	}
}

// =============  renderOptions =============

function FeatureGridDetailsOptions() {
	const component = useSelectedElement<BoxElement>()!
	const grid = component.find<ColumnsElement>(tagIds.grid)!

	return (
		<ComponentWrapper name="Feature grid with long description">
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

const tileTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontWeight: 500,
			fontSize: fontSizes.h4.desktop,
			marginBottom: '10px',
			marginTop: '20px',
		},
	}
	draft.style.tablet = {
		default: {
			fontWeight: 500,
			fontSize: fontSizes.h4.tablet,
		},
	}
	draft.style.mobile = {
		default: {
			fontWeight: 500,
			fontSize: fontSizes.h4.mobile,
		},
	}
	draft.data.text = Expression.fromString('Feature Title')
})

const tileDetails = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: fontSizes.normal.desktop,
		},
	}
	draft.style.tablet = {
		default: {
			fontSize: fontSizes.normal.tablet,
		},
	}
	draft.style.mobile = {
		default: {
			fontSize: fontSizes.normal.mobile,
		},
	}
	draft.data.text = Expression.fromString(
		'Lorem ipsum dolor sit amet elit adipisicing . Quod eaque, delectus officiis iusto numquam sunt nemo ullam quia beatae illum iste omnis quis, repudiandae reprehenderit corrupti! Ut reprehenderit earum quasi!'
	)
})

const tileImage = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: 'auto',
			height: '400px',
			objectFit: 'cover',
			objectPosition: 'center center',
		},
	}

	draft.data.src = Expression.fromString(
		'https://files.dotenx.com/a01a080236c5078c428bebba93a9ca96_69b5d85d-2883-4a49-b5ea-291dc5239df9.jpg'
	)
})

const tile = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			justifyContent: 'start',
			paddingLeft: '10px',
			paddingRight: '10px',
			paddingTop: '10px',
			paddingBottom: '10px',
			borderRadius: '8px',
			display: 'flex',
			flexDirection: 'column',
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
		src: 'https://files.dotenx.com/41371a6ff203059e890765e540d64781_835864c7-c570-4cc4-ab46-c13acd33477d.jpg',
		title: 'Feature Title',
		description:
			'Lorem ipsum dolor sit amet elit adipisicing . Quod eaque, delectus officiis iusto numquam sunt nemo ullam quia beatae illum iste omnis quis, repudiandae reprehenderit corrupti! Ut reprehenderit earum quasi!',
	}),
	createTile({
		src: 'https://files.dotenx.com/0b4f9437a01bcd9c2b89c7dceadc1f3b_900b9a20-d798-41fe-a5be-11c8fa166190.jpg',
		title: 'Feature Title',
		description:
			'Lorem ipsum dolor sit amet elit adipisicing . Quod eaque, delectus officiis iusto numquam sunt nemo ullam quia beatae illum iste omnis quis, repudiandae reprehenderit corrupti! Ut reprehenderit earum quasi!',
	}),
	createTile({
		src: 'https://files.dotenx.com/96900879596db5e3c0eb41f8429113b2_7ab4cdd2-6e5b-4252-9f69-cf6c58071fa2.jpg',
		title: 'Feature Title',
		description:
			'Lorem ipsum dolor sit amet elit adipisicing . Quod eaque, delectus officiis iusto numquam sunt nemo ullam quia beatae illum iste omnis quis, repudiandae reprehenderit corrupti! Ut reprehenderit earum quasi!',
	}),
	createTile({
		src: 'https://files.dotenx.com/a01a080236c5078c428bebba93a9ca96_69b5d85d-2883-4a49-b5ea-291dc5239df9.jpg',
		title: 'Feature Title',
		description:
			'Lorem ipsum dolor sit amet elit adipisicing . Quod eaque, delectus officiis iusto numquam sunt nemo ullam quia beatae illum iste omnis quis, repudiandae reprehenderit corrupti! Ut reprehenderit earum quasi!',
	}),
	createTile({
		src: 'https://files.dotenx.com/1debef53e1caf17a1f6d98c46761e7a7_63361063-0b60-4574-a101-662484ece172.jpg',
		title: 'Feature Title',
		description:
			'Lorem ipsum dolor sit amet elit adipisicing . Quod eaque, delectus officiis iusto numquam sunt nemo ullam quia beatae illum iste omnis quis, repudiandae reprehenderit corrupti! Ut reprehenderit earum quasi!',
	}),
	createTile({
		src: 'https://files.dotenx.com/3b66d6e743f3a41eb0cb2456f433b2a8_fe8cc17a-96a4-480b-8494-eaf804762614.jpg',
		title: 'Feature Title',
		description:
			'Lorem ipsum dolor sit amet elit adipisicing . Quod eaque, delectus officiis iusto numquam sunt nemo ullam quia beatae illum iste omnis quis, repudiandae reprehenderit corrupti! Ut reprehenderit earum quasi!',
	}),
]

const grid = produce(new ColumnsElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr',
			gridGap: '20px',
			rowGap: '40px',
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
