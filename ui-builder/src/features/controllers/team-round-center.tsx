import produce from 'immer'
import { ReactNode, useMemo } from 'react'
import imageUrl from '../../assets/components/team-round-center.png'
import profile1Url from '../../assets/components/profile1.jpg'
import profile2Url from '../../assets/components/profile2.jpg'
import profile3Url from '../../assets/components/profile3.jpg'
import profile4Url from '../../assets/components/profile4.jpg'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { Controller, ElementOptions } from './controller'
import { SimpleComponentOptionsProps } from './helpers'

import Bio from './basic-components/bio'
import { ImageDrop } from '../ui/image-drop'
import { DraggableTab, DraggableTabs } from './helpers/draggable-tabs'

export class TeamRoundCenter extends Controller {
	name = 'Team with round profiles centered'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <TeamRoundCenterOptions options={options} />
	}
}

// =============  renderOptions =============

function TeamRoundCenterOptions({ options }: SimpleComponentOptionsProps) {
	const containerDiv = options.element as BoxElement

	const tabsList: DraggableTab[] = useMemo(() => {
		return containerDiv.children.map((column, index) => {
			const image = column.children![0] as ImageElement
			const bioRoot = column.children![1] as BoxElement
			return {
				id: column.id,
				content: (
					<div className="flex flex-col justify-stretch gap-y-4 pt-4">
						<ImageDrop
							src={image.data.src}
							onChange={(value) =>
								options.set(
									produce(image, (draft) => {
										draft.data.src = value
									})
								)
							}
						/>
						{Bio.getOptions({ set: options.set, root: bioRoot })}
					</div>
				),
				onTabDelete: () => {
					options.set(
						produce(containerDiv, (draft) => {
							draft.children.splice(index, 1)
						})
					)
				},
			}
		})
	}, [containerDiv.children, options.set])

	return (
		<div className="space-y-6">
			{/* todo: add this after it's fixed */}
			{/* <GridColumnSlider
				set={options.set}
				containerDiv={containerDiv}
				columnLimit={{
					desktop: { min: 2, max: 4 },
					tablet: { min: 2, max: 3 },
					mobile: { min: 1, max: 2 },
				}}
			/> */}
			<DraggableTabs
				onDragEnd={(event) => {
					const { active, over } = event
					if (active.id !== over?.id) {
						const oldIndex = tabsList.findIndex((tab) => tab.id === active?.id)
						const newIndex = tabsList.findIndex((tab) => tab.id === over?.id)
						options.set(
							produce(containerDiv, (draft) => {
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
						description: 'All rounder no-code developer with 10+ years of experience',
					})
					options.set(
						produce(containerDiv, (draft) => {
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
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr',
			paddingLeft: '10%',
			paddingRight: '10%',
		},
	}
}).serialize()

const teamDetails = [
	{
		name: 'John Doe',
		description:
			'Professional Photographer with 10 years of experience, specialized in wedding photography.',
		image: profile1Url,
	},
	{
		name: 'Jane Doe',
		description: 'Master of Arts in Graphic Design, with 5 years of experience in the field.',
		image: profile2Url,
	},
	{
		name: 'Jack Smith',
		description:
			'Managing Director of a large company, with 15 years of experience in the field.',
		image: profile3Url,
	},
]

const createBioWithImage = ({
	name,
	description,
	image,
}: {
	name: string
	description: string
	image: string
}) =>
	produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				paddingLeft: '10%',
				paddingRight: '10%',
				paddingTop: '20px',
				paddingBottom: '20px',
				gap: '10px',
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
			draft.data.src = image
		})

		draft.children = [imageElement, Bio.getComponent(name, description, 'center')]
	})

const defaultData = {
	...wrapperDiv,
	components: teamDetails.map((teamDetail) => createBioWithImage(teamDetail).serialize()),
}
