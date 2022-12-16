import produce from 'immer'
import { ReactNode, useMemo } from 'react'
import profile1Url from '../../assets/components/profile1.jpg'
import profile2Url from '../../assets/components/profile2.jpg'
import profile3Url from '../../assets/components/profile3.jpg'
import profile4Url from '../../assets/components/profile4.jpg'
import imageUrl from '../../assets/components/testimonial-simple.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { Controller, ElementOptions } from './controller'
import { ComponentName, Divider, SimpleComponentOptionsProps } from './helpers'

import { Expression } from '../states/expression'
import { ImageDrop } from '../ui/image-drop'
import ColorOptions from './basic-components/color-options'
import { DraggableTab, DraggableTabs } from './helpers/draggable-tabs'
import { TextElement } from '../elements/extensions/text'
import { Intelinput, inteliText } from '../ui/intelinput'

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
	const subTite = containerDiv.children?.[1] as TextElement
	const gridContainer = containerDiv.children?.[2] as BoxElement
	const tabsList: DraggableTab[] = useMemo(() => {
		return gridContainer.children.map((column, index) => {
			const image = column.children![0] as ImageElement
			const name = column.children![1] as TextElement
			const title = column.children![2] as TextElement
			const description = column.children![3] as TextElement

			return {
				id: column.id,
				content: (
					<div className="flex flex-col justify-stretch gap-y-4 pt-4">
						<ImageDrop
							src={image.data.src.toString()}
							onChange={(value) =>
								options.set(
									produce(image, (draft) => {
										draft.data.src = Expression.fromString(value)
									})
								)
							}
						/>
						<div className="p-3 rounded border">
							<Intelinput
								label="Name"
								name="Name"
								size="xs"
								value={name.data.text}
								onChange={(value) =>
									options.set(
										produce(name, (draft) => {
											draft.data.text = value
										})
									)
								}
							/>
							{ColorOptions.getTextColorOption({
								options,
								wrapperDiv: name,
								title: '',
							})}
						</div>
						<div className="p-3 rounded border">
							<Intelinput
								label="Title"
								name="Title"
								size="xs"
								value={title.data.text}
								onChange={(value) =>
									options.set(
										produce(title, (draft) => {
											draft.data.text = value
										})
									)
								}
							/>
							{ColorOptions.getTextColorOption({
								options,
								wrapperDiv: title,
								title: '',
							})}
						</div>
						<div className="p-3 rounded border">
							<Intelinput
								label="Description"
								name="Description"
								size="xs"
								value={description.data.text}
								onChange={(value) =>
									options.set(
										produce(description, (draft) => {
											draft.data.text = value
										})
									)
								}
							/>
							{ColorOptions.getTextColorOption({
								options,
								wrapperDiv: description,
								title: '',
							})}
						</div>
					</div>
				),
				onTabDelete: () => {
					options.set(
						produce(gridContainer, (draft) => {
							draft.children.splice(index, 1)
						})
					)
				},
			}
		})
	}, [gridContainer.children, options.set])
	return (
		<div className="space-y-6">
			<ComponentName name="Simple testimonial" />
			<div className="p-3 rounded border">
				<Intelinput
					label="Title"
					name="Title"
					size="xs"
					value={title.data.text}
					onChange={(value) =>
						options.set(
							produce(title, (draft) => {
								draft.data.text = value
							})
						)
					}
				/>
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: title,
					title: '',
				})}
			</div>
			<div className="p-3 rounded border">
				<Intelinput
					label="SubTite"
					name="SubTite"
					size="xs"
					value={subTite.data.text}
					onChange={(value) =>
						options.set(
							produce(subTite, (draft) => {
								draft.data.text = value
							})
						)
					}
				/>
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: subTite,
					title: '',
				})}
			</div>
			{ColorOptions.getBackgroundOption({
				options,
				wrapperDiv: containerDiv,
			})}
			<Divider title="Testimonials"></Divider>
			<DraggableTabs
				onDragEnd={(event) => {
					const { active, over } = event
					if (active.id !== over?.id) {
						const oldIndex = tabsList.findIndex((tab) => tab.id === active?.id)
						const newIndex = tabsList.findIndex((tab) => tab.id === over?.id)
						options.set(
							produce(gridContainer, (draft) => {
								const [removed] = draft.children.splice(oldIndex, 1)
								draft.children.splice(newIndex, 0, removed)
							})
						)
					}
				}}
				onAddNewTab={() => {
					const newItem = createBioWithImage({
						image: profile4Url,
						name: 'Alex Smith',
						description:
							' Vitae suscipit tellus mauris a diam maecenas sed enim ut. Mauris augue neque gravida in fermentum.',
						title: 'Co-Founder & CTO',
					})
					options.set(
						produce(gridContainer, (draft) => {
							draft.children.push(newItem)
						})
					)
				}}
				tabs={tabsList}
			/>
		</div>
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
	draft.data.text = inteliText('What Clients Say')
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
	draft.data.text = inteliText(
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
			draft.data.text = inteliText(name)
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
			draft.data.text = inteliText(title)
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
			draft.data.text = inteliText(description)
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
