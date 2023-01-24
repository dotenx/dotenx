import _ from 'lodash'
import { API_URL } from '../../../api'
import imageUrl from '../../../assets/components/about-left.png'
import { uuid } from '../../../utils'
import { gridCols } from '../../../utils/style-utils'
import { Controller } from '../../controllers/controller'
import { OptionsWrapper } from '../../controllers/helpers/options-wrapper'
import { HttpMethod, useDataSourceStore } from '../../data-source/data-source-store'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ColumnsElement } from '../../elements/extensions/columns'
import { ImageElement } from '../../elements/extensions/image'
import { LinkElement } from '../../elements/extensions/link'
import { TextElement } from '../../elements/extensions/text'
import { useProjectStore } from '../../page/project-store'
import { useSelectedElement } from '../../selection/use-selected-component'
import { BoxStyler } from '../../simple/stylers/box-styler'
import { ColumnsStyler } from '../../simple/stylers/columns-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { Expression } from '../../states/expression'

export class ProductList extends Controller {
	name = 'Product list'
	image = imageUrl
	defaultData = component()
	renderOptions = () => <ProductListOptions />

	onCreate(root: Element) {
		const projectTag = useProjectStore.getState().tag
		const addDataSource = useDataSourceStore.getState().add
		const id = uuid()
		const dataSourceName = `product_list_${id}`
		addDataSource({
			id,
			stateName: dataSourceName,
			method: HttpMethod.Post,
			url: Expression.fromString(
				`${API_URL}/public/database/query/select/project/${projectTag}/table/products`
			),
			fetchOnload: true,
			body: Expression.fromString(
				JSON.stringify({ columns: ['id', 'name', 'price', 'image_url'] })
			),
			headers: '',
			isPrivate: false,
			properties: [],
			onSuccess: [],
		})
		const column = root.find<BoxElement>(tagIds.column)!
		setElement(
			column,
			(draft) => (draft.repeatFrom = { name: dataSourceName, iterator: 'product' })
		)
	}
}

function ProductListOptions() {
	const component = useSelectedElement<BoxElement>()!
	const title = component.find<TextElement>(tagIds.title)!
	const grid = component.find<ColumnsElement>(tagIds.grid)!
	const columns = component.findAll<BoxElement>(tagIds.column)!
	const names = component.findAll<TextElement>(tagIds.name)!
	const prices = component.findAll<TextElement>(tagIds.price)!

	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<ColumnsStyler element={grid} />
			<BoxStyler label="Wrapper" element={component} />
			<BoxStyler label="Columns" element={columns} />
			<TextStyler label="Names" element={names} noText />
			<TextStyler label="Prices" element={prices} noText />
		</OptionsWrapper>
	)
}

const tagIds = {
	title: 'title',
	grid: 'grid',
	column: 'column',
	image: 'image',
	name: 'name',
	price: 'price',
}

function component() {
	const title = new TextElement().tag(tagIds.title).text('Products').as('h2').css({
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

const column = () => {
	const image = new ImageElement().tag(tagIds.image).srcState('product.image_url').css({
		flexGrow: '1',
		backgroundColor: '#f5f5f5',
	})

	const name = new TextElement().tag(tagIds.name).textState('product.name').css({
		fontWeight: '500',
	})

	const link = new LinkElement().populate([name]).css({
		textDecoration: 'none',
	})

	const price = new TextElement().tag(tagIds.price).textState('product.price').css({
		fontWeight: '500',
	})

	const namePriceWrapper = new BoxElement().populate([link, price]).css({
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	})

	const column = new BoxElement().tag(tagIds.column).populate([image, namePriceWrapper]).css({
		paddingTop: '10px',
		paddingRight: '10px',
		paddingBottom: '10px',
		paddingLeft: '10px',
		aspectRatio: '1 / 1',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		gap: '10px',
	})

	return column
}
