import produce from 'immer'
import { useAtomValue } from 'jotai'
import _ from 'lodash'
import { ReactNode } from 'react'
import { AnyJson, JsonArray } from '../../utils'
import { Element } from '../elements/element'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { previewAtom } from '../page/top-bar'
import { Expression, ExpressionKind } from '../states/expression'
import { States, usePageStateStore } from '../states/page-states-store'
import { inteliText } from '../ui/intelinput'

export function RenderElements({
	elements,
	states,
	overlay,
	isDirectRootChildren,
}: {
	elements: Element[]
	states?: AnyJson
	overlay: Overlay
	isDirectRootChildren?: boolean
}) {
	return (
		<>
			{elements.map((element) => (
				<RenderElement
					key={element.id}
					element={element}
					states={states}
					overlay={overlay}
					isDirectRootChildren={isDirectRootChildren}
				/>
			))}
		</>
	)
}

export type Overlay = (props: {
	children: ReactNode
	element: Element
	isDirectRootChildren?: boolean
}) => JSX.Element

function RenderElement({
	element,
	states,
	overlay,
	isDirectRootChildren,
}: {
	element: Element
	states?: AnyJson
	overlay: Overlay
	isDirectRootChildren?: boolean
}) {
	const { isFullscreen } = useAtomValue(previewAtom)

	if (isFullscreen) {
		return (
			<RenderElementPreview
				element={element}
				states={states}
				overlay={overlay}
				isDirectRootChildren={isDirectRootChildren}
			/>
		)
	}

	const Overlay = overlay

	return (
		<Overlay element={element} isDirectRootChildren={isDirectRootChildren}>
			<>
				{element.render((element) => (
					<RenderElements
						elements={element.children ?? []}
						states={states}
						overlay={overlay}
					/>
				))}
			</>
		</Overlay>
	)
}

function RenderElementPreview({
	element,
	states,
	overlay,
	isDirectRootChildren,
}: {
	element: Element
	states?: AnyJson
	overlay: Overlay
	isDirectRootChildren?: boolean
}) {
	const pageStates = usePageStateStore((store) => store.states)

	if (element.repeatFrom) {
		const items =
			(_.get(
				pageStates,
				element.repeatFrom.name.replace('$store.source.', '')
			) as JsonArray) ?? []
		return (
			<>
				{items.map((item, index) => (
					<RenderElement
						isDirectRootChildren={isDirectRootChildren}
						key={index}
						element={produce(element, (draft) => {
							draft.repeatFrom = null
						})}
						states={item}
						overlay={overlay}
					/>
				))}
			</>
		)
	}

	if (
		element instanceof TextElement &&
		element.data.text.value.some((part) => part.kind === ExpressionKind.State)
	) {
		const evaluatedText = evaluateExpression(element.data.text, states, pageStates)
		const valuedElement = produce(element, (draft) => {
			draft.data.text = inteliText(evaluatedText)
		})
		return (
			<RenderElement
				isDirectRootChildren={isDirectRootChildren}
				key={element.id}
				element={valuedElement}
				overlay={overlay}
			/>
		)
	}

	if (
		element instanceof ImageElement &&
		element.data.src.value.some((part) => part.kind === ExpressionKind.State)
	) {
		const evaluatedText = evaluateExpression(element.data.src, states, pageStates)
		const valuedElement = produce(element, (draft) => {
			draft.data.src = inteliText(evaluatedText)
		})
		return (
			<RenderElement
				isDirectRootChildren={isDirectRootChildren}
				key={element.id}
				element={valuedElement}
				overlay={overlay}
			/>
		)
	}

	let backgroundUrl = ''
	if (element instanceof ImageElement) {
		backgroundUrl = element.data.src.toString()
	}
	const style = backgroundUrl
		? {
				backgroundImage: `url(${backgroundUrl})`,
				backgroundSize: 'contain',
				backgroundRepeat: 'no-repeat',
				backgroundPosition: 'center',
		  }
		: {}

	return (
		<>
			{element.renderPreview(
				(element) => (
					<RenderElements
						elements={element.children ?? []}
						states={states}
						overlay={overlay}
					/>
				),
				style
			)}
		</>
	)
}

function evaluateExpression(
	expression: Expression,
	states: AnyJson | undefined,
	pageStates: States
) {
	return expression.value
		.map((part) => {
			if (part.kind === ExpressionKind.Text) return part.value
			const splitPath = part.value.name.split('.')
			const textValue =
				_.get(
					states,
					splitPath.splice(splitPath.findIndex((p) => p.endsWith('Item')) + 1)
				) ?? _.get(pageStates, part.value.name.replace('$store.source.', ''))
			return textValue as string
		})
		.join('')
}
