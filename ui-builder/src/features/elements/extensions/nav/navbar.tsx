import produce from 'immer'
import _ from 'lodash'
import { ReactNode } from 'react'
import { TbLayoutNavbar } from 'react-icons/tb'
import { SimpleShadowsEditor } from '../../../style/simple-shadows-editor'
import { Element, RenderFn } from '../../element'
import { Style } from '../../style'
import { BoxElement } from '../box'
import { MenuButtonElement } from './menu-button'
import { NavMenuElement } from './nav-menu'

export class NavbarElement extends Element {
	name = 'Navbar'
	icon = (<TbLayoutNavbar />)
	children: Element[] = this.getChildren()
	style: Style = {
		desktop: {
			default: {
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				position: 'relative',
			},
		},
	}

	private getChildren(): Element[] {
		const navMenu = new NavMenuElement()

		return [
			produce(new BoxElement(), (draft) => {
				_.set(draft, 'style.desktop.default.minWidth', '100px')
				_.set(draft, 'style.desktop.default.minHeight', '60px')
			}),
			navMenu,
			produce(new MenuButtonElement(), (draft) => {
				draft.data.menuId = navMenu.id
			}),
		]
	}

	render(renderFn: RenderFn): ReactNode {
		return renderFn(this)
	}

	renderOptions(): ReactNode {
		return (
			<div>
				<SimpleShadowsEditor />
			</div>
		)
	}
}
