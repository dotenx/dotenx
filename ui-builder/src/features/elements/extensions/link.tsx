import { Switch } from '@mantine/core'
import { ReactNode } from 'react'
import { TbLink } from 'react-icons/tb'
import { Expression } from '../../states/expression'
import { useGetStates } from '../../states/use-get-states'
import { Intelinput } from '../../ui/intelinput'
import { Element, RenderFn, RenderOptions } from '../element'
import { useSetElement } from '../elements-store'
import { Style } from '../style'

export class LinkElement extends Element {
	name = 'Link'
	icon = (<TbLink />)
	public children: Element[] = []
	data = { href: new Expression(), openInNewTab: false }
	style: Style = {
		desktop: {
			default: {
				minHeight: '100px',
				textDecoration: 'none',
				color: '#000000',
			},
		},
	}

	render(renderFn: RenderFn): ReactNode {
		return renderFn(this)
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return <LinkOptions element={this} />
	}
}

function LinkOptions({ element }: { element: LinkElement }) {
	const set = useSetElement()
	const states = useGetStates()

	return (
		<div className="space-y-6">
			<Intelinput
				size="xs"
				label="Link URL"
				options={states.map((state) => state.name)}
				value={element.data.href}
				onChange={(value) => set(element, (draft) => (draft.data.href = value))}
			/>
			<Switch
				size="xs"
				label="Open in new tab"
				checked={element.data.openInNewTab}
				onChange={(event) =>
					set(element, (draft) => (draft.data.openInNewTab = event.currentTarget.checked))
				}
			/>
		</div>
	)
}
