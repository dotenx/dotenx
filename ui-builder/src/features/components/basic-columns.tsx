import imageUrl from '../../assets/components/columns.png'
import { gridCols } from '../../utils/style-utils'
import { box, grid } from '../elements/constructor'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { useSelectedElement } from '../selection/use-selected-component'
import { ColumnsStyler } from '../simple/stylers/columns-styler'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'

export class BasicColumns extends Component {
	name = 'Basic Columns'
	image = imageUrl
	defaultData = box([
		grid(2)
			.unlock()
			.populate([])
			.css({
				gap: '40px',
			})
			.cssTablet({
				gridTemplateColumns: gridCols(1),
			}),
	]).css({
		padding: '100px',
	})

	renderOptions() {
		return <BasicColumnsOptions />
	}
}

function BasicColumnsOptions() {
	const component = useSelectedElement<BoxElement>()!
	const column = component.children[0] as ColumnsElement

	return (
		<ComponentWrapper name="Columns">
			<ColumnsStyler element={column} />
		</ComponentWrapper>
	)
}
