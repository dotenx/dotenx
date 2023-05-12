import _ from 'lodash'
import imageUrl from '../../../assets/components/navbar.png'
import { ActionIcon, Menu, Select, TextInput } from '@mantine/core'
import { box, icn, img, link, paper, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement, useSetElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ImageElement } from '../../elements/extensions/image'
import { LinkElement } from '../../elements/extensions/link'
import { TextElement } from '../../elements/extensions/text'
import componentScript from '../../scripts/navbar-with-dropdown-cta.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
import { color } from '../../simple/palette'
import { ImageStyler } from '../../simple/stylers/image-styler'
import { LinkStyler } from '../../simple/stylers/link-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { OptionsWrapper } from '../helpers/options-wrapper'
import { repeatObject } from '../helpers'
import { TbPlus } from 'react-icons/tb'
import { cmn } from './common'

export class NavbarWithDropDownCta1 extends Component {
	name = 'Navbar with dropdown and CTA-1'
	image = imageUrl
	defaultData = defaultData
	renderOptions = () => <NavbarWithDropDownCta1Options />
	onCreate(root: Element) {
		const compiled = _.template(componentScript)
		const script = compiled({ id: root.id })
		setElement(root, (draft) => (draft.script = script))
	}
}

function NavbarWithDropDownCta1Options() {
	return (
		<ComponentWrapper name="Navbar with dropdown and CTA-1">
			<cmn.logo.Options />
			<cmn.buttons.Options />
			<cmn.links.Options submenu={submenu} submenuOptions={submenuOptions} />
		</ComponentWrapper>
	)
}

const submenu = cmn.submenus.default.el
const submenuOptions = cmn.submenus.default.Options

const defaultData = cmn.nav.el([cmn.logo.el, cmn.links.el(submenu), cmn.buttons.el, cmn.toggle.el])
