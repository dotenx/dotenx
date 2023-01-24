import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/feature-details-right.png'

import { deserializeElement } from '../../utils/deserialize'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { BoxStylerSimple } from '../simple/stylers/box-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Controller, ElementOptions } from './controller'
import { ComponentName, Divider } from './helpers'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class FeatureDetailsRight extends Controller {
	name = 'Features with details on the right'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FeatureDetailsRightOptions />
	}
}

// =============  renderOptions =============

function FeatureDetailsRightOptions() {
	const component = useSelectedElement<BoxElement>()!
	const image = component.find<ImageElement>(tagIds.image)!
	const features = component.find<BoxElement>(tagIds.features)!

	return (
		<OptionsWrapper>
			<ComponentName name="Feature with details on the left" />
			<ImageStyler element={image} />
			<BoxStylerSimple label="Background color" element={component} />
			<Divider title="Rows" />
			<DndTabs
				containerElement={features}
				renderItemOptions={(item) => <FeatureOptions item={item} />}
				insertElement={() => createRow('title', 'Lorem ipsum dolor sit amet')}
			/>
		</OptionsWrapper>
	)
}

function FeatureOptions({ item }: { item: Element }) {
	const title = item.children?.[0] as TextElement
	const details = item.children?.[1] as TextElement

	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<TextStyler label="Details" element={details} />
		</OptionsWrapper>
	)
}

// =============  defaultData =============

const tagIds = {
	image: 'image',
	features: 'features',
}

const wrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gap: '20px',
			gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
			width: '100%',
			height: '600px',
			alignItems: 'center',
			justifyContent: 'flex-start',
			paddingLeft: '10%',
			paddingRight: '10%',
		},
	}
	draft.style.mobile = {
		default: {
			height: '350px',
			gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
			backgroundPosition: 'right 10% bottom 80%', // todo: check why this is not working as expected. Expected right center to work
			backgroundSize: '60% auto',
			paddingLeft: '10%',
			paddingRight: '10%',
		},
	}
}).serialize()

const detailsWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'flex-start',
			width: '100%',
			lineHeight: '1.6',
		},
	}
	draft.style.tablet = {
		default: {
			lineHeight: '1.3',
		},
	}
	draft.style.mobile = {
		default: {
			maxWidth: '100%',
			lineHeight: '1.2',
		},
	}
}).serialize()

const imageContainer = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '100%',
			maxHeight: '400px',
			height: 'auto',
			objectFit: 'cover',
			objectPosition: 'center center',
		},
	}
	draft.style.mobile = {
		default: {
			order: 0,
		},
	}
	draft.data.src = Expression.fromString(
		'https://img.freepik.com/free-vector/blue-marketing-charts-design-template_52683-24522.jpg?w=740&t=st=1666791210~exp=1666791810~hmac=42932320db4bb7c5f36815c67c56445ee01765aca6caaf5306415f1811690352'
	)
	draft.tagId = tagIds.image
}).serialize()

const featureRowsWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			marginTop: '20px',
			marginBottom: '20px',
			fontSize: '15px',
		},
	}
	draft.style.mobile = {
		default: {
			marginTop: '0px',
			marginBottom: '12px',
			fontSize: '10px',
		},
	}
	draft.tagId = tagIds.features
}).serialize()

const createFeatureRow = () =>
	produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				alignItems: 'center',
				marginTop: '15px',
				marginBottom: '15px',
				marginLeft: '0px',
				marginRight: '0px',
			},
		}
		const title = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					fontSize: '26px',
					fontWeight: '600',
					color: 'rgb(17, 24, 39)',
				},
			}
			draft.data.text = Expression.fromString('title')
		})
		const details = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					color: 'rgb(55, 65, 81)',
					fontSize: '16px',
					fontWeight: '400',
				},
			}
			draft.data.text = Expression.fromString(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
			)
		})

		draft.children = [title, details]
	})

const createRow = (title: string, details: string) => {
	return produce(createFeatureRow(), (draft) => {
		const titleElement = draft.children[0]! as TextElement
		titleElement.data.text = Expression.fromString(title)
		const detailsElement = draft.children[1]! as TextElement
		detailsElement.data.text = Expression.fromString(details)
	})
}

const featureRows = [
	createRow(
		'Scalable',
		"Scalable is a tool that helps you create business solutions that scale with your business.Let's take a look at an example.Say you have a business that generates a lot of leads.You have a list of 200,000 leads and you want to send each of them a customized welcome email."
	).serialize(),
	createRow(
		'Functionality',
		'Functionality is another skill that every graphic designer needs to know.You should know how to work with different data sets, and how to work with different tools.'
	).serialize(),
	createRow(
		'Security',
		'This is not just limited to your files but also your emails, your social media profiles, and your phone.Security is a hot topic in technology and people are always looking for the newest hacks and solutions, so it’s no surprise that some of the most popular tools are also the most complex to use.'
	).serialize(),
]

const defaultData = {
	...wrapper,
	components: [
		{
			...imageContainer,
		},
		{
			...detailsWrapper,
			components: [{ ...featureRowsWrapper, components: featureRows }],
		},
	],
}
