import { ActionIcon, Select, SelectItem } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import '@splidejs/react-splide/css'
import '@splidejs/react-splide/css/core'
import { produce } from 'immer'
import { FC, ReactNode } from 'react'
import { TbArrowNarrowDown, TbArrowNarrowUp, TbFoldDown, TbTrash } from 'react-icons/tb'
import { Expression } from '../../states/expression'
import { Element, RenderFn, RenderOptions } from '../element'
import { Style } from '../style'
import { BoxElement } from './box'
import { IconElement } from './icon'
import { TextElement } from './text'

export class DropdownHeaderCollapsed extends BoxElement {
	name = 'DropdownHeaderCollapsed'
	style = {}
}
export class DropdownHeaderOpened extends BoxElement {
	name = 'DropdownHeaderOpened'
	style = {}
}
export class DropdownContent extends BoxElement {
	name = 'DropdownContent'
	style = {}
}

const colors: string[] = [
	'#BD8B25',
	'#DAD1BC',
	'#7AD69B',
	'#0B6E71',
	'#CF658B',
	'#11237A',
	'#F89F16',
	'#6B4223',
	'#00FB4A',
	'#86F22D',
	'#BD6A3B',
	'#EE9310',
	'#C153CB',
	'#F8417A',
	'#1614E8',
	'#339066',
	'#414753',
	'#3BD79E',
	'#53D634',
	'#5E5E93',
]
export class DropdownElement extends Element {
	name = 'Dropdown'
	icon = (<TbFoldDown />)
	children: Element[] = [createSingleDropdown()]
	style: Style = {
		desktop: {
			default: {
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'stretch',
				padding: '10px',
				minHeight: 'auto',
				position: 'relative',
			},
		},
	}

	data = {
		selected: 0,
		section: 0,
		move: { from: '', position: 'before', to: '' },
		slides: colors.slice(0, 1),
		isToggle: false,
	}

	render(renderFn: RenderFn): ReactNode {
		if (this.children.length === 0) {
			return renderFn(this)
		}

		return renderFn(
			produce(new BoxElement(), (draft) => {
				draft.style = this.style
				draft.children = [this.children[this.data.selected]!.children![this.data.section]]
			})
		)
	}

	renderPreview(renderFn: RenderFn) {
		return <DropdownPreview element={this} renderFn={renderFn} />
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return (
			<div className="space-y-6">
				<Select
					label="Section"
					placeholder="Select a section"
					data={['Header collapsed', 'Header open', 'Content'].map(
						(child, index) =>
							({
								label: child,
								value: index + '',
							} as SelectItem)
					)}
					onChange={(val) => {
						set(
							produce(this, (draft) => {
								draft.data.section = parseInt(val!)
							})
						)
					}}
					value={this.data.section + ''}
				/>
			</div>
		)
	}
}

const createSingleDropdown = () =>
	produce(new BoxElement(), (draft) => {
		const createHeader = (isOpen: boolean) => {
			const headerTitle = produce(new TextElement(), (text) => {
				text.style = {
					desktop: {
						default: {
							display: 'flex',
							flex: '1 1 100%',
						},
					},
				}
				text.data.text = Expression.fromString('Header')
			})

			const headerIcon = produce(new IconElement(), (icon) => {
				icon.style = {
					desktop: {
						default: {
							display: 'flex',
							flex: '0 0 auto',
							width: '20px',
							height: '20px',
						},
					},
				}
				icon.data = {
					name: isOpen ? 'chevron-up' : 'chevron-down',
					type: 'fas',
				}
			})

			const headerContentWrapper = produce(new BoxElement(), (div) => {
				div.style = {
					desktop: {
						default: {
							display: 'flex',
						},
					},
				}
				div.children = [headerTitle, headerIcon]
			})
			const header = produce(
				isOpen ? new DropdownHeaderOpened() : new DropdownHeaderCollapsed(),
				(div) => {
					div.children = [headerContentWrapper]
				}
			)
			return header
		}

		const headerOpen = createHeader(true)
		const headerClosed = createHeader(false)

		const content = produce(new DropdownContent(), (div) => {
			const text = produce(new TextElement(), (text) => {
				text.style = {
					desktop: {
						default: {
							paddingTop: '10px',
							paddingBottom: '10px',
						},
					},
				}

				text.data.text =
					Expression.fromString(`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
				tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
				veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
				commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
				velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
				occaecat cupidatat non proident, sunt in culpa qui officia deserunt
				mollit anim id est laborum.`)
			})
			div.children = [text]
			div.style = {
				desktop: {
					default: {
						position: 'absolute',
						top: '100%',
						left: '0',
						right: '0',
						zIndex: '10',
						backgroundColor: 'white',
						boxShadow:
							'0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
						borderRadius: '6px',
						padding: '10px',
					},
				},
			}
		})

		draft.children = [headerOpen, headerClosed, content]
		draft.style = { desktop: { default: { position: 'relative' } } }
	})

//------- container

export interface Item {
	id: number
	text: string
}

interface ContainerProps {
	moveCard: (index: number, isUp: boolean) => void
	setSelected: (index: number) => void
	removeCard: (index: number) => void
	cards: string[]
	selected: number
}

export const Container: FC<ContainerProps> = ({
	removeCard,
	moveCard,
	cards,
	selected,
	setSelected,
}) => {
	{
		return (
			<div className="flex flex-col gap-2 w-full">
				{cards.map((card, index) => (
					<Card
						key={index}
						setSelected={setSelected}
						moveCard={moveCard}
						removeCard={removeCard}
						index={index}
						card={card}
						canMoveDown={index < cards.length - 1}
						canMoveUp={index > 0}
						isSelected={selected === index}
					/>
				))}
			</div>
		)
	}
}

interface CardProps {
	card: string
	index: number
	moveCard: (index: number, isUp: boolean) => void
	removeCard: (index: number) => void
	canMoveUp: boolean
	canMoveDown: boolean
	setSelected: (index: number) => void
	isSelected: boolean
}

const Card: FC<CardProps> = ({
	card,
	canMoveUp,
	canMoveDown,
	index,
	moveCard,
	removeCard,
	isSelected,
	setSelected,
}) => {
	return (
		<div>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					border: '1px solid',
					borderColor: isSelected ? 'red' : '#e5e7eb',
					borderRadius: '0.5rem',
					height: '30px',
					padding: '5px',
				}}
			>
				<div
					onClick={() => setSelected(index)}
					style={{
						width: '10%',
						backgroundColor: card,
					}}
					className="cursor-pointer h-full"
				></div>
				<div
					style={{
						flexGrow: 1,
					}}
				></div>
				<div className="flex items-center gap-2 h-full text-md">
					<ActionIcon
						onClick={() => {
							if (canMoveUp) {
								moveCard(index, true)
							}
						}}
						variant="transparent"
						disabled={!canMoveUp}
					>
						<TbArrowNarrowUp className="cursor-pointer" />
					</ActionIcon>
					<ActionIcon onClick={() => removeCard(index)} variant="transparent">
						<TbTrash className="mx-2 cursor-pointer text-red-500" />
					</ActionIcon>
					<ActionIcon
						onClick={() => {
							if (canMoveDown) {
								moveCard(index, false)
							}
						}}
						variant="transparent"
						disabled={!canMoveDown}
					>
						<TbArrowNarrowDown className="cursor-pointer" />
					</ActionIcon>
				</div>
			</div>
		</div>
	)
}

function DropdownPreview({ element, renderFn }: { element: DropdownElement; renderFn: RenderFn }) {
	return (
		<div className={element.generateClasses()}>
			{element.children.map((collapsible) => (
				<CollapsePreview
					key={collapsible.id}
					element={collapsible as BoxElement}
					renderFn={renderFn}
				/>
			))}
		</div>
	)
}

function CollapsePreview({ element, renderFn }: { element: BoxElement; renderFn: RenderFn }) {
	const [isOpen, handlers] = useDisclosure(false)
	const openedHeader = element.children[0]
	const closedHeader = element.children[1]
	const content = element.children[2]

	return (
		<div className={element.generateClasses()}>
			{!isOpen && (
				<div style={{ cursor: 'pointer' }} onClick={handlers.open}>
					{renderFn(closedHeader)}
				</div>
			)}
			{isOpen && (
				<div style={{ cursor: 'pointer' }} onClick={handlers.close}>
					{renderFn(openedHeader)}
				</div>
			)}
			{isOpen && <div className={content.generateClasses()}>{renderFn(content)}</div>}
		</div>
	)
}
