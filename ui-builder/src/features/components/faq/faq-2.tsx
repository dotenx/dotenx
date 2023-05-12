import _ from 'lodash'
import componentImage from '../../../assets/components/faq/faq-2.png'
import { gridCols } from '../../../utils/style-utils'
import { box, grid, txt } from '../../elements/constructor'
import { BoxElement } from '../../elements/extensions/box'
import { TextElement } from '../../elements/extensions/text'
import { useSelectedElement } from '../../selection/use-selected-component'
import { TextStyler } from '../../simple/stylers/text-styler'
import { cmn } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { OptionsWrapper } from '../helpers/options-wrapper'

export class Faq2 extends Component {
	name = 'FAQ 2'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	const component = useSelectedElement() as BoxElement
	const list = component.find(tags.list) as BoxElement

	return (
		<ComponentWrapper>
			<cmn.heading.Options />
			<cmn.desc.Options />
			<cmn.outlineBtn.Options />
			<DndTabs
				containerElement={list}
				insertElement={question}
				renderItemOptions={(item) => <ItemOptions item={item as BoxElement} />}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: BoxElement }) {
	const question = item.find(tags.items.question) as TextElement
	const answer = item.find(tags.items.question) as TextElement

	return (
		<OptionsWrapper>
			<TextStyler element={question} label="Question" />
			<TextStyler element={answer} label="Answer" />
		</OptionsWrapper>
	)
}

const tags = {
	list: 'list',
	items: {
		question: 'question',
		answer: 'answer',
	},
}

const component = () =>
	cmn.ppr.el([
		grid(2)
			.populate([
				box([
					cmn.heading.el('FAQs'),
					cmn.desc
						.el(
							'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'
						)
						.css({
							maxWidth: '48rem',
						}),
					cmn.outlineBtn.el('Contact'),
				]),
				questions(),
			])
			.css({
				gridTemplateColumns: '0.75fr 1fr',
				columnGap: '5rem',
				rowGap: '4rem',
			})
			.cssTablet({
				gridTemplateColumns: gridCols(1),
			}),
	])

const questions = () => box(_.times(5, question)).tag(tags.list)

const question = () =>
	box([
		txt('Question text goes here')
			.css({
				fontSize: '1.125rem',
				fontWeight: '700',
				lineHeight: '1.5',
				marginBottom: '1rem',
			})
			.tag(tags.items.question),
		txt(
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.'
		)
			.css({
				fontSize: '1rem',
				lineHeight: '1.5',
			})
			.tag(tags.items.answer),
	]).css({
		marginBottom: '3rem',
	})
