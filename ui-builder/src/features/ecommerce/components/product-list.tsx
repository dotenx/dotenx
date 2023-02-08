import _ from 'lodash'
import imageUrl from '../../../assets/components/about-left.png'
import { Controller } from '../../controllers/controller'
import { OptionsWrapper } from '../../controllers/helpers/options-wrapper'
import { box, btn, img, link, template, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ColumnsElement } from '../../elements/extensions/columns'
import { TextElement } from '../../elements/extensions/text'
import productsScript from '../../scripts/products.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
import { BoxStyler } from '../../simple/stylers/box-styler'
import { ColumnsStyler } from '../../simple/stylers/columns-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { shared } from '../shared'

export class ProductList extends Controller {
	name = 'Product list'
	image = imageUrl
	defaultData = component()
	renderOptions = () => <ProductListOptions />

	onCreate(root: Element) {
		const compiled = _.template(productsScript)
		const script = compiled({ id: root.id })
		setElement(root, (draft) => (draft.script = script))
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
	showMore: 'showMore',
}

function component() {
	const title = shared.title().tag(tagIds.title).txt('Products')
	const grid = shared.grid().tag(tagIds.grid).populate(_.range(1).map(column)).class('list')
	const container = shared.container().populate([title, grid, showMore()])
	const root = shared.paper().populate([container])
	return root
}

const showMore = () =>
	box([
		btn('Show more')
			.tag(tagIds.showMore)
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
		justifyContent: 'center',
		marginTop: '20px',
	})

const column = () => {
	const image = img().tag(tagIds.image).css({
		flexGrow: '1',
		backgroundColor: '#f5f5f5',
		height: '300px',
	})
	image.classes = ['image']

	const name = txt('Name').tag(tagIds.name).css({
		fontWeight: '500',
	})
	name.classes = ['name']

	const itemLink = link().populate([name]).css({
		textDecoration: 'none',
		color: 'inherit',
	})

	const price = txt('Price').tag(tagIds.price).css({
		fontWeight: '500',
	})
	price.classes = ['price']

	const namePriceWrapper = box().populate([itemLink, price]).css({
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	})

	const column = box().tag(tagIds.column).populate([image, namePriceWrapper]).css({
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
