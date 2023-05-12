import { gridCols } from '../../utils/style-utils'
import { btn, flex, txt } from '../elements/constructor'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { InputElement } from '../elements/extensions/input'
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

const button = () =>
	btn('Button')
		.css({
			backgroundColor: '#f5f5f5',
			border: 'none',
			borderRadius: '5px',
			paddingTop: '10px',
			paddingRight: '20px',
			paddingBottom: '10px',
			paddingLeft: '20px',
		})
		.cssHover({
			backgroundColor: '#e0e0e0',
		})

const input = (
	label: string,
	type:
		| 'text'
		| 'number'
		| 'email'
		| 'url'
		| 'checkbox'
		| 'radio'
		| 'range'
		| 'date'
		| 'datetime-local'
		| 'search'
		| 'tel'
		| 'time'
		| 'file'
		| 'month'
		| 'week'
		| 'password'
		| 'color'
		| 'hidden' = 'text'
) =>
	flex([
		txt(label),
		new InputElement()
			.css({
				width: '100%',
				border: '1px solid #e0e0e0',
				borderRadius: '5px',
				height: '40px',
				paddingLeft: '10px',
			})
			.type(type),
	]).css({
		flexDirection: 'column',
		gap: '2px',
	})

export const shared = {
	title,
	container,
	grid,
	paper,
	group,
	button,
	input,
}
