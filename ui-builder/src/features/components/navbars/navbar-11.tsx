import { ActionIcon, Menu } from '@mantine/core'
import { TbPlus } from 'react-icons/tb'
import componentImage from '../../../assets/components/navbar/navbar-11.png'
import { box, flex } from '../../elements/constructor'
import { useSetElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { useSelectedElement } from '../../selection/use-selected-component'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { OptionsWrapper } from '../helpers/options-wrapper'
import { cmn } from './common/navbar'

const tags = {
	list: 'list',
}

export class Navbar11 extends Component {
	name = 'Navbar 11'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
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
	const list = item.find(tags.list) as BoxElement
	if (!list) return null
	return (
		<OptionsWrapper>
			<DndTabs
				containerElement={list}
				renderItemOptions={(item) => <cmn.menuItem.Options item={item as BoxElement} />}
				insertElement={() => cmn.menuItem.el('Page')}
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
			.el(['Page One', 'Page Two', 'Page Three', 'Page Four'].map(cmn.menuItem.el))
			.css({
				width: '20rem',
			})
			.cssTablet({
				width: 'auto',
			})
			.tag(tags.list),
	])
