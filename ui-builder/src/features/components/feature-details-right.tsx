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
import { Component, ElementOptions } from './component'
import { ComponentName, Divider } from './helpers'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class FeatureDetailsRight extends Component {
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
		<ComponentWrapper name="Feature with details on the right">
			<ImageStyler element={image} />
			<BoxStylerSimple label="Background color" element={component} />
			<Divider title="Rows" />
			<DndTabs
				containerElement={features}
				renderItemOptions={(item) => <FeatureOptions item={item} />}
				insertElement={() => createRow('title', 'Lorem ipsum dolor sit amet')}
			/>
		</ComponentWrapper>
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
			gridTemplateColumns: '1fr 1fr',
			width: '100%',
			alignItems: 'center',
			justifyContent: 'center',
			paddingLeft: '15%',
			paddingRight: '15%',
			paddingTop: '5%',
			paddingBottom: '5%',
		},
	}

	draft.style.tablet = {
		default: {
			gridTemplateColumns: '1fr',
			paddingLeft: '10%',
			paddingRight: '10%',
		}
	}
	
	draft.style.tablet = {
		default: {
			gridTemplateColumns: '1fr',
			paddingLeft: '5%',
			paddingRight: '5%',
		}
	}

}).serialize()

const detailsWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'flex-start',
			alignItems: 'stretch',
			lineHeight: '1.6',
			gap: '20px',
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
			height: 'auto',
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
				marginTop: '15px',
				marginBottom: '15px',
			},
		}
		const title = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					fontSize: '26px',
					fontWeight: '600',
					color: 'rgb(17, 24, 39)',
					marginBottom: '4px',
				},
			}

			draft.style.tablet = {
				default: {
					fontSize: '20px',
					marginBottom: '3px',
				},
			}

			draft.style.mobile = {
				default: {
					fontSize: '16px',
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

			draft.style.tablet = {
				default: {
					fontSize: '14px',
				},
			}

			draft.style.mobile = {
				default: {
					fontSize: '12px',
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
		"Scalable is a tool that helps you create business solutions that scale with your business.Let's take a look at an example."
	).serialize(),
	createRow(
		'Functionality',
		'Functionality is another skill that every graphic designer needs to know.You should know how to work with different data sets, and how to work with different tools.'
	).serialize(),
	createRow(
		'Security',
		'This is not just limited to your files but also your emails, your social media profiles, and your phone.Security is a hot topic in technology.'
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
