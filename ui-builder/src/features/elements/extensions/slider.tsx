import { ActionIcon } from '@mantine/core'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/react-splide/css'
import '@splidejs/react-splide/css/core'
import { produce } from 'immer'
import { FC, ReactNode } from 'react'
import { TbArrowNarrowDown, TbArrowNarrowUp, TbSeparatorVertical, TbTrash } from 'react-icons/tb'
import { Element, RenderFn, RenderOptions } from '../element'
import { useSetElement } from '../elements-store'
import { Style } from '../style'
import { BoxElement } from './box'

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
export class SliderElement extends Element {
	name = 'Slider'
	icon = (<TbSeparatorVertical />)
	children: Element[] = [new BoxElement(), new BoxElement(), new BoxElement()]
	style: Style = {
		desktop: {
			default: { height: '100%', minHeight: '100px', padding: '10px' },
		},
	}

	data = {
		selected: 0,
		move: { from: '', position: 'before', to: '' },
		slides: colors.slice(0, 3),
	}

	render(renderFn: RenderFn): ReactNode {
		if (this.children.length === 0) {
			return renderFn(this)
		}

		return renderFn(
			produce(this, (draft) => {
				draft.children = [this.children[this.data.selected]]
			})
		)
	}

	renderPreview(renderFn: RenderFn) {
		return (
			<div className={this.generateClasses()}>
				<Splide>
					{this.children.map((child, i) => (
						<SplideSlide key={i}>
							{renderFn(
								produce(this, (draft) => {
									draft.children = [child]
								})
							)}
						</SplideSlide>
					))}
				</Splide>
			</div>
		)
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return <SliderOptions element={this} />
	}
}

function SliderOptions({ element }: { element: SliderElement }) {
	const set = useSetElement()

	return (
		<div className="space-y-6">
			<button
				className="flex items-center justify-center w-full h-10 text-white bg-red-500 rounded-md"
				onClick={() => {
					set(element, (draft) => {
						draft.children.push(new BoxElement())
						draft.data.slides.push(colors[draft.children.length - 1])
					})
				}}
				disabled={element.children.length == colors.length}
			>
				+ Add new slide
			</button>
			<Container
				cards={element.data.slides}
				selected={element.data.selected}
				setSelected={(index: number) => {
					set(element, (draft) => {
						draft.data.selected = index
					})
				}}
				moveCard={(index: number, isUp: boolean) => {
					const newIndex = index + (isUp ? -1 : 1)
					set(element, (draft) => {
						const temp = draft.data.slides[index]
						draft.data.slides[index] = draft.data.slides[newIndex]
						draft.data.slides[newIndex] = temp

						const child = draft.children[index]
						draft.children[index] = draft.children[newIndex]
						draft.children[newIndex] = child

						draft.data.selected = newIndex
					})
				}}
				removeCard={(index: number) => {
					set(element, (draft) => {
						if (draft.data.selected === index) {
							draft.data.selected = 0
						} else if (draft.data.selected === draft.children.length - 1) {
							draft.data.selected = draft.children.length - 2
						}
						draft.data.slides.splice(index, 1)
						draft.children.splice(index, 1)
					})
				}}
			/>
		</div>
	)
}

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
