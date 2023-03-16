import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/feature-details-grid-image-tag-right.png'
import { deserializeElement } from '../../utils/deserialize'
import { regenElement } from '../clipboard/copy-paste'
import { box, txt } from '../elements/constructor'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { fontSizes } from '../simple/font-sizes'
import { color } from '../simple/palette'
import { BoxStyler } from '../simple/stylers/box-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { LinkStyler } from '../simple/stylers/link-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class FeatureDetailsGridImageTagRight extends Component {
	name = 'Features with details on right and tagged grid'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FeatureDetailsGridImageTagRightOptions />
	}
}

// =============  renderOptions =============

function FeatureDetailsGridImageTagRightOptions() {
	const component = useSelectedElement<BoxElement>()!
	const grid = component.find<ColumnsElement>(tagIds.grid)!
	const title = component.find<TextElement>(tagIds.title)!
	const details = component.find<TextElement>(tagIds.details)!
	const cta = component.find<LinkElement>(tagIds.cta)!
	const ctaText = component.find<TextElement>(tagIds.ctaText)!

	return (
		<ComponentWrapper name="Features with details on right and tagged grid">
			<TextStyler label="Title" element={title} />
			<TextStyler label="Details" element={details} />
			<TextStyler label="CTA" element={ctaText} />
			<LinkStyler label="CTA Link" element={cta} />
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
	title: 'title',
	details: 'details',
	cta: 'cta',
	ctaText: 'ctaText',
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

const wrapper = box([])
	.css({
		display: 'grid',
		gridTemplateColumns: '2fr 1fr',
		gridGap: '20px',
	})
	.cssTablet({
		gridTemplateColumns: '1fr',
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
		erat.`,
	}),
	createTile({
		src: 'https://files.dotenx.com/assets/icons-combo-chart-vii.png',
		title: 'Fast',
		description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut fermentum lacinia, nunc est aliquam nunc, eu aliquet nisl nisl sit amet 
		erat.`,
	}),
	createTile({
		src: 'https://files.dotenx.com/assets/icons-credit-card-hwer.png',
		title: 'Made with Love',
		description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut fermentum lacinia, nunc est aliquam nunc, eu aliquet nisl nisl sit amet 
		erat.`,
	}),
	createTile({
		src: 'https://files.dotenx.com/assets/icons-luggage-bh.png',
		title: 'Easy to Use',
		description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut fermentum lacinia, nunc est aliquam nunc, eu aliquet nisl nisl sit amet 
		erat.`,
	}),
]

const grid = produce(new ColumnsElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr',
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

const cta = produce(new LinkElement(), (draft) => {
	draft.style.desktop = {
		default: {
			border: 'none',
			borderRadius: '10px',
			textAlign: 'center',
			textDecoration: 'none',
			cursor: 'pointer',
			paddingTop: '5px',
			paddingBottom: '5px',
		},
	}
	draft.style.tablet = {
		default: {
			justifySelf: 'center',
		},
	}

	const element = new TextElement()
	element.data.text = Expression.fromString('Learn more →')
	element.tagId = tagIds.ctaText
	element.style.desktop = {
		default: {
			color: color('primary'),
			fontSize: '20px',
			fontWeight: '400',
		},
	}
	element.style.tablet = {
		default: {
			fontSize: '18px',
		},
	}
	element.style.mobile = {
		default: {
			fontSize: '14px',
		},
	}

	draft.data.href = Expression.fromString('#')
	draft.data.openInNewTab = false

	draft.children = [element]
	draft.tagId = tagIds.cta
})

const details = box([
	txt('Super fast and easy to use')
		.tag(tagIds.title)
		.css({
			fontSize: fontSizes.h2.desktop,
			fontWeight: '800',
			color: color('primary'),
		})
		.cssTablet({
			fontSize: fontSizes.h2.tablet,
		})
		.cssMobile({
			fontSize: fontSizes.h2.mobile,
		}),
	txt(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut fermentum lacinia, nunc est aliquam nunc, eu aliquet nisl nisl sit amet
	erat. Nullam auctor, nunc eget lacinia fermentum, lacus odio aliquam`)
		.tag(tagIds.details)
		.css({
			fontSize: fontSizes.normal.desktop,
			color: color('text'),
		})
		.cssTablet({
			fontSize: fontSizes.normal.tablet,
		})
		.cssMobile({
			fontSize: fontSizes.normal.mobile,
		}),
	cta,
])
	.css({
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start',
		rowGap: '15px',
	})
	.cssTablet({
		rowGap: '10px',
	})
	.cssMobile({
		rowGap: '5px',
	})
	.serialize()

const defaultData = {
	...frame,
	components: [
		{
			...wrapper,
			components: [
				{
					...grid,
					components: tiles.map((tile) => tile.serialize()),
				},
				details,
			],
		},
	],
}
