import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/step-grid-cta-left.png'
import { deserializeElement } from '../../utils/deserialize'
import { box, txt } from '../elements/constructor'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { fontSizes } from '../simple/font-sizes'
import { color } from '../simple/palette'
import { BoxStylerSimple } from '../simple/stylers/box-styler'
import { LinkStyler } from '../simple/stylers/link-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class StepGridCtaLeft extends Component {
	name = 'Steps grid with CTA on the left'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(): ReactNode {
		return <StepGridCtaLeftOptions />
	}
}

// =============  renderOptions =============

function StepGridCtaLeftOptions() {
	const component = useSelectedElement<BoxElement>()!
	const title = component.find<TextElement>(tagIds.title)!
	const subtitle = component.find<TextElement>(tagIds.subtitle)!
	const cta = component.find<LinkElement>(tagIds.cta)!
	const ctaText = component.find<TextElement>(tagIds.ctaText)!
	const stepsWrapper = component.find<BoxElement>(tagIds.stepsWrapper)!

	return (
		<ComponentWrapper name="Steps grid with CTA on the left">
			<TextStyler label="Title" element={title} />
			<TextStyler label="Subtitle" element={subtitle} />
			<TextStyler label="CTA" element={ctaText} />
			<LinkStyler label="CTA Link" element={cta} />
			<DndTabs
				containerElement={stepsWrapper}
				renderItemOptions={(item) => <ItemOptions item={item} />}
				insertElement={() => newStep('1', 'Step title', 'Step text')}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: Element }) {
	const stepNumber = item.find<TextElement>(tagIds.stepNumber)!
	const stepNumberBackground = item.find<BoxElement>(tagIds.stepNumberBackground)!
	const stepTitle = item.find<TextElement>(tagIds.stepTitle)!
	const stepText = item.find<TextElement>(tagIds.stepText)!

	return (
		<OptionsWrapper>
			<TextStyler label="Step number" element={stepNumber} />
			<BoxStylerSimple label="Step number background" element={stepNumberBackground} />
			<TextStyler label="Step title" element={stepTitle} />
			<TextStyler label="Step text" element={stepText} />
		</OptionsWrapper>
	)
}

const tagIds = {
	title: 'title',
	subtitle: 'subtitle',
	stepsWrapper: 'stepsWrapper',
	cta: 'cta',
	ctaText: 'ctaText',
	stepNumber: 'stepNumber',
	stepNumberBackground: 'stepNumberBackground',
	stepTitle: 'stepTitle',
	stepText: 'stepText',
}

// =============  defaultData =============

const component = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 3fr ',
			width: '100%',
			alignItems: 'center',
			justifyContent: 'center',
			paddingLeft: '15%',
			paddingRight: '15%',
			paddingTop: '40px',
			paddingBottom: '40px',
			gap: '40px',
		},
	}
	draft.style.tablet = {
		default: {
			gridTemplateColumns: ' 1fr ',
			paddingLeft: '10%',
			paddingRight: '10%',
			gap: '30px',
		},
	}
	draft.style.mobile = {
		default: {
			paddingLeft: '5%',
			paddingRight: '5%',
			gap: '20px',
		},
	}
}).serialize()

const detailsWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'flex-start',
			alignItems: 'flex-start',
			rowGap: '20px',
		},
	}
	draft.style.tablet = {
		default: {
			textAlign: 'center',
			justifyContent: 'center',
			alignItems: 'center',
			rowGap: '10px',
		},
	}
	draft.style.mobile = {
		default: {
			rowGap: '5px',
		},
	}
}).serialize()

const title = txt('Simplify your business')
	.tag(tagIds.title)
	.css({
		fontSize: fontSizes.h3.desktop,
		fontWeight: 'bold',
		color: color('primary'),
	})
	.cssTablet({
		fontSize: fontSizes.h3.tablet,
	})
	.cssMobile({
		fontSize: fontSizes.h3.mobile,
	})
	.serialize()

const subtitle =
	txt(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod nisl vel dolor aliquet, nec ultricies nisl aliquam. 
Sed euismod nisl vel dolor aliquet, nec ultricies nisl aliquam. Sed euismod nisl vel dolor aliquet, nec ultricies nisl aliquam. 
Sed euismod nisl vel dolor aliquet, nec ultricies nisl aliquam.`)
		.tag(tagIds.subtitle)
		.css({
			textAlign: 'justify',
			fontSize: fontSizes.normal.desktop,
			color: color('primary', 0.9),
		})
		.cssTablet({
			fontSize: fontSizes.normal.tablet,
		})
		.cssMobile({
			fontSize: fontSizes.normal.mobile,
		})
		.serialize()

const cta = produce(new LinkElement(), (draft) => {
	draft.style.desktop = {
		default: {
			backgroundColor: color('primary'),
			border: 'none',
			borderRadius: '10px',
			textAlign: 'center',
			textDecoration: 'none',
			cursor: 'pointer',
			paddingTop: '5px',
			paddingBottom: '5px',
			paddingLeft: '15px',
			paddingRight: '15px',
		},
	}
	draft.style.tablet = {
		default: {
			justifySelf: 'center',
		},
	}

	const element = new TextElement()
	element.data.text = Expression.fromString('Learn more')
	element.tagId = tagIds.ctaText
	element.style.desktop = {
		default: {
			color: 'hsla(0, 0%, 100%, 1)',
			fontSize: '20px',
			fontWeight: '400',
		},
	}
	element.style.tablet = {
		default: {
			fontSize: '18px',
		},
	}
	element.style.mobile = {
		default: {
			fontSize: '14px',
		},
	}

	draft.data.href = Expression.fromString('#')
	draft.data.openInNewTab = false

	draft.children = [element]
	draft.tagId = tagIds.cta
}).serialize()

const newStep = (stepNumber: string, title: string, text: string) =>
	box([
		box([
			txt(stepNumber)
				.css({
					color: color('primary'),
					fontWeight: 'bold',
					fontSize: fontSizes.h3.desktop,
				})
				.cssTablet({
					fontSize: fontSizes.h3.tablet,
				})
				.cssMobile({
					fontSize: fontSizes.h3.mobile,
				})
				.tag(tagIds.stepNumber),
		])
			.tag(tagIds.stepNumberBackground)
			.css({
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: color('background', 0.8),
				alignSelf: 'start',
				paddingLeft: '8px',
				paddingRight: '8px',
				paddingTop: '5px',
				paddingBottom: '5px',
				borderRadius: '5px',
				minWidth: '30px',
				minHeight: '30px',
				boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.16)',
				marginTop: '-35px',
			})
			.cssTablet({
				minWidth: '25px',
				minHeight: '25px',
				marginTop: '-30px',
			})
			.cssMobile({
				minWidth: '20px',
				minHeight: '20px',
				marginTop: '-25px',
			}),
		txt(title)
			.css({
				fontSize: fontSizes.h3.desktop,
				color: color('secondary'),
			})
			.cssTablet({
				fontSize: fontSizes.h3.tablet,
			})
			.cssMobile({
				fontSize: fontSizes.h3.mobile,
			})
			.tag(tagIds.stepTitle),
		txt(text)
			.css({
				fontSize: fontSizes.normal.desktop,
				color: color('text'),
			})
			.cssTablet({
				fontSize: fontSizes.normal.tablet,
			})
			.cssMobile({
				fontSize: fontSizes.normal.mobile,
			})
			.tag(tagIds.stepText),
	]).css({
		display: 'flex',
		flexDirection: 'column',
		position: 'relative',
		boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.16)',
		padding: '15px',
		borderRadius: '5px',
		margin: '10px',
	})

const steps = box([
	newStep(
		'1',
		'Initial Assessment',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc sit amet aliquet lacinia, nisl nisl aliquet nisl, nec aliquet nunc nisl sit amet nisl.'
	),
	newStep(
		'2',
		'Planning',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc sit amet aliquet lacinia, nisl nisl aliquet nisl, nec aliquet nunc nisl sit amet nisl.'
	),
	newStep(
		'3',
		'Execution',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc sit amet aliquet lacinia, nisl nisl aliquet nisl, nec aliquet nunc nisl sit amet nisl.'
	),
	newStep(
		'4',
		'Delivery',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc sit amet aliquet lacinia, nisl nisl aliquet nisl, nec aliquet nunc nisl sit amet nisl.'
	),
	newStep(
		'5',
		'Maintenance',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc sit amet aliquet lacinia, nisl nisl aliquet nisl, nec aliquet nunc nisl sit amet nisl.'
	),
	newStep(
		'6',
		'Support',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc sit amet aliquet lacinia, nisl nisl aliquet nisl, nec aliquet nunc nisl sit amet nisl.'
	),
])
	.css({
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
		rowGap: '25px',
	})
	.cssTablet({
		rowGap: '20px',
	})
	.cssMobile({
		rowGap: '15px',
	})
	.tag(tagIds.stepsWrapper)
	.serialize()

const defaultData = {
	...component,
	components: [
		{
			...detailsWrapper,
			components: [title, subtitle, cta],
		},
		steps,
	],
}
