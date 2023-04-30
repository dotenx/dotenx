// relume feature 55
import componentImage from '../../../assets/components/features/feature-11.png'
import { gridCols } from '../../../utils/style-utils'
import { box, container, flex, grid, icn, link, txt } from '../../elements/constructor'
import { BoxElement } from '../../elements/extensions/box'
import { LinkElement } from '../../elements/extensions/link'
import { TextElement } from '../../elements/extensions/text'
import { useSelectedElement } from '../../selection/use-selected-component'
import { LinkStyler } from '../../simple/stylers/link-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { cmn } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'

export class Feature11 extends Component {
	name = 'Feature 11'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	const component = useSelectedElement<BoxElement>()!
	const tagline = component.find<TextElement>(tags.tagline)!
	const heading = component.find<TextElement>(tags.heading)!
	const description = component.find<TextElement>(tags.description)!
	const link1 = component.find<LinkElement>(tags.link1)!
	const link1Text = link1.find<TextElement>(tags.link1Text)!
	const link2 = component.find<LinkElement>(tags.link2)!
	const link2Text = link2.find<TextElement>(tags.link2Text)!

	return (
		<ComponentWrapper name="Feature 11">
			<TextStyler label="Tagline" element={tagline} />
			<TextStyler label="Heading" element={heading} />
			<TextStyler label="Description" element={description} />
			<LinkStyler label="Link 1" element={link1} />
			<TextStyler label="Link 1 text" element={link1Text} />
			<LinkStyler label="Link 2" element={link2} />
			<TextStyler label="Link 2 text" element={link2Text} />
			<cmn.icnSubheadings.Options />
		</ComponentWrapper>
	)
}

const tags = {
	tagline: 'tagline',
	heading: 'heading',
	description: 'description',
	link1: 'link1',
	link1Text: 'link1Text',
	link2: 'link2',
	link2Text: 'link2Text',
}

const component = () =>
	box([
		container([
			grid(2)
				.populate([
					box([
						txt('Tagline')
							.css({
								fontWeight: '600',
								fontSize: '1rem',
								lineHeight: '1.5',
								marginBottom: '1rem',
							})
							.tag(tags.tagline),
						txt('Medium length section heading goes here')
							.css({
								fontWeight: '700',
								fontSize: '3rem',
								lineHeight: '1.2',
								marginBottom: '1.5rem',
							})
							.cssTablet({
								fontSize: '2.25rem',
							})
							.tag(tags.heading),
					]),
					box([
						txt(
							'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.'
						)
							.css({
								fontSize: '1.125rem',
								lineHeight: '1.5',
								marginBottom: '2rem',
							})
							.cssTablet({
								fontSize: '1rem',
							})
							.tag(tags.description),
						cmn.icnSubheadings.el(),
						flex([
							link()
								.populate([txt('Button').tag(tags.link1Text)])
								.css({
									border: '1px solid #fff',
									padding: '0.75rem 1.5rem',
								})
								.tag(tags.link1),
							link()
								.populate([
									flex([
										txt('Button').tag(tags.link2Text),
										icn('chevron-right').size('16px'),
									]).css({
										alignItems: 'center',
										padding: '0.75rem 1.5rem',
										gap: '8px',
									}),
								])
								.tag(tags.link2),
						]).css({
							marginTop: '2rem',
							gap: '1rem',
						}),
					]),
				])
				.css({
					columnGap: '80px',
					rowGap: '64px',
				})
				.cssTablet({
					gridTemplateColumns: gridCols(1),
				}),
		]),
	])
		.css({
			paddingTop: '7rem',
			paddingBottom: '7rem',
			paddingRight: '5%',
			paddingLeft: '5%',
			color: '#fff',
			backgroundImage: 'url(https://files.dotenx.com/assets/hero-bg-wva.jpeg)',
		})
		.cssTablet({
			paddingTop: '4rem',
			paddingBottom: '4rem',
		})
