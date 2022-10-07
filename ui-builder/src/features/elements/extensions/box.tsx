import { ReactNode } from 'react'
import { TbSquare } from 'react-icons/tb'
import { BackgroundsEditor } from '../../style/background-editor'
import { BordersEditor } from '../../style/border-editor'
import { SimpleShadowsEditor } from '../../style/shadows-editor'
import { SizeEditor } from '../../style/size-editor'
import { SpacingEditor } from '../../style/spacing-editor'
import { Element, RenderFn } from '../element'
import { Style } from '../style'

export class BoxElement extends Element {
	name = 'Box'
	icon = (<TbSquare />)
	children: Element[] = []
	style: Style = {
		desktop: {
			default: { minHeight: '150px' },
		},
	}

	render(renderFn: RenderFn): ReactNode {
		return renderFn(this)
	}

	renderOptions(): ReactNode {
		return (
			<div className="space-y-6">
				<BackgroundsEditor simple />
				<SizeEditor simple />
				<SpacingEditor />
				<BordersEditor />
				<SimpleShadowsEditor />
			</div>
		)
	}
}
