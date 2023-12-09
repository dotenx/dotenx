import { produce } from 'immer'
import _ from 'lodash'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/feature-cta-image-tag.png'
import { deserializeElement } from '../../utils/deserialize'
import { regenElement } from '../clipboard/copy-paste'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { IconElement } from '../elements/extensions/icon'
import { TextElement } from '../elements/extensions/text'
import { LinkElement } from '../elements/extensions/link'
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
import { color } from '../simple/palette'
import { box, link } from '../elements/constructor'
import { fontSizes } from '../simple/font-sizes'
import { LinkStyler } from '../simple/stylers/link-styler'

export class FeatureCtaImageTag extends Component {
	name = 'Feature cards with CTA'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FeatureCenterOptions />
	}
}

// =============  renderOptions =============

function FeatureCenterOptions() {
	const component = useSelectedElement<BoxElement>()!
	const grid = component.find<ColumnsElement>(tagIds.grid)!

	return (
		<ComponentWrapper name="Feature cards with CTA">
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
	const icon = item.find<IconElement>(tagIds.icon)!
	const title = item.find<TextElement>(tagIds.tileTitle)!
	const description = item.find<TextElement>(tagIds.tileDetails)!
	const cta = item.find<LinkElement>(tagIds.cta)!
	const ctaText = cta.find<TextElement>(tagIds.ctaText)!

	return (
		<OptionsWrapper>
			<TextStyler label="Feature title" element={title} />
			<TextStyler label="Feature description" element={description} />
			<TextStyler label="CTA text" element={ctaText} />
			<LinkStyler label="CTA link" element={cta} />
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
	cta: 'cta',
	ctaText: 'ctaText', 
	icon: 'icon',
	tileTitle: 'tileTitle',
	tileDetails: 'tileDetails',
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
			color: color('secondary'),
			fontSize: fontSizes.h3.desktop,
			fontWeight: 'bold',
			marginBottom: '18px',
		},
	}

	draft.style.tablet = {
		default: {
			fontSize: fontSizes.h3.tablet,
		},
	}
	
	draft.style.mobile = {
		default: {
			fontSize: fontSizes.h3.mobile,
		},
	}

	draft.data.text = Expression.fromString('Feature')
	draft.tagId = tagIds.tileTitle
})

const tileIcon = produce(new IconElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '20px',
			width: '20px',
			height: '20px',
			color: '#ff0000',
			marginBottom: '10px',
		},
	}
	draft.data.name = 'bell'
	draft.data.type = 'fas'
	draft.tagId = tagIds.icon
})

const tileTitleDiv = box([
	tileTitle,
	tileIcon
]).css({
	display: 'flex',
	justifyContent: 'space-between',
})

const tileDetails = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			color: color('primary', 0.7),
			fontSize: fontSizes.normal.desktop,
			textAlign: 'justify'
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

	draft.data.text = Expression.fromString('Feature description goes here')
	draft.tagId = tagIds.tileDetails
})

const cta = produce(new LinkElement(), (draft) => {
	draft.style.desktop = {
		default: {
			border: 'none',
			textAlign: 'start',
			textDecoration: 'none',
			cursor: 'pointer',
			paddingTop: '5px',
			paddingBottom: '5px',
			alignSelf: 'start',
			marginTop: '20px'
		},
	}
	draft.style.tablet = {
		default: {
			marginTop: '15px'
		},
	}
	draft.style.mobile = {
		default: {
			marginTop: '10px'
		},
	}

	const element = new TextElement()
	element.data.text = Expression.fromString('Learn more →')
	element.tagId = tagIds.ctaText
	element.style.desktop = {
		default: {
			color: color('text'),
			fontSize: '20px',
			fontWeight: '400',
			borderBottomWidth: '2px',
			borderBottomStyle: 'solid',
			borderBottomColor: color('primary'),
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

const tile = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '100%',
			minHeight: '60%',
			paddingLeft: '5%',
			paddingRight: '5%',
			paddingTop: '5%',
			paddingBottom: '5%',
			backgroundColor: 'rgb(248 250 252)',
			textAlign: 'center',
			boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.16)',
			borderRadius: '8px',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'stretch',
		},
	}
	draft.children = [tileTitleDiv, tileDetails, cta]
})

function createTile({
	icon,
	title,
	description,
	cta
}: {
	icon: { color: string; name: string; type: string }
	title: string
	description: string
	cta: string
}) {
	return produce(tile, (draft) => {
		const iconElement = draft.find<IconElement>(tagIds.icon)!
		iconElement.data.name = icon.name
		iconElement.data.type = icon.type
		iconElement.style.desktop!.default!.color = icon.color
		const titleElement = draft.find<TextElement>(tagIds.tileTitle)!
		titleElement.data.text = Expression.fromString(title)
		const descriptionElement = draft.find<TextElement>(tagIds.tileDetails)!
		descriptionElement.data.text = Expression.fromString(description)
		const ctaTextElement = draft.find<TextElement>(tagIds.ctaText)!
		ctaTextElement.data.text = Expression.fromString(cta)
	})
}

const tiles = [
	createTile({
		icon: { name: 'code', type: 'fas', color: color('primary') },
		title: 'Customizable',
		description:
			'Change the content and style and make it your own.Change the content and style and make it your own.',
		cta: 'Learn more'
	}),
	createTile({
		icon: { name: 'rocket', type: 'fas', color: color('primary') },
		title: 'Fast',
		description:
			'Fast load times and lag free interaction, my highest priority.Fast load times and lag free interaction, my highest priority.',
		cta: 'Learn more'
	}),
	createTile({
		icon: { name: 'heart', type: 'fas', color: color('primary') },
		title: 'Made with Love',
		description:
			'Increase sales by showing true dedication to your customers.Increase sales by showing true dedication to your customers.',
		cta: 'Learn more'
	}),
	createTile({
		icon: { name: 'cog', type: 'fas', color: color('primary') },
		title: 'Easy to Use',
		description:
			'Ready to use with your own content, or customize the source files!Ready to use with your own content, or customize the source files!',
		cta: 'Learn more'
	}),
	createTile({
		icon: { name: 'bolt', type: 'fas', color: color('primary') },
		title: 'Instant Setup',
		description:
			'Get your projects up and running in no time using the theme documentation.Get your projects up and running in no time using the theme documentation.',
		cta: 'Learn more'
	}),
	createTile({
		icon: { name: 'cloud', type: 'fas', color: color('primary') },
		title: 'Cloud Storage',
		description:
			'Access your documents anywhere and share them with others.Access your documents anywhere and share them with others.',
		cta: 'Learn more'
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
	...frame,
	components: [
		{
			...grid,
			components: tiles.map((tile) => tile.serialize()),
		},
	],
}
