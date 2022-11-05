import { ReactNode } from 'react'
import { TbMenu } from 'react-icons/tb'
import { Element, RenderFn } from '../../element'
import { Style } from '../../style'
import { navLink } from '../../utils'

export class NavMenuElement extends Element {
	name = 'NavMenu'
	icon = (<TbMenu />)
	children: Element[] = [navLink(), navLink(), navLink()]
	style: Style = {
		desktop: {
			default: {
				display: 'flex',
			},
		},
		tablet: {
			default: {
				display: 'none',
				position: 'absolute',
				top: '100%',
				backgroundColor: '#eeeeee',
				left: 0,
				right: 0,
				zIndex: 100,
				flexDirection: 'column',
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
