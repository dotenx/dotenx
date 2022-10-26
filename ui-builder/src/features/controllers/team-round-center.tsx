import { Button, Select, SelectItem, Slider, Textarea, TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode, useMemo, useState } from 'react'
import imageUrl from '../../assets/components/team-round-center.png'
import profile1Url from '../../assets/components/profile1.jpg'
import profile2Url from '../../assets/components/profile2.jpg'
import profile3Url from '../../assets/components/profile3.jpg'
import profile4Url from '../../assets/components/profile4.jpg'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { ImageElement } from '../elements/extensions/image'
import { Controller, ElementOptions } from './controller'
import { SimpleComponentOptionsProps } from './helpers'

import Bio from './basic-components/bio'
import TabsOptions from './helpers/tabs-options'
import { ImageDrop } from '../ui/image-drop'
import GridColumnSlider  from './helpers/grid-column-slider'

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

	const tabsList = useMemo(() => {
		return containerDiv.children.map((column, index) => {
			const image = column.children![0] as ImageElement
			const bioRoot = column.children![1] as BoxElement
			return {
				title: index + 1 + '',
				content: (
					<div className="flex flex-col justify-stretch gap-y-4">
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
			<TabsOptions
				set={options.set}
				containerDiv={containerDiv}
				tabs={tabsList}
				addNewTab={() => {
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
			marginLeft: '10%',
			marginRight: '10%',
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

		draft.children = [imageElement, new Bio().getComponent(name, description)]
	})

const defaultData = {
	...wrapperDiv,
	components: teamDetails.map((teamDetail) => createBioWithImage(teamDetail).serialize()),
}
