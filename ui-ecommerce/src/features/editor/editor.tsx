import EditorJS from "@editorjs/editorjs"
import { Button } from "@mantine/core"
import edjsHTML from "editorjs-html"
import { useEffect, useRef } from "react"
import { createEditor, EDITOR_ID } from "./config"

const edjsParser = edjsHTML()

export function Editor({ onSave }: { onSave: (value: string[]) => void }) {
	const editorRef = useRef<EditorJS | null>(null)

	useEffect(() => {
		if (editorRef.current) return
		editorRef.current = createEditor()
	}, [])

	const handleSave = async () => {
		const data = await editorRef.current?.save()
		const html = edjsParser.parse(data)
		onSave(html)
	}

	return (
		<div className="bg-white rounded-md p-6 prose max-w-none">
			<div id={EDITOR_ID} />
			<Button onClick={handleSave}>Save</Button>
		</div>
	)
}
