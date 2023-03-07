import produce from 'immer'
import { useAtomValue } from 'jotai'
import _ from 'lodash'
import { ReactNode } from 'react'
import { AnyJson, JsonArray } from '../../utils'
import { Element } from '../elements/element'
import { ColumnsElement } from '../elements/extensions/columns'
import { ImageElement } from '../elements/extensions/image'
import { InputElement } from '../elements/extensions/input'
import { SelectElement } from '../elements/extensions/select'
import { TextElement } from '../elements/extensions/text'
import { TextareaElement } from '../elements/extensions/textarea'
import { previewAtom } from '../page/top-bar'
import { Expression, ExpressionKind } from '../states/expression'
import { States, usePageStateStore } from '../states/page-states-store'
import { inteliText } from '../ui/intelinput'

export function RenderElements({
	elements,
	states,
	overlay,
	isDirectRootChildren,
	parentHidden,
	isGridChild,
	isSimple,
}: {
	elements: Element[]
	states?: AnyJson
	overlay: Overlay
	isDirectRootChildren?: boolean
	parentHidden?: boolean
	isGridChild?: boolean
	isSimple: boolean
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
					parentHidden={parentHidden}
					isGridChild={isGridChild}
					isSimple={isSimple}
				/>
			))}
		</>
	)
}

export type Overlay = (props: {
	children: ReactNode
	element: Element
	isDirectRootChildren?: boolean
	parentHidden?: boolean
	withoutStyle?: boolean
	isGridChild?: boolean
}) => JSX.Element

function RenderElement({
	element,
	states,
	overlay,
	isDirectRootChildren,
	parentHidden,
	isGridChild,
	isSimple,
}: {
	element: Element
	states?: AnyJson
	overlay: Overlay
	isDirectRootChildren?: boolean
	parentHidden?: boolean
	isGridChild?: boolean
	isSimple: boolean
}) {
	const { isFullscreen } = useAtomValue(previewAtom)

	if (isFullscreen) {
		return (
			<RenderElementPreview
				element={element}
				states={states}
				overlay={overlay}
				isDirectRootChildren={isDirectRootChildren}
				isSimple={isSimple}
			/>
		)
	}

	const Overlay = overlay

	const withoutStyle =
		element instanceof InputElement ||
		element instanceof SelectElement ||
		element instanceof TextareaElement

	return (
		<Overlay
			withoutStyle={withoutStyle}
			element={element}
			isDirectRootChildren={isDirectRootChildren}
			parentHidden={parentHidden}
			isGridChild={isGridChild}
		>
			{element.render(
				(element) => (
					<RenderElements
						elements={element.children ?? []}
						states={states}
						overlay={overlay}
						parentHidden={parentHidden || element.hidden}
						isGridChild={element instanceof ColumnsElement}
						isSimple={isSimple}
					/>
				),
				{ isSimple }
			)}
		</Overlay>
	)
}

function RenderElementPreview({
	element,
	states,
	overlay,
	isDirectRootChildren,
	isGridChild,
	isSimple,
}: {
	element: Element
	states?: AnyJson
	overlay: Overlay
	isDirectRootChildren?: boolean
	isGridChild?: boolean
	isSimple: boolean
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
						isGridChild={isGridChild}
						isSimple={isSimple}
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
				isGridChild={isGridChild}
				isSimple={isSimple}
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
				isGridChild={isGridChild}
				isSimple={isSimple}
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
				backgroundSize: element.style.desktop?.default?.objectFit ?? 'cover',
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
						isSimple={isSimple}
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
			const splitPath = part.value.split('.')
			const textValue =
				_.get(
					states,
					splitPath.splice(splitPath.findIndex((p) => p.endsWith('Item')) + 1)
				) ?? _.get(pageStates, part.value.replace('$store.source.', ''))
			return textValue as string
		})
		.join('')
}
