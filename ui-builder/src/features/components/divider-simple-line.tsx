import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/divider-simple-line.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { DividerElement } from '../elements/extensions/divider'
import { useSelectedElement } from '../selection/use-selected-component'
import { BoxStylerSimple } from '../simple/stylers/box-styler'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { InputWithUnit } from '../ui/style-input'
import { useEditStyle } from '../style/use-edit-style'

export class DividerSimpleLine extends Component {
	name = 'Simple line divider'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <DividerSimpleLineOptions />
	}
}

// =============  renderOptions =============

function DividerSimpleLineOptions() {
	const component = useSelectedElement<BoxElement>()!
	const divider = component.children[0] as DividerElement
	const { style, editStyle } = useEditStyle(divider)

	return (
		<ComponentWrapper name="Simple line divider">
			<InputWithUnit
				value={style.height?.toString()}
				onChange={(value) => editStyle('height', value)}
				label="Thickness"
			/>
			<InputWithUnit
				value={style.width?.toString()}
				onChange={(value) => editStyle('width', value)}
				label="Length"
			/>
			<BoxStylerSimple label="Color" element={divider} />
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
			paddingTop: '5%',
			paddingBottom: '5%',
			paddingLeft: '15%',
			paddingRight: '15%',
			width: '100%',
		},
	}
	const element = produce(new DividerElement(), (draft) => {
		draft.style.desktop = {
			default: {
				backgroundColor: '#0d0d0d',
				height: '2px',
				width: '60%',
			},
		}
	})

	draft.children = [element]
}).serialize()
