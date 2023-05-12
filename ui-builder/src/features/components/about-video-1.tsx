import imageUrl from '../../assets/components/about-video-1.png'
import { gridCols } from '../../utils/style-utils'
import { box, btn, container, grid, paper, txt, video } from '../elements/constructor'
import { BoxElement } from '../elements/extensions/box'
import { ButtonElement } from '../elements/extensions/button'
import { TextElement } from '../elements/extensions/text'
import { VideoElement } from '../elements/extensions/video'
import { useSelectedElement } from '../selection/use-selected-component'
import { color } from '../simple/palette'
import { ButtonStyler } from '../simple/stylers/button-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { VideoStyler } from '../simple/stylers/video-styler'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class AboutVideo1 extends Component {
	name = 'About us with video - 1'
	image = imageUrl
	defaultData = component()
	renderOptions = () => <ComponentOptions />
}

function ComponentOptions() {
	const root = useSelectedElement<BoxElement>()!
	const subtitle = root.find<TextElement>(tags.subtitle)!
	const title = root.find<TextElement>(tags.title)!
	const description = root.find<TextElement>(tags.description)!
	const button = root.find<ButtonElement>(tags.button)!
	const stats = root.find<BoxElement>(tags.stats)!
	const video = root.find<VideoElement>(tags.video)!

	return (
		<ComponentWrapper name="About us with video - 1">
			<TextStyler element={subtitle} label="Subtitle" />
			<TextStyler element={title} label="Title" />
			<TextStyler element={description} label="Description" />
			<ButtonStyler element={button} label="Button" />
			<DndTabs
				containerElement={stats}
				insertElement={() =>
					stat({
						value: '45',
						label: 'lorem ipsum dolor',
					})
				}
				renderItemOptions={(item) => <ItemOptions item={item as BoxElement} />}
			/>
			<VideoStyler element={video} />
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: BoxElement }) {
	const value = item.find<TextElement>(tags.statValue)!
	const title = item.find<TextElement>(tags.statTitle)!

	return (
		<OptionsWrapper>
			<TextStyler element={value} label="Value" />
			<TextStyler element={title} label="Title" />
		</OptionsWrapper>
	)
}

const tags = {
	subtitle: 'subtitle',
	title: 'title',
	description: 'description',
	button: 'button',
	stats: 'stats',
	statValue: 'statValue',
	statTitle: 'statTitle',
	video: 'video',
}

const stat = ({ value, label }: { value: string; label: string }) =>
	box([
		txt(value)
			.css({
				fontSize: '2.5rem',
				marginBottom: '10px',
				color: color('primary'),
			})
			.tag(tags.statValue),
		txt(label).tag(tags.statTitle),
	])

const stats = () =>
	grid(3)
		.populate([
			stat({
				value: '45',
				label: 'lorem ipsum dolor',
			}),
			stat({
				value: '45',
				label: 'lorem ipsum dolor',
			}),
			stat({
				value: '45',
				label: 'lorem ipsum dolor',
			}),
		])
		.tag(tags.stats)

const component = () =>
	paper([
		container([
			grid(2)
				.populate([
					box([
						txt('WHAT WE DO')
							.css({
								marginBottom: '10px',
							})
							.tag(tags.subtitle),
						txt('About us')
							.css({
								fontSize: '2.5rem',
							})
							.css({
								marginBottom: '20px',
							})
							.tag(tags.title),
						txt(
							'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ab, labore eos doloribus expedita magnam in omnis, impedit natus cupiditate dolorum necessitatibus similique sunt quae praesentium eius consectetur perferendis quibusdam? Nulla?'
						)
							.css({
								color: color('text', 0.75),
								marginBottom: '20px',
							})
							.tag(tags.description),
						stats().css({
							marginBottom: '20px',
						}),
						btn('Learn more')
							.css({
								color: color('background'),
								backgroundColor: color('primary'),
								borderRadius: '9999px',
								padding: '10px 50px',
								transition: 'all 150ms ease-in-out',
								border: '1px solid',
								borderColor: color('primary'),
							})
							.cssHover({
								color: color('primary'),
								backgroundColor: color('background'),
							})
							.tag(tags.button),
					]),
					video('https://files.dotenx.com/assets/team-wer19v.mp4')
						.autoplay(false)
						.controls(true)
						.css({
							width: '100%',
							borderRadius: '10px',
						})
						.tag(tags.video),
				])
				.css({
					gap: '100px',
					alignItems: 'center',
				})
				.cssTablet({
					gridTemplateColumns: gridCols(1),
				}),
		]),
	])
