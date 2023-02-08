import _ from 'lodash'
import imageUrl from '../../../assets/components/about-left.png'
import { Controller } from '../../controllers/controller'
import { OptionsWrapper } from '../../controllers/helpers/options-wrapper'
import { img, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { TextElement } from '../../elements/extensions/text'
import productScript from '../../scripts/product.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
import { BoxStyler } from '../../simple/stylers/box-styler'
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
	const title = root.find<TextElement>(tagIds.title)!

	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<BoxStyler label="Wrapper" element={root} />
		</OptionsWrapper>
	)
}

const tagIds = {
	title: 'title',
}

const component = () => {
	const description = txt('Description')
		.css({ fontSize: '0.875rem', marginTop: '0.5rem' })
		.class('description')
	const image = img()
		.css({
			height: '500px',
			backgroundColor: '#f5f5f5',
			marginTop: '1rem',
			borderRadius: '0.5rem',
		})
		.class('image')
	const title = shared
		.title()
		.txt('Product')
		.tag(tagIds.title)
		.css({ marginBottom: '0px' })
		.class('title')
	const price = txt('$0.0').css({ fontSize: '1.25rem' }).class('price')
	const group = shared.group().populate([title, price])
	const container = shared.container().populate([group, image, description])
	const root = shared.paper().populate([container])
	return root
}
