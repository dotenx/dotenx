import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/faq-basic.png'
import { deserializeElement } from '../../utils/deserialize'
import { regenElement } from '../clipboard/copy-paste'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { BoxStyler, BoxStylerSimple } from '../simple/stylers/box-styler'
import { ColumnsStyler } from '../simple/stylers/columns-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component, ElementOptions } from './component'
import { ComponentName } from './helpers'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class FaqBasic extends Component {
	name = 'Basic FAQ'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FaqBasicBasicOptions />
	}
}

// =============  renderOptions =============

function FaqBasicBasicOptions() {
	const component = useSelectedElement<BoxElement>()!
	const grid = component.find<ColumnsElement>(tagIds.grid)!
	const faqTitle = component.find<TextElement>(tagIds.faqTitle)!

	return (
		<ComponentWrapper name="Basic FAQ">
			<TextStyler label="Main title" element={faqTitle} />
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
	const title = item.children?.[0] as TextElement
	const description = item.children?.[1] as TextElement

	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<TextStyler label="Description" element={description} />
			<BoxStyler label="Block" element={item} />
		</OptionsWrapper>
	)
}

// =============  defaultData =============

const tagIds = {
	faqTitle: 'faqTitle',
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
			marginBottom: '38px',
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
			fontWeight: '700',
		},
	}
	draft.data.text = Expression.fromString('Frequently asked questions')
	draft.tagId = tagIds.faqTitle
}).serialize()

const tileTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '16px',
			marginBottom: '18px',
			fontWeight: '600',
		},
	}
	draft.data.text = Expression.fromString('Question title goes here')
})

const tileDetails = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			wordBreak: 'break-all',
			fontWeight: '400',
			fontSize: '14px',
		},
	}
	draft.data.text = Expression.fromString(
		'You can add a description here. This is a great place to add more information about your product.'
	)
})
const tile = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			height: 'max-content',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'start',
		},
	}
	draft.children = [tileTitle, tileDetails]
})

function createTile({ title, description }: { title: string; description: string }) {
	return produce(tile, (draft) => {
		const titleElement = draft.children?.[0] as TextElement
		titleElement.data.text = Expression.fromString(title)
		const descriptionElement = draft.children?.[1] as TextElement
		descriptionElement.data.text = Expression.fromString(description)
	})
}

const tiles = [
	createTile({
		title: 'Can I install it myself?',
		description:
			'Yes, you can install it yourself. We provide a detailed installation guide and video.',
	}),
	createTile({
		title: 'How long does it take to install?',
		description:
			'It takes about 2 hours to install. We provide a detailed installation guide and video.',
	}),
	createTile({
		title: 'Do you offer a warranty?',
		description:
			'Yes, we offer a 1-year warranty. You can read more about it in our warranty policy.',
	}),
	createTile({
		title: 'How can I pay?',
		description: 'You can pay with a credit card or PayPal. We also offer financing options.',
	}),
	createTile({
		title: 'How long does it take to ship?',
		description:
			'We ship within 1-2 business days. You can read more about it in our shipping policy.',
	}),
	createTile({
		title: 'Do you ship internationally?',
		description: 'Yes, we ship internationally. We also offer international financing options.',
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
			components: [title],
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
