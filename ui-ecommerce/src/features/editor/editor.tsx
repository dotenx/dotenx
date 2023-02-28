import EditorJS, { OutputData } from "@editorjs/editorjs"
import edjsHTML from "editorjs-html"
import { MutableRefObject, useEffect, useRef } from "react"
import { createEditor, EDITOR_ID } from "./config"

const edjsParser = edjsHTML()

export type EditorValue = { html: string; json?: OutputData }

export function Editor({ editor }: { editor: EditorContext }) {
	useEffect(() => {
		if (editor.ref.current) return
		editor.ref.current = createEditor()
	}, [editor.ref])

	return (
		<div className="bg-white rounded-md p-6 prose max-w-none">
			<div id={EDITOR_ID} />
		</div>
	)
}

export type EditorContext = {
	ref: MutableRefObject<EditorJS | null>
	html: () => Promise<string>
	json: () => Promise<OutputData | undefined>
}

export function useEditor(): EditorContext {
	const editorRef = useRef<EditorJS | null>(null)

	const json = async () => {
		const data = await editorRef.current?.save()
		return data
	}

	const html = async () => {
		const data = await json()
		const html = edjsParser.parse(data) as string[]
		return html.join("\n")
	}

	return {
		ref: editorRef,
		html,
		json,
	}
}
