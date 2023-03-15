import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/team-center-grid.png'
import { deserializeElement } from '../../utils/deserialize'
import { regenElement } from '../clipboard/copy-paste'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { BoxStyler, BoxStylerSimple } from '../simple/stylers/box-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import ColorOptions from './basic-components/color-options'
import { Component, ElementOptions } from './component'
import { ComponentName, DividerCollapsible, SimpleComponentOptionsProps } from './helpers'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class TeamCenterGrid extends Component {
	name = 'Team grid'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <GalleryBasicOptions options={options} />
	}
}

// =============  renderOptions =============

function GalleryBasicOptions({ options }: SimpleComponentOptionsProps) {
	const titleText = options.element.children?.[0].children?.[0] as TextElement
	const subtitleText = options.element.children?.[0].children?.[1] as TextElement
	const containerDiv = options.element.children?.[1].children?.[0] as BoxElement

	return (
		<ComponentWrapper name="Team grid">
			<TextStyler label="Title" element={titleText} />
			<TextStyler label="Subtitle" element={subtitleText} />
			<DndTabs
				containerElement={containerDiv}
				insertElement={newTile}
				renderItemOptions={(item) => <ItemOptions item={item} />}
				autoAdjustGridTemplateColumns={false}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: Element }) {
	const image = item.children?.[0] as ImageElement
	return (
		<OptionsWrapper>
			<ImageStyler element={image} />
			<TextStyler label="Feature title" element={item.children?.[1] as TextElement} />
			<TextStyler label="Feature description" element={item.children?.[2] as TextElement} />
			<BoxStyler label="Block" element={item} />
		</OptionsWrapper>
	)
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
			paddingLeft: '15%',
			paddingRight: '15%',
			paddingTop: '40px',
			paddingBottom: '40px',
		},
	}

	draft.style.tablet = {
		default: {
			paddingRight: '10%',
			paddingLeft: '10%',
			paddingTop: '30px',
			paddingBottom: '30px',
		},
	}

	draft.style.mobile = {
		default: {
			paddingRight: '5%',
			paddingLeft: '5%',
			paddingTop: '20px',
			paddingBottom: '20px',
		},
	}
}).serialize()

const topDiv = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			textAlign: 'center',
			marginBottom: '20px',
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

	draft.data.text = Expression.fromString('Our team')
}).serialize()

const subTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '24px',
			marginBottom: '12px',
			color: '#666',
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

	draft.data.text = Expression.fromString('Meet the team of people who make it all happen')
}).serialize()

const tileTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '24px',
			fontWeight: 'bold',
			marginBottom: '14px',
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

	draft.style.tablet = {
		default: {
			fontSize: '12px',
		},
	}

	draft.style.mobile = {
		default: {
			fontSize: '10px',
		},
	}

	draft.data.text = Expression.fromString('Employee')
})

const tileIcon = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '50%',
			borderRadius: '50%',
			marginBottom: '10px',
			transform: 'translateY(-25%)',
		},
	}
	draft.data.src = Expression.fromString('https://files.dotenx.com/assets/profile1-v13.jpeg')
})

const newTile = () =>
	produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.2)',
				borderRadius: '10px',
				paddingBottom: '30px',
				backgroundColor: '#ffffff',
			},
		}
		draft.children = [tileIcon, tileTitle, tileDetails]
	})

function createTile({
	image,
	title,
	description,
}: {
	image: string
	title: string
	description: string
}) {
	return produce(newTile(), (draft) => {
		const ImageElement = draft.children?.[0] as ImageElement
		ImageElement.data.src = Expression.fromString(image)
		;(draft.children?.[1] as TextElement).data.text = Expression.fromString(title)
		;(draft.children?.[2] as TextElement).data.text = Expression.fromString(description)
	})
}

const tiles = [
	createTile({
		image: 'https://files.dotenx.com/assets/profile2-ba1.jpeg',
		title: 'John Doe',
		description: 'No-code developer',
	}),
	createTile({
		image: 'https://files.dotenx.com/assets/profile1-v13.jpeg',
		title: 'Jane Doe',
		description: 'Senior UX designer',
	}),
	createTile({
		image: 'https://files.dotenx.com/assets/profile4-k38.jpeg',
		title: 'Jack Doe',
		description: 'CEO',
	}),
	createTile({
		image: 'https://files.dotenx.com/assets/profile3-i34.jpeg',
		title: 'Sam Doe',
		description: 'Marketing manager',
	}),
]

const grid = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr 1fr',
			rowGap: '40px',
			columnGap: '20px',
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
}).serialize()

const defaultData = {
	...wrapperDiv,
	components: [
		{
			...topDiv,
			components: [title, subTitle],
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
