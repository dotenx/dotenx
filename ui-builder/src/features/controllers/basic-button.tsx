import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/basic-button.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { ButtonElement } from '../elements/extensions/button'
import { useSelectedElement } from '../selection/use-selected-component'
import { ButtonStyler } from '../simple/stylers/button-styler'
import { Controller, ElementOptions } from './controller'
import { ComponentWrapper } from './helpers/component-wrapper'

export class BasicButton extends Controller {
	name = 'Button'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <BasicButtonOptions />
	}
}

// =============  renderOptions =============

function BasicButtonOptions() {
	const component = useSelectedElement<BoxElement>()!
	const button = component.children[0] as ButtonElement

	return (
		<ComponentWrapper name="Image">
			<ButtonStyler label="Button" element={button} />
		</ComponentWrapper>
	)
}

// =============  defaultData =============

const defaultData = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
		},
	}
	const element = produce(new ButtonElement(), (draft) => {
		draft.data.text = 'Your Button'

		draft.style.desktop = {
			default: {
				backgroundColor: 'hsla(210, 0%, 0%, 1)',
				color: 'hsla(0, 0%, 100%, 1)',
				borderRadius: '10px',
				paddingLeft: '20px',
				paddingRight: '20px',
				paddingTop: '8px',
				paddingBottom: '8px',
			},
			hover: {
				backgroundColor: 'hsla(100, 0%, 39%, 1)',
			}
		}

		draft.style.tablet = {
			default: {
				paddingLeft: '15px',
				paddingRight: '15px',
				paddingTop: '5px',
				paddingBottom: '5px',
			}
		}

		draft.style.mobile = {
			default: {
				paddingLeft: '10px',
				paddingRight: '10px',
				paddingTop: '3px',
				paddingBottom: '3px',
			}
		}
	})

	draft.children = [element]

}).serialize()

