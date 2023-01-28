import _ from 'lodash'
import { API_URL } from '../../../api'
import imageUrl from '../../../assets/components/about-left.png'
import { uuid } from '../../../utils'
import { Controller } from '../../controllers/controller'
import { OptionsWrapper } from '../../controllers/helpers/options-wrapper'
import { HttpMethod, useDataSourceStore } from '../../data-source/data-source-store'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ColumnsElement } from '../../elements/extensions/columns'
import { IconElement } from '../../elements/extensions/icon'
import { ImageElement } from '../../elements/extensions/image'
import { LinkElement } from '../../elements/extensions/link'
import { TextElement } from '../../elements/extensions/text'
import { useProjectStore } from '../../page/project-store'
import { useSelectedElement } from '../../selection/use-selected-component'
import { BoxStyler } from '../../simple/stylers/box-styler'
import { ColumnsStyler } from '../../simple/stylers/columns-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { Expression } from '../../states/expression'
import { shared } from '../shared'

export class ProductList extends Controller {
	name = 'Product list'
	image = imageUrl
	defaultData = component()
	renderOptions = () => <ProductListOptions />

	onCreate(root: Element) {
		const column = root.find<BoxElement>(tagIds.column)!

		const projectTag = useProjectStore.getState().tag
		const addDataSource = useDataSourceStore.getState().add
		const id = uuid()
		const dataSourceName = `$product_list_${id}`
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
		setElement(
			column,
			(draft) => (draft.repeatFrom = { name: dataSourceName, iterator: 'product' })
		)
	}
}

function ProductListOptions() {
	const root = useSelectedElement<BoxElement>()!
	const title = root.find<TextElement>(tagIds.title)!
	const grid = root.find<ColumnsElement>(tagIds.grid)!
	const columns = root.findAll<BoxElement>(tagIds.column)!
	const names = root.findAll<TextElement>(tagIds.name)!
	const prices = root.findAll<TextElement>(tagIds.price)!

	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<ColumnsStyler element={grid} />
			<BoxStyler label="Wrapper" element={root} />
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
	prev: 'prev',
	next: 'next',
}

function component() {
	const pagination = createPagination()
	const title = shared.title().tag(tagIds.title).text('Products')
	const grid = shared.grid().tag(tagIds.grid).populate(_.range(3).map(column))
	const container = shared.container().populate([title, grid, pagination])
	const root = shared.paper().populate([container])
	return root
}

const createPagination = () => {
	const prevIcon = chevron().setName('chevron-left')
	const nextIcon = chevron().setName('chevron-right')

	const pagination = new BoxElement().populate([prevIcon, nextIcon]).css({
		display: 'flex',
		gap: '10px',
		justifyContent: 'center',
		marginTop: '20px',
	})
	return pagination
}

const chevron = () => {
	const icon = new IconElement().type('fas').size('24px').tag(tagIds.prev).css({
		opacity: '0.8',
		padding: '6px',
		borderRadius: '50%',
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: '1',
	})
	_.set(icon.style, 'desktop.hover.opacity', '1')
	_.set(icon.style, 'desktop.hover.backgroundColor', '#f5f5f5')
	return icon
}

const column = () => {
	const image = new ImageElement().tag(tagIds.image).srcState('product.image_url').css({
		flexGrow: '1',
		backgroundColor: '#f5f5f5',
		height: '100%',
	})

	const name = new TextElement().tag(tagIds.name).textState('product.name').css({
		fontWeight: '500',
	})

	const link = new LinkElement().populate([name]).css({
		textDecoration: 'none',
		color: 'inherit',
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
