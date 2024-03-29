import _ from 'lodash'
import componentImage from '../../../assets/components/faq/faq-1.png'
import { box, flex, icn, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { TextElement } from '../../elements/extensions/text'
import componentScript from '../../scripts/faq-1.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
import { TextStyler } from '../../simple/stylers/text-styler'
import { cmn } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { OptionsWrapper } from '../helpers/options-wrapper'

export class Faq1 extends Component {
	name = 'FAQ 1'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
	onCreate(root: Element) {
		const compiled = _.template(componentScript)
		const script = compiled({ id: root.id })
		setElement(root, (draft) => (draft.script = script))
	}
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
	cmn.ppr.el([
		cmn.heading.el('FAQs'),
		cmn.desc
			.el(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'
			)
			.css({
				marginBottom: '5rem',
				maxWidth: '48rem',
			}),
		questions(),
		txt('Still have questions?')
			.css({
				fontSize: '2rem',
				lineHeight: '1.3',
				fontWeight: '700',
				marginBottom: '1rem',
			})
			.tag(tags.subheading),
		cmn.desc.el('Lorem ipsum dolor sit amet, consectetur adipiscing elit.').tag(tags.subDesc),
		cmn.outlineBtn.el('Contact'),
	])

const questions = () =>
	box(_.times(5, question))
		.css({
			borderBottom: '1px solid #000',
		})
		.css({
			marginBottom: '5rem',
		})
		.tag(tags.list)

const question = () =>
	box([
		flex([
			txt('Question text goes here')
				.css({
					fontSize: '1.125rem',
					fontWeight: '700',
				})
				.tag(tags.items.question),
			icn('chevron-down').size('18px').class('chevron'),
		])
			.css({
				padding: '1.25rem 0',
				alignItems: 'center',
				justifyContent: 'space-between',
				cursor: 'pointer',
			})
			.class('question'),
		txt(
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.'
		)
			.css({
				display: 'none',
				maxWidth: '48rem',
				marginBottom: '1.5rem',
				lineHeight: '1.5',
			})
			.tag(tags.items.answer)
			.class('answer'),
	])
		.css({
			borderTop: '1px solid #000',
		})
		.class('item')
