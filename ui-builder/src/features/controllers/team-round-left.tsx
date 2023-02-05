import produce from 'immer'
import { ReactNode } from 'react'
import profile1Url from '../../assets/components/profile1.jpg'
import profile2Url from '../../assets/components/profile2.jpg'
import profile3Url from '../../assets/components/profile3.jpg'
import profile4Url from '../../assets/components/profile4.jpg'
import imageUrl from '../../assets/components/team-round-left.png'
import { deserializeElement } from '../../utils/deserialize'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { ImageStyler } from '../simple/stylers/image-styler'
import { Expression } from '../states/expression'
import Bio from './basic-components/bio'
import { Controller, ElementOptions } from './controller'
import { ComponentName, SimpleComponentOptionsProps } from './helpers'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class TeamRoundLeft extends Controller {
	name = 'Team with round profile image on left'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <TeamRoundLeftOptions options={options} />
	}
}

// =============  renderOptions =============

function TeamRoundLeftOptions({ options }: SimpleComponentOptionsProps) {
	const containerDiv = options.element as BoxElement

	return (
		<OptionsWrapper>
			<ComponentName name="Team with round profile image on left" />
			<DndTabs
				containerElement={containerDiv}
				insertElement={() =>
					createBioWithImage({
						image: profile4Url,
						name: 'Alex Smith',
						description: 'All rounder no-code developer with 10+ years of experience',
					})
				}
				renderItemOptions={(item) => <ItemOptions item={item} options={options} />}
			/>
		</OptionsWrapper>
	)
}

function ItemOptions({ item, options }: { item: Element; options: ElementOptions }) {
	const image = item.children![0] as ImageElement
	const bioRoot = item.children![1] as BoxElement

	return (
		<OptionsWrapper>
			<ImageStyler element={image} />
			{Bio.getOptions({ set: options.set, root: bioRoot })}
		</OptionsWrapper>
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
				alignItems: 'flex-start',
				justifyContent: 'center',
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
			draft.data.src = Expression.fromString(image)
		})

		draft.children = [imageElement, Bio.getComponent(name, description, 'left')]
	})

const defaultData = {
	...wrapperDiv,
	components: teamDetails.map((teamDetail) => createBioWithImage(teamDetail).serialize()),
}
