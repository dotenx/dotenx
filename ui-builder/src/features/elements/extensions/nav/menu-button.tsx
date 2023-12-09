import { produce } from 'immer'
import _ from 'lodash'
import { ReactNode } from 'react'
import { TbMenu2 } from 'react-icons/tb'
import { BackgroundsEditor } from '../../../style/background-editor'
import { BordersEditor } from '../../../style/border-editor'
import { ShadowsEditor } from '../../../style/shadow-editor'
import { SizeEditor } from '../../../style/size-editor'
import { SpacingEditor } from '../../../style/spacing-editor'
import { Element, RenderFn, RenderOptions } from '../../element'
import { findElement, useElementsStore } from '../../elements-store'
import { Style } from '../../style'
import { IconElement } from '../icon'

export class MenuButtonElement extends Element {
	name = 'MenuButton'
	icon = (<TbMenu2 />)
	style: Style = {
		desktop: {
			default: {
				display: 'none',
				paddingTop: '20px',
				paddingLeft: '20px',
				paddingRight: '20px',
				paddingBottom: '20px',
			},
		},
		tablet: { default: { display: 'flex' } },
	}
	data = { menuId: '' }
	children: Element[] = menuIcon()

	render(renderFn: RenderFn): ReactNode {
		return <MenuButtonRender element={this}>{renderFn(this)}</MenuButtonRender>
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return (
			<div className="space-y-6">
				<BackgroundsEditor simple />
				<SizeEditor simple />
				<SpacingEditor />
				<BordersEditor />
				<ShadowsEditor />
			</div>
		)
	}
}

function menuIcon() {
	const icon = produce(new IconElement(), (draft) => {
		draft.data.type = 'fas'
		draft.data.name = 'bars'
		_.set(draft, 'style.desktop.default.color', '#333333')
		_.set(draft, 'style.desktop.default.height', '20px')
		_.set(draft, 'style.desktop.default.width', '20px')
	})
	return [icon]
}

function MenuButtonRender({
	element,
	children,
}: {
	element: MenuButtonElement
	children: ReactNode
}) {
	const { elements, set } = useElementsStore((store) => ({
		elements: store.elements,
		set: store.set,
	}))
	const handleClick = () => {
		const navMenu = findElement(element.data.menuId, elements)
		if (!navMenu) return
		const newDisplay = navMenu.style.tablet?.default?.display === 'flex' ? 'none' : 'flex'
		set(
			produce(navMenu, (draft) => {
				_.set(draft, 'style.tablet.default.display', newDisplay)
			})
		)
	}

	return (
		<button style={{ border: 'none', backgroundColor: 'inherit' }} onClick={handleClick}>
			{children}
		</button>
	)
}
