import { TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode } from 'react'
import { TbSquareCheck } from 'react-icons/tb'
import { BackgroundsEditor } from '../../style/background-editor'
import { BordersEditor } from '../../style/border-editor'
import { ShadowsEditor } from '../../style/shadow-editor'
import { SizeEditor } from '../../style/size-editor'
import { SpacingEditor } from '../../style/spacing-editor'
import { Element, RenderOptions } from '../element'
import { Style } from '../style'

export class SubmitElement extends Element {
	name = 'Submit'
	icon = (<TbSquareCheck />)
	style: Style = {
		desktop: {
			default: {
				backgroundColor: '#3b82f6',
				color: 'white',
				border: '0',
				paddingTop: '10px',
				paddingBottom: '10px',
				paddingLeft: '20px',
				paddingRight: '20px',
				display: 'inline-block',
				textAlign: 'center',
				fontWeight: 600,
				cursor: 'pointer',
			},
		},
	}
	data = { text: 'Submit' }

	render(): ReactNode {
		return <>{this.data.text}</>
	}

	renderPreview() {
		return (
			<button className={this.generateClasses()} type="submit">
				{this.data.text}
			</button>
		)
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return (
			<div className="space-y-6">
				<TextInput
					label="Text"
					size="xs"
					value={this.data.text}
					onChange={(event) =>
						set(
							produce(this, (draft) => {
								draft.data.text = event.target.value
							})
						)
					}
				/>
				<BackgroundsEditor simple />
				<SizeEditor simple />
				<SpacingEditor />
				<BordersEditor />
				<ShadowsEditor />
			</div>
		)
	}

	txt(text: string) {
		this.data.text = text
		return this
	}
}
