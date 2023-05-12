import { ReactNode } from 'react'
import imageUrl from '../../assets/components/Individual-team-member.png'
import { deserializeElement } from '../../utils/deserialize'
import { box, img, txt } from '../elements/constructor'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { fontSizes } from '../simple/font-sizes'
import { color } from '../simple/palette'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Component, ElementOptions } from './component'
import { SimpleComponentOptionsProps } from './helpers'
import { ComponentWrapper } from './helpers/component-wrapper'

export class TeamIndividualMember extends Component {
	name = 'Individual team member - 1 '
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <TeamIndividualMemberOptions options={options} />
	}
}

const tagIds = {
	name: 'name',
	position: 'position',
	description: 'description',
	image: 'image',
}

// =============  renderOptions =============

function TeamIndividualMemberOptions({ options }: SimpleComponentOptionsProps) {
	const component = useSelectedElement<BoxElement>()!
	const name = component.find<TextElement>(tagIds.name)!
	const position = component.find<TextElement>(tagIds.position)!
	const description = component.find<TextElement>(tagIds.description)!
	const image = component.find<ImageElement>(tagIds.image)!

	return (
		<ComponentWrapper
			name="Individual team member"
			stylers={['backgrounds', 'spacing', 'background-image']}
		>
			<ImageStyler element={image} />
			<TextStyler label="Name" element={name} />
			<TextStyler label="Position" element={position} />
			<TextStyler label="Description" element={description} />
		</ComponentWrapper>
	)
}

// =============  defaultData =============

const frame = box([])
	.css({
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		paddingLeft: '15%',
		paddingRight: '15%',
		paddingTop: '5%',
		paddingBottom: '5%',
		rowGap: '30px',
	})
	.cssTablet({
		paddingLeft: '10%',
		paddingRight: '10%',
		rowGap: '20px',
	})
	.cssMobile({
		paddingLeft: '5%',
		paddingRight: '5%',
		rowGap: '10px',
	})
	.serialize()

const wrapper = box([])
	.css({
		display: 'grid',
		gridTemplateColumns: '1fr 4fr',
		columnGap: '30px',
	})
	.cssMobile({
		gridTemplateColumns: '1fr',
	})
	.serialize()

const image = img('https://files.dotenx.com/assets/profile-large-349.jpeg')
	.css({
		maxHeight: '200px',
		width: '100%',
		borderRadius: '5px',
	})
	.cssTablet({
		maxHeight: 'auto',
	})
	.tag(tagIds.image)
	.serialize()

const details = box([
	txt('John Doe')
		.tag(tagIds.name)
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
		}),
	txt('CEO & founder')
		.tag(tagIds.position)
		.css({
			fontSize: fontSizes.h4.desktop,
			color: color('secondary'),
			marginBottom: '10px',
		})
		.cssTablet({
			fontSize: fontSizes.h4.tablet,
			marginBottom: '8px',
		})
		.cssMobile({
			fontSize: fontSizes.h4.mobile,
			marginBottom: '5px',
		}),
	txt(
		`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc vel ultricies ultricies, nunc nisl aliquam lorem, nec ultricies nisl lorem vel dolor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc vel ultricies ultricies, nunc nisl aliquam lorem, nec ultricies nisl lorem vel dolor.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc vel ultricies ultricies, nunc nisl aliquam lorem, nec ultricies nisl lorem vel dolor.Lorem ipsum dolor sit amet.`
	)
		.tag(tagIds.description)
		.css({
			fontSize: fontSizes.normal.desktop,
			color: color('text'),
			textAlign: 'justify',
		})
		.cssTablet({
			fontSize: fontSizes.normal.tablet,
		})
		.cssMobile({
			fontSize: fontSizes.normal.mobile,
		}),
])
	.css({
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
	})
	.serialize()

const defaultData = {
	...frame,
	components: [
		{
			...wrapper,
			components: [image, details],
		},
	],
}
