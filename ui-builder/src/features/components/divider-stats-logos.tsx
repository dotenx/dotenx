import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/divider-stats-logos.png'
import { deserializeElement } from '../../utils/deserialize'
import { box, txt,img } from '../elements/constructor'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { ColumnsStyler } from '../simple/stylers/columns-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'

export class DividerStatsWithLogos extends Component {
	name = 'Stats divider with logos'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <DividerStatsOptions />
	}
}

// =============  renderOptions =============

function DividerStatsOptions() {
	const component = useSelectedElement<BoxElement>()!
	const sectionsDiv = component.find(tagIds.sectionsDiv) as ColumnsElement

	return (
		<ComponentWrapper name="Simple stats divider with logos">
			<ColumnsStyler element={sectionsDiv} maxColumns={8} />
			<DndTabs
				containerElement={sectionsDiv}
				renderItemOptions={(element) => (
					<div className='space-y-4'>

					<TextStyler label="Text" element={element.children![0] as TextElement} />
					<TextStyler label="Stat" element={element.children![1] as TextElement} />
					<ImageStyler element={element.children![2] as ImageElement} />
					</div>
				)}
				insertElement={() => createSection('https://files.dotenx.com/assets/Logo10-nmi1.png')}
			/>
		</ComponentWrapper>
	)
}

// =============  defaultData =============

const tagIds = {
	sectionsDiv: 'sectionsDiv',
}

const wrapperDiv = box()
	.css({
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		fontSize: '24px',
		paddingTop: '5%',
		paddingBottom: '5%',
		paddingLeft: '0%',
		paddingRight: '0%',
		width: '100%',
	})
	.cssTablet({
		fontSize: '16px',
	})
	.cssMobile({
		fontSize: '12px',
	})
	.serialize()

const sectionsDiv = produce(new ColumnsElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr ',
			justifyContent: 'space-between',
			alignItems: 'center',
			width: '100%',
			rowGap: '25px',
		},
	}

	draft.style.tablet = {
		default: {
			gridTemplateColumns: '1fr 1fr',
			rowGap: '15px',
		},
	}

	draft.style.mobile = {
		default: {
			rowGap: '10px',
			flexDirection: 'column',
			flexWrap: 'wrap',
			alignItems: 'stretch',
		},
	}

	draft.customStyle.desktop = {
		'div.section:not(:last-child)': {
			borderRightWidth: '1px',
			borderRightStyle: 'solid',
			borderRightColor: '#303030',
		},
	}
	draft.customStyle.tablet = {
		'div.section:not(:last-child)': {
			border: 'none',
		},
		'div.section:nth-child(odd)': {
			borderRightWidth: '1px',
			borderRightStyle: 'solid',
			borderRightColor: '#303030',
		},
		'div.section:last-child': {
			border: 'none',
		},
	}
	draft.tagId = tagIds.sectionsDiv
}).serialize()

const createSection = (src: string) =>
	box([
		txt('Stat')
			.css({
				textAlign: 'center',
				fontSize: '24px',
				fontWeight: 'bold',
			})
			.cssTablet({
				fontSize: '20px',
			})
			.cssMobile({
				fontSize: '16px',
			}),
		txt('100k')
			.css({
				textAlign: 'center',
				fontSize: '20px',
				color: '#cacaca',
			})
			.cssTablet({
				fontSize: '16px',
			})
			.cssMobile({
				fontSize: '12px',
			}),
			img(src)
		.css({
			marginLeft: 'auto',
				marginRight: 'auto',
				width: 'min(120px, 60%)',
		})
		.cssTablet({
			width: 'min(80px, 60%)',
		})
	])
		.css({
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'stretch',
			width: '100%',
		})
		.class(['section']) // This is not necessary in the rendered code but I've added it as we add extra divs in the ui-builder
		
		const sections = [
		createSection('https://files.dotenx.com/assets/Logo10-nmi1.png'),
		createSection('https://files.dotenx.com/assets/Logo7-32bn9.png'),
		createSection('https://files.dotenx.com/assets/Logo11-mn91.png'),
]

const defaultData = {
	...wrapperDiv,
	components: [
		{
			...sectionsDiv,
			components: sections.map((section) => section.serialize()),
		},
	],
}
