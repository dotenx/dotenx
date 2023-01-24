import produce from 'immer'
import { ReactNode } from 'react'
import profile1Url from '../../assets/components/profile1.jpg'
import profile2Url from '../../assets/components/profile2.jpg'
import profile3Url from '../../assets/components/profile3.jpg'
import profile4Url from '../../assets/components/profile4.jpg'
import imageUrl from '../../assets/components/testimonial-simple.png'
import { deserializeElement } from '../../utils/deserialize'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { Expression } from '../states/expression'
import { BoxElementInputSimple } from '../ui/box-element-input'
import { ImageElementInput } from '../ui/image-element-input'
import { TextElementInput } from '../ui/text-element-input'
import { Controller, ElementOptions } from './controller'
import { ComponentName, Divider, SimpleComponentOptionsProps } from './helpers'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class TestimonialSimple extends Controller {
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
		<OptionsWrapper>
			<ComponentName name="Simple testimonial" />
			<TextElementInput label="Title" element={title} />
			<TextElementInput label="Subtitle" element={subtitle} />
			<BoxElementInputSimple label="Background color" element={containerDiv} />
			<Divider title="Testimonials" />
			<DndTabs
				containerElement={gridContainer}
				insertElement={() =>
					createBioWithImage({
						image: profile4Url,
						name: 'Alex Smith',
						description:
							' Vitae suscipit tellus mauris a diam maecenas sed enim ut. Mauris augue neque gravida in fermentum.',
						title: 'Co-Founder & CTO',
					})
				}
				renderItemOptions={(item) => <ItemOptions item={item} />}
			/>
		</OptionsWrapper>
	)
}

function ItemOptions({ item }: { item: Element }) {
	const image = item.children![0] as ImageElement
	const name = item.children![1] as TextElement
	const title = item.children![2] as TextElement
	const description = item.children![3] as TextElement

	return (
		<OptionsWrapper>
			<ImageElementInput element={image} />
			<TextElementInput label="Name" element={name} />
			<TextElementInput label="Title" element={title} />
			<TextElementInput label="Description" element={description} />
		</OptionsWrapper>
	)
}

// =============  defaultData =============

const wrapperDiv = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			textAlign: 'center',
			paddingLeft: '10%',
			paddingRight: '10%',
			paddingTop: '50px',
		},
	}
	draft.style.tablet = {
		default: {
			paddingLeft: '5%',
			paddingRight: '5%',
		},
	}
	draft.style.mobile = {
		default: {
			paddingLeft: '0%',
			paddingRight: '0%',
		},
	}
}).serialize()
const gridWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr',
			paddingLeft: '5%',
			paddingRight: '5%',
			paddingTop: '50px',
		},
	}

	draft.style.tablet = {
		default: {
			paddingLeft: '0%',
			paddingRight: '0%',
		},
	}

	draft.style.mobile = {
		default: {
			gridTemplateColumns: '1fr',
		},
	}
}).serialize()

const teamDetails = [
	{
		name: 'Bob Roberts',
		title: 'CO-founder & CEO',
		description:
			' Vitae suscipit tellus mauris a diam maecenas sed enim ut. Mauris augue neque gravida in fermentum.',
		image: profile1Url,
	},
	{
		name: 'Celia Almeda',
		title: 'Sales Manager',
		description:
			'Pharetra vel turpis nunc eget lorem. Quisque id diam vel quam elementum pulvinar etiam.',
		image: profile2Url,
	},
	{
		name: 'Jack Smith',
		title: 'Chief Accountant',
		description:
			'Mauris augue neque gravida in fermentum. Praesent semper feugiat nibh sed pulvinar proin.',
		image: profile3Url,
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
			maxWidth: '60%',
			marginLeft: 'auto',
			marginRight: 'auto',
		},
	}
	draft.style.tablet = {
		default: {
			fontSize: '18px',
			maxWidth: '100%',
		},
	}
	draft.data.text = Expression.fromString(
		'we place huge value on strong relationships and have seen the benefits they bring to our business. Customers feedback is vital in helping us to get it right'
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
				gap: '5',
				textAlign: 'center',
			},
		}
		draft.style.tablet = {
			default: {
				gap: '5',
			},
		}

		const imageElement = produce(new ImageElement(), (draft) => {
			draft.style.desktop = {
				default: {
					maxWidth: '100px',
					height: 'auto',
					borderRadius: '50%',
				},
			}
			draft.data.src = Expression.fromString(image)
		})
		const nameText = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					fontSize: '16px',
					marginTop: '10px',
				},
			}
			draft.style.tablet = {
				default: {
					fontSize: '14px',
				},
			}
			draft.data.text = Expression.fromString(name)
		})
		const titleText = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					fontSize: '22px',
				},
			}
			draft.style.tablet = {
				default: {
					fontSize: '18px',
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
			components: teamDetails.map((teamDetail) => createBioWithImage(teamDetail).serialize()),
		},
	],
}
