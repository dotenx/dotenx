import _ from 'lodash'
import imageUrl from '../../../assets/components/about-left.png'
import { Controller } from '../../controllers/controller'
import { ControllerWrapper } from '../../controllers/helpers/controller-wrapper'
import { btn, flex, img, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ButtonElement } from '../../elements/extensions/button'
import { ImageElement } from '../../elements/extensions/image'
import { TextElement } from '../../elements/extensions/text'
import productScript from '../../scripts/product.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
import { BoxStyler } from '../../simple/stylers/box-styler'
import { ButtonStyler } from '../../simple/stylers/button-styler'
import { ImageStyler } from '../../simple/stylers/image-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { shared } from '../shared'

export class ProductItem extends Controller {
	name = 'Product item'
	image = imageUrl
	defaultData = component()
	renderOptions = () => <ProductItemOptions />

	onCreate(root: Element) {
		const compiled = _.template(productScript)
		const script = compiled({ id: root.id })
		setElement(root, (draft) => (draft.script = script))
	}
}

function ProductItemOptions() {
	const root = useSelectedElement<BoxElement>()!
	const title = root.find<TextElement>(tags.title)!
	const description = root.find<TextElement>(tags.description)!
	const price = root.find<TextElement>(tags.price)!
	const image = root.find<ImageElement>(tags.image)!
	const addToCart = root.find<ButtonElement>(tags.addToCart)!

	return (
		<ControllerWrapper name="Product item">
			<TextStyler label="Title" element={title} />
			<BoxStyler label="Wrapper" element={root} />
			<TextStyler label="Description" element={description} />
			<TextStyler label="Price" element={price} />
			<ImageStyler element={image} />
			<ButtonStyler label="Add to cart" element={addToCart} />
		</ControllerWrapper>
	)
}

const tags = {
	title: 'title',
	price: 'price',
	description: 'description',
	image: 'image',
	addToCart: 'addToCart',
}

const component = () => {
	const description = txt('Description')
		.css({ fontSize: '0.875rem', marginTop: '0.5rem' })
		.class('description')
		.tag(tags.description)
	const image = img()
		.css({
			height: '500px',
			width: '100%',
			backgroundColor: '#f5f5f5',
			marginTop: '1rem',
			borderRadius: '0.5rem',
		})
		.class('image')
		.tag(tags.image)
	const title = shared
		.title()
		.txt('Product')
		.tag(tags.title)
		.css({ marginBottom: '0px' })
		.class('title')
	const price = txt('$0.0').css({ fontSize: '1.25rem' }).class('price').tag(tags.price)
	const addToCart = btn('Add to cart')
		.tag(tags.addToCart)
		.css({
			backgroundColor: '#f5f5f5',
			border: 'none',
			borderRadius: '0.5rem',
			padding: '0.5rem 1rem',
			marginLeft: '1rem',
		})
		.cssHover({ backgroundColor: '#e5e5e5' })
		.class('add-to-cart')
	const group = shared
		.group()
		.populate([title, flex([price, addToCart]).css({ alignItems: 'center' })])
	const container = shared.container().populate([group, image, description])
	const root = shared.paper().populate([container])
	return root
}
