import { TextInput } from '@mantine/core'
import { ReactNode } from 'react'
import { TbSquare } from 'react-icons/tb'
import { BackgroundsEditor } from '../../style/background-editor'
import { BordersEditor } from '../../style/border-editor'
import { SimpleShadowsEditor } from '../../style/simple-shadows-editor'
import { SizeEditor } from '../../style/size-editor'
import { SpacingEditor } from '../../style/spacing-editor'
import { Element, RenderFn, RenderOptions } from '../element'
import { useSetElement } from '../elements-store'
import { Style } from '../style'

export class BoxElement extends Element {
	name = 'Box'
	icon = (<TbSquare />)
	children: Element[] = []
	style: Style = { desktop: { default: { minHeight: '150px' } } }
	data = { as: 'div' }

	render(renderFn: RenderFn): ReactNode {
		return renderFn(this)
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
