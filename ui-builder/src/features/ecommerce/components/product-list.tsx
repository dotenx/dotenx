import _ from 'lodash'
import imageUrl from '../../../assets/themes/ecommerce/product-list.png'
import { Controller, OnCreateOptions } from '../../controllers/controller'
import { ControllerWrapper } from '../../controllers/helpers/controller-wrapper'
import { box, btn, img, link, template, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ButtonElement } from '../../elements/extensions/button'
import { ColumnsElement } from '../../elements/extensions/columns'
import { TextElement } from '../../elements/extensions/text'
import productsScript from '../../scripts/products.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
import { BoxStyler } from '../../simple/stylers/box-styler'
import { ButtonStyler } from '../../simple/stylers/button-styler'
import { ColumnsStyler } from '../../simple/stylers/columns-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { shared } from '../shared'

export class ProductList extends Controller {
	name = 'Product list'
	image = imageUrl
	defaultData = component()
	renderOptions = () => <ProductListOptions />

	onCreate(root: Element, options: OnCreateOptions) {
		const compiled = _.template(productsScript)
		const script = compiled({ id: root.id, projectTag: options.projectTag })
		setElement(root, (draft) => (draft.script = script))
	}
}

function ProductListOptions() {
	const root = useSelectedElement<BoxElement>()!
	const title = root.find<TextElement>(tags.title)!
	const grid = root.find<ColumnsElement>(tags.grid)!
	const columns = root.findAll<BoxElement>(tags.column)!
	const names = root.findAll<TextElement>(tags.name)!
	const prices = root.findAll<TextElement>(tags.price)!
	const showMore = root.find<ButtonElement>(tags.showMore)!

	return (
		<ControllerWrapper name="Product list">
			<TextStyler label="Title" element={title} />
			<ColumnsStyler element={grid} />
			<BoxStyler label="Wrapper" element={root} />
			<BoxStyler label="Columns" element={columns} />
			<TextStyler label="Names" element={names} noText />
			<TextStyler label="Prices" element={prices} noText />
			<ButtonStyler label="Show more" element={showMore} />
		</ControllerWrapper>
	)
}

const tags = {
	title: 'title',
	grid: 'grid',
	column: 'column',
	image: 'image',
	name: 'name',
	price: 'price',
	showMore: 'showMore',
}

function component() {
	const title = shared.title().tag(tags.title).txt('Products')
	const grid = shared.grid().tag(tags.grid).populate(_.range(1).map(column)).class('list')
	const container = shared.container().populate([title, grid, showMore()])
	const root = shared.paper().populate([container])
	return root
}

const showMore = () =>
	box([
		btn('Show more')
			.tag(tags.showMore)
			.class('show-more')
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
			}),
	]).css({
		display: 'flex',
		justifyContent: 'end',
		marginTop: '20px',
	})

const column = () => {
	const image = img().tag(tags.image).css({
		flexGrow: '1',
		backgroundColor: '#f5f5f5',
		height: '300px',
		borderRadius: '5px',
	})
	image.classes = ['image']

	const name = txt('Name').tag(tags.name).css({
		fontWeight: '500',
	})
	name.classes = ['name']

	const itemLink = link()
		.populate([name])
		.css({
			textDecoration: 'none',
			color: 'inherit',
		})
		.class('item-link')

	const price = txt('Price').tag(tags.price).css({
		fontWeight: '500',
	})
	price.classes = ['price']

	const namePriceWrapper = box().populate([itemLink, price]).css({
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	})

	const column = box().tag(tags.column).populate([image, namePriceWrapper]).css({
		paddingTop: '10px',
		paddingRight: '10px',
		paddingBottom: '10px',
		paddingLeft: '10px',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		gap: '10px',
	})

	const tmp = template(column)
	tmp.classes = ['item']

	return tmp
}
