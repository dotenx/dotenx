import { ReactNode } from 'react'
import { TbMinus } from 'react-icons/tb'
import { BackgroundsEditor } from '../../style/background-editor'
import { useEditStyle } from '../../style/use-edit-style'
import { InputWithUnit } from '../../ui/style-input'
import { Element } from '../element'
import { Style } from '../style'

export class DividerElement extends Element {
	name = 'Divider'
	icon = (<TbMinus />)
	style: Style = {
		desktop: {
			default: {
				marginTop: '10px',
				marginBottom: '10px',
				height: '1px',
				backgroundColor: '#999999',
			},
		},
	}

	render(): ReactNode {
		return <></>
	}

	renderOptions(): ReactNode {
		return (
			<div className="space-y-6">
				<DividerThickness />
				<BackgroundsEditor simple />
			</div>
		)
	}
}

function DividerThickness() {
	const { style, editStyle } = useEditStyle()

	return (
		<InputWithUnit
			value={style.height?.toString()}
			onChange={(value) => editStyle('height', value)}
			label="Thickness"
		/>
	)
}
