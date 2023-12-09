import { produce } from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/customers-users.png'
import { deserializeElement } from '../../utils/deserialize'
import { box, img, txt } from '../elements/constructor'
import { BoxElement } from '../elements/extensions/box'
import { ColumnsElement } from '../elements/extensions/columns'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { BoxStylerSimple } from '../simple/stylers/box-styler'
import { ColumnsStyler } from '../simple/stylers/columns-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { inteliText } from '../ui/intelinput'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'

export class CustomersUserProfiles extends Component {
	name = 'Customers user profiles'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <CustomersUserProfilesOptions />
	}
}

// =============  renderOptions =============

function CustomersUserProfilesOptions() {
	const component = useSelectedElement<BoxElement>()!
	const line1 = component.find<TextElement>(tagIds.line1)!
	const line2 = component.find<TextElement>(tagIds.line2)!
	const imageWrapper = component.find<ColumnsElement>(tagIds.imageWrapper)!

	return (
		<ComponentWrapper name="Customers user profiles">
			<TextStyler label="Title" element={line1} />
			<TextStyler label="Subtitle" element={line2} />
			<DndTabs
				containerElement={imageWrapper}
				renderItemOptions={(item) => <ImageStyler element={item as ImageElement} />}
				insertElement={() =>
					createProfile('https://files.dotenx.com/assets/profile2-ba1.jpeg')
				}
			/>
		</ComponentWrapper>
	)
}

const tagIds = {
	imageWrapper: 'imageWrapper',
	line1: 'line1',
	line2: 'line2',
}

// =============  defaultData =============

const createProfile = (src: string) =>
	img(src)
		.css({
			width: '50px',
			height: '50px',
			borderRadius: '50%',
			marginRight: '-20px',
			boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
		})
		.cssTablet({
			width: '40px',
			height: '40px',
			marginRight: '-15px',
		})
		.cssMobile({
			width: '30px',
			height: '30px',
			marginRight: '-10px',
		})

const profiles = [
	createProfile('https://files.dotenx.com/assets/profile2-ba1.jpeg'),
	createProfile('https://files.dotenx.com/assets/profile1-v13.jpeg'),
	createProfile('https://files.dotenx.com/assets/profile4-k38.jpeg'),
	createProfile('https://files.dotenx.com/assets/profile3-i34.jpeg'),
	createProfile('https://files.dotenx.com/assets/profile3-i34.jpeg'),
	createProfile('https://files.dotenx.com/assets/profile3-i34.jpeg'),
]

const defaultData = box([
	box([
		box(profiles).tag(tagIds.imageWrapper).css({
			display: 'flex',
			marginBottom: '10px',
		}),
		txt('100s of users are already using our platform to get the best out of their business.')
			.tag(tagIds.line1)
			.css({
				fontSize: '16px',
				fontWeight: 'bold',
				textAlign: 'center',
			})
			.cssTablet({
				fontSize: '14px',
			})
			.cssMobile({
				fontSize: '12px',
			}),
		txt('Join them and start your journey to success.')
			.tag(tagIds.line2)
			.css({
				fontSize: '16px',
				color: '#6B7280',
				textAlign: 'center',
			})
			.cssTablet({
				fontSize: '14px',
			})
			.cssMobile({
				fontSize: '12px',
			}),
	]).css({
		display: 'flex',
		flexDirection: 'column',
		gap: '5px',
		alignItems: 'center',
	}),
])
	.css({
		display: 'flex',
		paddingLeft: '15%',
		paddingRight: '15%',
		paddingTop: '50px',
		paddingBottom: '50px',
		alignItems: 'center',
		justifyContent: 'center',
	})
	.cssTablet({
		paddingLeft: '10%',
		paddingRight: '10%',
	})
	.cssMobile({
		paddingLeft: '5%',
		paddingRight: '5%',
	})
	.serialize()
