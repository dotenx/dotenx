import componentImage from '../../../assets/components/features/feature-18.png'
import { box, column, flex, grid, icn, txt } from '../../elements/constructor'
import { BoxElement } from '../../elements/extensions/box'
import { IconElement } from '../../elements/extensions/icon'
import { TextElement } from '../../elements/extensions/text'
import { useSelectedElement } from '../../selection/use-selected-component'
import { IconStyler } from '../../simple/stylers/icon-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { cmn } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { OptionsWrapper } from '../helpers/options-wrapper'

export class Feature18 extends Component {
	name = 'Feature 18'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	const component = useSelectedElement<BoxElement>()!
	const steps = component.find<BoxElement>(tags.steps)!

	return (
		<ComponentWrapper>
			<cmn.tagline.Options />
			<cmn.heading.Options />
			<cmn.btnLinks.Options />
			<DndTabs
				containerElement={steps}
				insertElement={() => step('Subheading')}
				renderItemOptions={(item) => <ItemOptions item={item as BoxElement} />}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: BoxElement }) {
	const icon = item.find<IconElement>(tags.step.icon)!
	const title = item.find<TextElement>(tags.step.title)!
	const desc = item.find<TextElement>(tags.step.desc)!

	return (
		<OptionsWrapper>
			<IconStyler label="Icon" element={icon} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Description" element={desc} />
		</OptionsWrapper>
	)
}

const tags = {
	steps: 'steps',
	step: {
		icon: 'icon',
		title: 'title',
		desc: 'desc',
	},
}

const component = () =>
	cmn.ppr.el([
		cmn.halfGrid.el([box([cmn.tagline.el(), cmn.heading.el(), cmn.btnLinks.el()]), steps()]),
	])

const steps = () =>
	box([
		column([
			step('Subheading one'),
			step('Subheading two'),
			step('Subheading three'),
			step('Subheading four'),
		])
			.css({
				gap: '1rem',
				marginTop: '1rem',
			})
			.tag(tags.steps),
	]).customCss('> div:last-child > div:last-child > div:nth-child(1) > div:nth-child(2)', {
		// to hide the last line
		display: 'none',
	})

const step = (title: string) =>
	grid(2)
		.populate([
			column([
				box([icn('circle').size('40px')])
					.css({
						flexShrink: '0',
					})
					.tag(tags.step.icon),
				box([txt('')]).css({
					width: '1.5px',
					backgroundColor: 'currentcolor',
					flexGrow: '1',
				}),
			]).css({
				alignItems: 'center',
				gap: '1rem',
			}),
			flex([
				box([
					txt(title)
						.css({
							fontWeight: '700',
							fontSize: '1.25rem',
							lineHeight: '1.4',
							marginBottom: '1rem',
						})
						.tag(tags.step.title),
					txt(
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'
					)
						.css({
							fontSize: '1rem',
							lineHeight: '1.5',
						})
						.tag(tags.step.desc),
				]),
			]).css({
				gap: '1rem',
				paddingBottom: '4rem',
			}),
		])
		.css({
			gridTemplateColumns: '1fr 7fr',
			columnGap: '2.5rem',
		})
