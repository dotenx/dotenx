import { TextInput } from '@mantine/core'
import { ReactNode } from 'react'
import { TbSquare } from 'react-icons/tb'
import { AddElementButton } from '../../simple/simple-canvas'
import { BackgroundsEditor } from '../../style/background-editor'
import { BordersEditor } from '../../style/border-editor'
import { SimpleShadowsEditor } from '../../style/simple-shadows-editor'
import { SizeEditor } from '../../style/size-editor'
import { SpacingEditor } from '../../style/spacing-editor'
import { Element, RenderFn, RenderFnOptions, RenderOptions } from '../element'
import { useSetElement } from '../elements-store'

export class BoxElement extends Element {
	name = 'Box'
	icon = (<TbSquare />)
	children: Element[] = []
	data = { as: 'div' }

	render(renderFn: RenderFn, options: RenderFnOptions): ReactNode {
		if (!options.isSimple || this.children.length !== 0) return renderFn(this)

		if (this.children.length === 0)
			return (
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: 'rgba(0,0,0,0.05)',
						padding: '10px',
					}}
				>
					<AddElementButton insert={{ where: this.id, placement: 'initial' }} />
				</div>
			)
	}
	renderOptions(options: RenderOptions): ReactNode {
		return <BoxOptions element={this} />
	}
}

function BoxOptions({ element }: { element: BoxElement }) {
	const set = useSetElement()
	return (
		<div className="space-y-6">
			<TextInput
				size="xs"
				label="As HTML element"
				value={element.data.as}
				onChange={(event) => set(element, (draft) => (draft.data.as = event.target.value))}
			/>
			<BackgroundsEditor simple />
			<SizeEditor simple />
			<SpacingEditor />
			<BordersEditor />
			<SimpleShadowsEditor />
		</div>
	)
}
