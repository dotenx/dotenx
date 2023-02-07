import _ from 'lodash'
import imageUrl from '../../../assets/components/about-left.png'
import { Controller } from '../../controllers/controller'
import { OptionsWrapper } from '../../controllers/helpers/options-wrapper'
import { template } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ColumnsElement } from '../../elements/extensions/columns'
import { IconElement } from '../../elements/extensions/icon'
import { ImageElement } from '../../elements/extensions/image'
import { LinkElement } from '../../elements/extensions/link'
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
		const list = root.find(tagIds.grid)!
		const compiled = _.template(productsScript)
		const script = compiled({ id: list.id })
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
	prev: 'prev',
	next: 'next',
}

function component() {
	const pagination = createPagination()
	const title = shared.title().tag(tagIds.title).txt('Products')
	const grid = shared.grid().tag(tagIds.grid).populate(_.range(1).map(column))
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
	const image = new ImageElement().tag(tagIds.image).css({
		flexGrow: '1',
		backgroundColor: '#f5f5f5',
		height: '100%',
	})
	image.classes = ['image']

	const name = new TextElement().tag(tagIds.name).css({
		fontWeight: '500',
	})
	name.classes = ['name']

	const link = new LinkElement().populate([name]).css({
		textDecoration: 'none',
		color: 'inherit',
	})

	const price = new TextElement().tag(tagIds.price).css({
		fontWeight: '500',
	})
	price.classes = ['price']

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

	const tmp = template(column)
	tmp.classes = ['item']

	return tmp
}
