import produce from 'immer'
import _ from 'lodash'
import { ReactNode } from 'react'
import { TbLayoutNavbar } from 'react-icons/tb'
import { Element, RenderFn } from '../../element'
import { Style } from '../../style'
import { BoxElement } from '../box'
import { MenuButtonElement } from './menu-button'
import { NavMenuElement } from './nav-menu'

export class NavbarElement extends Element {
	name = 'Navbar'
	icon = (<TbLayoutNavbar />)
	children: Element[] = [
		produce(new BoxElement(), (draft) => {
			_.set(draft, 'style.desktop.default.width', '100px')
			_.set(draft, 'style.desktop.default.height', '100px')
		}),
		new NavMenuElement(),
		new MenuButtonElement(),
	]
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

	render(renderFn: RenderFn): ReactNode {
		return renderFn(this)
	}

	renderOptions(): ReactNode {
		return <div className="text-center">This element have no options</div>
	}
}
