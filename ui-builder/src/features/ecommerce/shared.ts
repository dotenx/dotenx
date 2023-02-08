import { gridCols } from '../../utils/style-utils'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { TextElement } from '../elements/extensions/text'

const title = () =>
	new TextElement().as('h2').css({
		marginBottom: '30px',
		fontSize: '2.5rem',
	})

const container = () =>
	new BoxElement().css({
		maxWidth: '1200px',
		margin: '0 auto',
	})

const grid = () =>
	new ColumnsElement()
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

const paper = () =>
	new BoxElement().css({
		paddingTop: '36px',
		paddingRight: '50px',
		paddingBottom: '36px',
		paddingLeft: '50px',
		color: '#333333',
	})

const group = () =>
	new BoxElement().css({
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	})

export const shared = {
	title,
	container,
	grid,
	paper,
	group,
}
