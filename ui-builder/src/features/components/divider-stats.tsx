import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/divider-stats.png'
import { deserializeElement } from '../../utils/deserialize'
import { box, txt } from '../elements/constructor'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { ColumnsStyler } from '../simple/stylers/columns-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'

export class DividerStats extends Component {
	name = 'Stats divider'
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
		<ComponentWrapper name="Simple title divider">
			<ColumnsStyler element={sectionsDiv} maxColumns={8} />
			<DndTabs
				containerElement={sectionsDiv}
				renderItemOptions={(element) => (
					<TextStyler label="Text" element={element.children![0] as TextElement} />
				)}
				insertElement={() => createSection()}
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
			gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr',
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

const createSection = () =>
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
	])
		.css({
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'stretch',
			width: '100%',
		})
		.class(['section']) // This is not necessary in the rendered code but I've added it as we add extra divs in the ui-builder

const sections = [
	createSection(),
	createSection(),
	createSection(),
	createSection(),
	createSection(),
	createSection(),
	createSection(),
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
