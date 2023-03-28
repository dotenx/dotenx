import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/testimonial-simple.png'
import { deserializeElement } from '../../utils/deserialize'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { BoxStyler, BoxStylerSimple } from '../simple/stylers/box-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component, ElementOptions } from './component'
import { ComponentName, Divider, SimpleComponentOptionsProps } from './helpers'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class TestimonialSimple extends Component {
	name = 'Simple testimonial'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <TestimonialSimpleOptions options={options} />
	}
}

// =============  renderOptions =============

function TestimonialSimpleOptions({ options }: SimpleComponentOptionsProps) {
	const containerDiv = options.element as BoxElement
	const title = containerDiv.children?.[0] as TextElement
	const subtitle = containerDiv.children?.[1] as TextElement
	const gridContainer = containerDiv.children?.[2] as BoxElement

	return (
		<ComponentWrapper name="Simple testimonial">
			<TextStyler label="Title" element={title} />
			<TextStyler label="Subtitle" element={subtitle} />
			<Divider title="Testimonials" />
			<DndTabs
				containerElement={gridContainer}
				insertElement={() =>
					createBioWithImage({
						image: 'https://files.dotenx.com/assets/profile1-v13.jpeg',
						name: 'Alex Smith',
						description:
							' Vitae suscipit tellus mauris a diam maecenas sed enim ut. Mauris augue neque gravida in fermentum.',
						title: 'Co-Founder & CTO',
					})
				}
				renderItemOptions={(item) => <ItemOptions item={item} />}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: Element }) {
	const image = item.children![0] as ImageElement
	const name = item.children![1] as TextElement
	const title = item.children![2] as TextElement
	const description = item.children![3] as TextElement

	return (
		<OptionsWrapper>
			<ImageStyler element={image} />
			<TextStyler label="Name" element={name} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Description" element={description} />
			<BoxStyler label="Block" element={item} />
		</OptionsWrapper>
	)
}

// =============  defaultData =============

const wrapperDiv = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			textAlign: 'center',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			paddingLeft: '15%',
			paddingRight: '15%',
			paddingTop: '50px',
			paddingBottom: '50px',
		},
	}
	draft.style.tablet = {
		default: {
			paddingLeft: '10%',
			paddingRight: '10%',
			paddingTop: '40px',
			paddingBottom: '40px',
		},
	}

	draft.style.mobile = {
		default: {
			paddingLeft: '5%',
			paddingRight: '5%',
			paddingTop: '30px',
			paddingBottom: '30px',
		},
	}
}).serialize()
const gridWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr',
		},
	}

	draft.style.tablet = {
		default: {
			gridTemplateColumns: '1fr 1fr',
		},
	}

	draft.style.mobile = {
		default: {
			gridTemplateColumns: '1fr',
		},
	}
}).serialize()

const testimonialDetails = [
	{
		name: 'Bob Roberts',
		title: 'CO-founder & CEO',
		description:
			'Vitae suscipit tellus mauris a diam maecenas sed enim ut. Mauris augue neque gravida in fermentum.',
		image: 'https://files.dotenx.com/assets/profile2-ba1.jpeg',
	},
	{
		name: 'Celia Almeda',
		title: 'Sales Manager',
		description:
			'Pharetra vel turpis nunc eget lorem. Quisque id diam vel quam elementum pulvinar etiam.',
		image: 'https://files.dotenx.com/assets/profile1-v13.jpeg',
	},
	{
		name: 'Jack Smith',
		title: 'Chief Accountant',
		description:
			'Mauris augue neque gravida in fermentum. Praesent semper feugiat nibh sed pulvinar proin.',
		image: 'https://files.dotenx.com/assets/profile4-k38.jpeg',
	},
]
const title = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '32px',
			marginBottom: '8px',
			fontWeight: 'bold',
		},
	}

	draft.style.tablet = {
		default: {
			fontSize: '30px',
		},
	}
	draft.data.text = Expression.fromString('What Clients Say')
}).serialize()
const description = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '24px',
			marginBottom: '8px',
		},
	}
	draft.style.tablet = {
		default: {
			fontSize: '18px',
		},
	}

	draft.style.mobile = {
		default: {
			fontSize: '16px',
		},
	}

	draft.data.text = Expression.fromString(
		'we place huge value on strong relationships and have seen the benefits they bring to our business.'
	)
}).serialize()
const createBioWithImage = ({
	name,
	description,
	image,
	title,
}: {
	name: string
	description: string
	image: string
	title: string
}) =>
	produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				paddingLeft: '5%',
				paddingRight: '5%',
				paddingTop: '20px',
				paddingBottom: '20px',
				textAlign: 'center',
			},
		}

		const imageElement = produce(new ImageElement(), (draft) => {
			draft.style.desktop = {
				default: {
					maxWidth: '100px',
					height: 'auto',
					borderRadius: '50%',
					marginBottom: '15px',
				},
			}
			draft.data.src = Expression.fromString(image)
		})
		const nameText = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					fontSize: '16px',
					marginBottom: '5px',
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

			draft.data.text = Expression.fromString(name)
		})
		const titleText = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					fontSize: '18px',
					marginBottom: '15px',
				},
			}
			draft.style.tablet = {
				default: {
					fontSize: '16px',
				},
			}

			draft.style.mobile = {
				default: {
					fontSize: '14px',
				},
			}

			draft.data.text = Expression.fromString(title)
		})
		const descriptionText = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					fontSize: '16px',
					marginTop: '5px',
				},
			}
			draft.style.tablet = {
				default: {
					fontSize: '14px',
				},
			}
			draft.data.text = Expression.fromString(description)
		})

		draft.children = [imageElement, nameText, titleText, descriptionText]
	})

const defaultData = {
	...wrapperDiv,
	components: [
		title,
		description,
		{
			...gridWrapper,
			components: testimonialDetails.map((teamDetail) =>
				createBioWithImage(teamDetail).serialize()
			),
		},
	],
}
