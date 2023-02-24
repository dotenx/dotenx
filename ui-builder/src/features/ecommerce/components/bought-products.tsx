import _ from 'lodash'
import imageUrl from '../../../assets/themes/ecommerce/bought-products.png'
import { gridCols } from '../../../utils/style-utils'
import { Component, OnCreateOptions } from '../../components/component'
import { ComponentWrapper } from '../../components/helpers/component-wrapper'
import { box, img, template, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ColumnsElement } from '../../elements/extensions/columns'
import { TextElement } from '../../elements/extensions/text'
import boughtProductsScript from '../../scripts/bought-products.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
import { BoxStyler } from '../../simple/stylers/box-styler'
import { ColumnsStyler } from '../../simple/stylers/columns-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { shared } from '../shared'

export class BoughtProducts extends Component {
	name = 'Bought products'
	image = imageUrl
	defaultData = component()
	renderOptions = () => <BoughtProductsOptions />

	onCreate(root: Element, options: OnCreateOptions) {
		const compiled = _.template(boughtProductsScript)
		const script = compiled({
			id: root.id,
			projectTag: options.projectTag,
		})
		setElement(root, (draft) => (draft.script = script))
	}
}

function BoughtProductsOptions() {
	const root = useSelectedElement<BoxElement>()!
	const title = root.find<TextElement>(tags.title)!
	const grid = root.find<ColumnsElement>(tags.grid)!
	const columns = root.findAll<BoxElement>(tags.column)!
	const names = root.findAll<TextElement>(tags.name)!

	return (
		<ComponentWrapper name="Bought products">
			<TextStyler label="Title" element={title} />
			<ColumnsStyler element={grid} />
			<BoxStyler label="Wrapper" element={root} />
			<BoxStyler label="Columns" element={columns} />
			<TextStyler label="Names" element={names} noText />
		</ComponentWrapper>
	)
}

const tags = {
	title: 'title',
	grid: 'grid',
	column: 'column',
	image: 'image',
	name: 'name',
}

const component = () =>
	shared.paper().populate([
		shared.container().populate([
			shared.title().txt('Bought products').tag(tags.title),
			shared
				.grid()
				.tag(tags.grid)
				.cols(3)
				.cssTablet({ gridTemplateColumns: gridCols(2) })
				.cssMobile({ gridTemplateColumns: gridCols(1) })
				.class('list')
				.populate([
					template(
						box([
							img()
								.tag(tags.image)
								.css({
									flexGrow: '1',
									backgroundColor: '#f5f5f5',
									height: '300px',
									borderRadius: '5px',
								})
								.class('image'),
							txt('Name').class('name').css({ fontWeight: '500' }).tag(tags.name),
						])
							.tag(tags.column)

							.css({
								paddingTop: '10px',
								paddingRight: '10px',
								paddingBottom: '10px',
								paddingLeft: '10px',
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'space-between',
								gap: '10px',
							})
					).class('item'),
				]),
		]),
	])
