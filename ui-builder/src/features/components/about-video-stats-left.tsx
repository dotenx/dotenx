import { ReactNode } from 'react'
import imageUrl from '../../assets/components/about-video-stats-left.png'
import { deserializeElement } from '../../utils/deserialize'
import { box, img, txt, video } from '../elements/constructor'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { VideoElement } from '../elements/extensions/video'
import { useSelectedElement } from '../selection/use-selected-component'
import { fontSizes } from '../simple/font-sizes'
import { color } from '../simple/palette'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { VideoStyler } from '../simple/stylers/video-styler'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class AboutVideoStatsLeft extends Component {
	name = 'About us with video one the left and stats'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(): ReactNode {
		return <AboutVideoStatsLeftOptions />
	}
}

// =============  renderOptions =============

function AboutVideoStatsLeftOptions() {
	const component = useSelectedElement<BoxElement>()!
	const title = component.find<TextElement>(tagIds.title)!
	const video = component.find<VideoElement>(tagIds.video)!
	const subtitle = component.find<TextElement>(tagIds.subtitle)!
	const statsWrapper = component.find<BoxElement>(tagIds.statsWrapper)!

	return (
		<ComponentWrapper name="About us with video one the left and stats">
			<TextStyler label="Title" element={title} />
			<VideoStyler element={video} />
			<TextStyler label="Subtitle" element={subtitle} />
			<DndTabs
				containerElement={statsWrapper}
				renderItemOptions={(item) => <ItemOptions item={item} />}
				insertElement={() =>
					createStat(
						'https://files.dotenx.com/assets/icon-team-zqr.png',
						'10+',
						'Years of experience'
					)
				}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: Element }) {
	const image = item.find<ImageElement>(tagIds.statImage)!
	const title = item.find<TextElement>(tagIds.statTitle)!
	const subtitle = item.find<TextElement>(tagIds.statSubtitle)!

	return (
		<OptionsWrapper>
			<ImageStyler element={image} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Subtitle" element={subtitle} />
		</OptionsWrapper>
	)
}

const tagIds = {
	title: 'title',
	subtitle: 'subtitle',
	video: 'video',
	statImage: 'statImage',
	statTitle: 'statTitle',
	statSubtitle: 'statSubtitle',
	statsWrapper: 'statsWrapper',
}

// =============  defaultData =============

const frame = box([])
	.css({
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		width: '100%',
		paddingTop: '40px',
		paddingBottom: '40px',
		paddingLeft: '15%',
		paddingRight: '15%',
		gap: '40px',
	})
	.cssTablet({
		gridTemplateColumns: '1fr',
		paddingLeft: '10%',
		paddingRight: '10%',
		paddingTop: '30px',
		paddingBottom: '30px',
		gap: '30px',
	})
	.cssMobile({
		paddingLeft: '5%',
		paddingRight: '5%',
		paddingTop: '20px',
		paddingBottom: '20px',
		gap: '20px',
	})
	.serialize()

const videoSideWrapper = box([
	txt('Team of professionals')
		.tag(tagIds.title)
		.css({
			color: color('primary'),
			fontSize: fontSizes.h1.desktop,
			fontWeight: 'bold',
			marginBottom: '10px',
		})
		.cssTablet({
			fontSize: fontSizes.h1.tablet,
			marginBottom: '5px',
		})
		.cssMobile({
			fontSize: fontSizes.h1.mobile,
		}),
	video('https://files.dotenx.com/assets/team-wer19v.mp4')
		.autoplay(false)
		.controls(true)
		.css({
			width: '100%',
			borderRadius: '10px',
		})
		.tag(tagIds.video),
])
	.css({
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
	})
	.serialize()

const createStat = (src: string, title: string, subtitle: string) =>
	box([
		img(src)
			.tag(tagIds.statImage)
			.css({
				width: '40px',
				height: '40px',
				borderRadius: '50%',
			})
			.cssTablet({
				width: '30px',
				height: '30px',
			})
			.cssMobile({
				width: '20px',
				height: '20px',
			}),
		box([
			txt(title)
				.tag(tagIds.statTitle)
				.css({
					color: color('secondary'),
					fontSize: fontSizes.h2.desktop,
					fontWeight: 'bold',
				})
				.cssTablet({
					fontSize: fontSizes.h2.tablet,
				})
				.cssMobile({
					fontSize: fontSizes.h2.mobile,
				}),
			txt(subtitle)
				.tag(tagIds.statSubtitle)
				.css({
					color: color('text'),
					fontSize: fontSizes.normal.desktop,
				})
				.cssTablet({
					fontSize: fontSizes.normal.tablet,
				})
				.cssMobile({
					fontSize: fontSizes.normal.mobile,
				}),
		]).css({
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			alignItems: 'flex-start',
		}),
	])
		.css({
			display: 'flex',
			alignItems: 'center',
			columnGap: '10px',
		})
		.cssTablet({
			columnGap: '5px',
		})

const stats = box([
	createStat('https://files.dotenx.com/assets/icon-team-zqr.png', '10+', 'Years of experience'),
	createStat('https://files.dotenx.com/assets/icon-award-329z.png', '780+', 'Awards won'),
	createStat('https://files.dotenx.com/assets/icon-thumbup-91b.png', '1200+', 'Happy clients'),
	createStat('https://files.dotenx.com/assets/icon-growth-m21.png', '36%', 'Value growth'),
])
	.tag(tagIds.statsWrapper)
	.css({
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		gap: '20px',
	})

const statsSideWrapper = box([
	txt(
		`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec ultrices aliquam, nisl nisl aliquet lorem, nec ultrices lorem ipsum nec lorem. 
		Sed euismod, nisl nec ultrices aliquam, nisl nisl aliquet lorem, nec ultrices lorem ipsum nec lorem.`
	)
		.tag(tagIds.subtitle)
		.css({
			color: color('primary', 0.9),
			fontSize: fontSizes.normal.desktop,
		})
		.cssTablet({
			fontSize: fontSizes.normal.tablet,
		})
		.cssMobile({
			fontSize: fontSizes.normal.mobile,
		}),
	stats,
])
	.css({
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-evenly',
	})
	.serialize()

const defaultData = {
	...frame,
	components: [videoSideWrapper, statsSideWrapper],
}
