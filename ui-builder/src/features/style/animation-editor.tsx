import { Button, CloseButton, Select, Text } from '@mantine/core'
import produce from 'immer'
import { TbPlus } from 'react-icons/tb'
import { uuid } from '../../utils'
import { AnimationAction } from '../actions/action'
import { eventOptions } from '../data-source/data-editor'
import { useElementsStore } from '../elements/elements-store'
import { EventKind } from '../elements/event'
import { useSelectedElement } from '../selection/use-selected-component'
import { CollapseLine } from '../ui/collapse-line'

const cssAnimations = [
	'flash',
	'bounce',
	'pulse',
	'rubberBand',
	'shakeX',
	'shakeY',
	'headShake',
	'swing',
	'tada',
	'wobble',
	'jello',
	'heartBeat',
	'backInDown',
	'backInLeft',
	'backInRight',
	'backInUp',
]

export function AnimationEditor() {
	const selectedElement = useSelectedElement()
	const setElement = useElementsStore((store) => store.set)
	if (!selectedElement) return null

	const addNewAnimation = () => {
		setElement(
			produce(selectedElement, (draft) => {
				draft.events.push({
					id: uuid(),
					kind: EventKind.Intersection,
					actions: [new AnimationAction(cssAnimations[0])],
				})
			})
		)
	}
	const removeAnimation = (eventId: string) => {
		setElement(
			produce(selectedElement, (draft) => {
				draft.events = draft.events.filter((event) => event.id !== eventId)
			})
		)
	}
	const editEvent = (eventId: string, event: EventKind) => {
		setElement(
			produce(selectedElement, (draft) => {
				const eventIndex = draft.events.findIndex((event) => event.id === eventId)
				draft.events[eventIndex].kind = event
			})
		)
	}
	const editAnimation = (eventId: string, actionId: string, animation: AnimationAction) => {
		setElement(
			produce(selectedElement, (draft) => {
				const eventIndex = draft.events.findIndex((event) => event.id === eventId)
				const actionIndex = draft.events[eventIndex].actions.findIndex(
					(action) => action.id === actionId
				)
				draft.events[eventIndex].actions[actionIndex] = animation
			})
		)
	}

	const animations = selectedElement.events.map((event) =>
		event.actions
			.filter((action): action is AnimationAction => action instanceof AnimationAction)
			.map((animation) => (
				<div className="space-y-2" key={animation.id}>
					<CloseButton ml="auto" onClick={() => removeAnimation(event.id)} size="xs" />
					<div className="flex items-center gap-2">
						<Text className="w-14">On</Text>
						<Select
							size="xs"
							data={eventOptions}
							className="grow"
							value={event.kind}
							onChange={(value: EventKind) => editEvent(event.id, value)}
						/>
					</div>
					<div className="flex items-center gap-2">
						<Text className="w-14">Animate</Text>
						<Select
							size="xs"
							data={cssAnimations}
							className="grow"
							value={animation.animationName}
							onChange={(value) =>
								editAnimation(
									event.id,
									animation.id,
									produce(animation, (draft) => {
										draft.animationName = value ?? ''
									})
								)
							}
						/>
					</div>
				</div>
			))
	)

	return (
		<CollapseLine label="Animation" defaultClosed>
			<div>
				<div className="space-y-4">{animations}</div>
				<Button mt="xl" size="xs" leftIcon={<TbPlus />} onClick={addNewAnimation}>
					Animation
				</Button>
			</div>
		</CollapseLine>
	)
}
