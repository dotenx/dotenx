import { ActionIcon, Menu } from '@mantine/core'
import _ from 'lodash'
import { TbPlus } from 'react-icons/tb'
import componentImage from '../../../assets/components/navbar/navbar-12.png'
import { gridCols } from '../../../utils/style-utils'
import { box, flex, grid } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement, useSetElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import componentScript from '../../scripts/navbars.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { OptionsWrapper } from '../helpers/options-wrapper'
import { cmn } from './common/navbar'

const tags = {
	pageGroups: 'pageGroups',
}

export class Navbar12 extends Component {
	name = 'Navbar 12'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
	onCreate(root: Element) {
		const compiled = _.template(componentScript)
		const script = compiled({ id: root.id })
		setElement(root, (draft) => (draft.script = script))
	}
}

function Options() {
	return (
		<ComponentWrapper>
			<cmn.logo.Options />
			<cmn.buttons.Options />
			<LinkListOptions />
		</ComponentWrapper>
	)
}

function LinkListOptions() {
	const set = useSetElement()
	const component = useSelectedElement() as BoxElement
	const container = component.find(cmn.tags.linkList.container) as BoxElement
	return (
		<OptionsWrapper>
			<DndTabs
				containerElement={container}
				rightSection={
					<Menu position="left">
						<Menu.Target>
							<ActionIcon variant="transparent">
								<TbPlus
									size={16}
									className="text-red-500 rounded-full border-red-500 border"
								/>
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								onClick={() =>
									set(container, (draft) =>
										draft.children.push(cmn.linkItem.el('Link'))
									)
								}
							>
								Text Link
							</Menu.Item>
							<Menu.Item
								onClick={() =>
									set(container, (draft) => draft.children.push(createMenuItem()))
								}
							>
								Menu Link
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				}
				renderItemOptions={(item) => <LinkListItemOptions item={item as BoxElement} />}
			/>
		</OptionsWrapper>
	)
}

function LinkListItemOptions({ item }: { item: BoxElement }) {
	return (
		<OptionsWrapper>
			<cmn.linkItem.Options root={item} />
			<LinkMenuOptions item={item} />
		</OptionsWrapper>
	)
}

function LinkMenuOptions({ item }: { item: BoxElement }) {
	const pageGroups = item.find(tags.pageGroups) as BoxElement
	if (!pageGroups) return null
	return (
		<OptionsWrapper>
			<DndTabs
				containerElement={pageGroups}
				renderItemOptions={(item) => <cmn.pageGroup.Options item={item as BoxElement} />}
				insertElement={() =>
					cmn.pageGroup.el('Page group ', ['Page', 'Page', 'Page', 'Page'])
				}
				maxLength={2}
			/>
		</OptionsWrapper>
	)
}
const component = () =>
	cmn.container.el([
		box([
			cmn.logo.el(),
			flex([menu()]).css({
				gap: '1.5rem',
				alignItems: 'center',
			}),
			cmn.menuBtn.el(),
		]).css({
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			width: '100%',
		}),
	])

const menu = () => cmn.menu.el([linkList(), cmn.buttons.el()])

const linkList = () =>
	flex([
		cmn.linkItem.el('Link One'),
		cmn.linkItem.el('Link Two'),
		cmn.linkItem.el('Link Three'),
		createMenuItem(),
	])
		.cssTablet({
			flexDirection: 'column',
		})
		.tag(cmn.tags.linkList.container)

const createMenuItem = () =>
	cmn.linkMenu.el('Link Four', [
		cmn.linkSubmenu
			.el([
				grid(2)
					.populate([
						cmn.pageGroup.el('Page group one', [
							'Page One',
							'Page Two',
							'Page Three',
							'Page Four',
						]),
						cmn.pageGroup.el('Page group two', [
							'Page Five',
							'Page Six',
							'Page Seven',
							'Page Eight',
						]),
					])
					.tag(tags.pageGroups)
					.cssTablet({
						gridTemplateColumns: gridCols(1),
					}),
			])
			.css({
				width: '40rem',
				right: '-100%',
			})
			.cssTablet({
				width: 'auto',
			}),
	])
