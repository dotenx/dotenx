import _ from 'lodash'
import componentImage from '../../../assets/components/faq/faq-3.png'
import { box, column, txt } from '../../elements/constructor'
import { BoxElement } from '../../elements/extensions/box'
import { TextElement } from '../../elements/extensions/text'
import { useSelectedElement } from '../../selection/use-selected-component'
import { TextStyler } from '../../simple/stylers/text-styler'
import { cmn } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { OptionsWrapper } from '../helpers/options-wrapper'

export class Faq3 extends Component {
	name = 'FAQ 3'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	const component = useSelectedElement() as BoxElement
	const subheading = component.find(tags.subheading) as TextElement
	const subDesc = component.find(tags.subDesc) as TextElement
	const list = component.find(tags.list) as BoxElement

	return (
		<ComponentWrapper>
			<cmn.heading.Options />
			<cmn.desc.Options />
			<TextStyler element={subheading} label="Sub heading" />
			<TextStyler element={subDesc} label="Sub description" />
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
	subheading: 'subheading',
	subDesc: 'subDesc',
}

const component = () =>
	cmn.ppr
		.el([
			column([
				box([
					cmn.heading.el('FAQs'),
					cmn.desc.el(
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'
					),
				])
					.css({
						marginBottom: '4rem',
					})
					.cssTablet({
						marginBottom: '2rem',
					}),
				questions(),
				txt('Still have questions?')
					.css({
						fontSize: '2rem',
						lineHeight: '1.3',
						fontWeight: '700',
						marginBottom: '1rem',
						marginTop: '2rem',
					})
					.cssTablet({
						marginTop: '0',
					})
					.tag(tags.subheading),
				cmn.desc
					.el('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
					.tag(tags.subDesc),
				cmn.outlineBtn.el('Contact').css({
					alignSelf: 'center',
				}),
			]).css({
				maxWidth: '48rem',
				margin: '0 auto',
			}),
		])
		.css({
			textAlign: 'center',
		})

const questions = () =>
	box(_.times(5, question)).tag(tags.list).css({
		textAlign: 'start',
	})

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
