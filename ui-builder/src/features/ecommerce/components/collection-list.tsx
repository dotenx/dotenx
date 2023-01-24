import _ from 'lodash'
import imageUrl from '../../../assets/components/about-left.png'
import { gridCols } from '../../../utils/style-utils'
import { Controller } from '../../controllers/controller'
import { OptionsWrapper } from '../../controllers/helpers/options-wrapper'
import { BoxElement } from '../../elements/extensions/box'
import { ColumnsElement } from '../../elements/extensions/columns'
import { TextElement } from '../../elements/extensions/text'
import { useSelectedElement } from '../../selection/use-selected-component'
import { BoxElementInput } from '../../ui/box-element-input'
import { ColumnsElementInput } from '../../ui/columns-element-input'
import { TextElementInput } from '../../ui/text-element-input'

export class CollectionList extends Controller {
	name = 'Collection list'
	image = imageUrl
	defaultData = defaultData()
	renderOptions = () => <CollectionListOptions />
}

function CollectionListOptions() {
	const component = useSelectedElement<BoxElement>()!
	const title = component.find<TextElement>(tagIds.title)!
	const grid = component.find<ColumnsElement>(tagIds.grid)!
	const columns = component.findAll<ColumnsElement>(tagIds.column)!

	return (
		<OptionsWrapper>
			<TextElementInput label="Title" element={title} />
			<ColumnsElementInput element={grid} />
			<BoxElementInput label="Wrapper" element={component} />
			<BoxElementInput label="Columns" element={columns} />
		</OptionsWrapper>
	)
}

const tagIds = {
	title: 'title',
	grid: 'grid',
	column: 'column',
}

function defaultData() {
	const title = new TextElement().tag(tagIds.title).text('Collections').as('h2').css({
		marginBottom: '30px',
		fontSize: '2.5rem',
	})

	const grid = new ColumnsElement()
		.tag(tagIds.grid)
		.populate(_.range(3).map(column))
		.css({
			display: 'grid',
			gridTemplateColumns: gridCols(3),
			gap: '8px',
		})
		.cssTablet({
			gridTemplateColumns: gridCols(2),
			gap: '8px',
		})
		.cssMobile({
			gridTemplateColumns: gridCols(1),
			gap: '8px',
		})

	const container = new BoxElement().populate([title, grid]).css({
		maxWidth: '1200px',
		margin: '0 auto',
	})

	const component = new BoxElement().populate([container]).css({
		paddingTop: '36px',
		paddingRight: '50px',
		paddingBottom: '36px',
		paddingLeft: '50px',
	})

	return component
}

const column = () =>
	new BoxElement().tag(tagIds.column).css({
		paddingTop: '10px',
		paddingRight: '10px',
		paddingBottom: '10px',
		paddingLeft: '10px',
		backgroundColor: '#f5f5f5',
		aspectRatio: '1 / 1',
	})
