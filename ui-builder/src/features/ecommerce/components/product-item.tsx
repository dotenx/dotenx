import imageUrl from '../../../assets/components/about-left.png'
import { Controller } from '../../controllers/controller'
import { OptionsWrapper } from '../../controllers/helpers/options-wrapper'
import { BoxElement } from '../../elements/extensions/box'
import { ImageElement } from '../../elements/extensions/image'
import { TextElement } from '../../elements/extensions/text'
import { useSelectedElement } from '../../selection/use-selected-component'
import { BoxStyler } from '../../simple/stylers/box-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { shared } from '../shared'

export class ProductItem extends Controller {
	name = 'Product item'
	image = imageUrl
	defaultData = component()
	renderOptions = () => <ProductItemOptions />
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
	const description = new TextElement().txt('Description').css({ fontSize: '0.875rem' })
	const image = new ImageElement().css({ height: '300px' })
	const title = shared.title().txt('Product').tag(tagIds.title).css({ marginBottom: '0px' })
	const price = new TextElement().txt('$0.0').css({ fontSize: '1.25rem' })
	const group = shared.group().populate([title, price])
	const container = shared.container().populate([group, image, description])
	const root = shared.paper().populate([container])
	return root
}
