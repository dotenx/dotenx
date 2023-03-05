import CodeTool from "@editorjs/code"
import Delimiter from "@editorjs/delimiter"
import EditorJS from "@editorjs/editorjs"
import Embed from "@editorjs/embed"
import Header from "@editorjs/header"
import InlineCode from "@editorjs/inline-code"
import Marker from "@editorjs/marker"
import NestedList from "@editorjs/nested-list"
import Quote from "@editorjs/quote"
import SimpleImage from "@editorjs/simple-image"
import Underline from "@editorjs/underline"
import DragDrop from "editorjs-drag-drop"
import Undo from "editorjs-undo"

export const EDITOR_ID = "editorjs"

export const createEditor = () => {
	const editor = new EditorJS({
		holder: EDITOR_ID,
		tools: {
			header: Header,
			image: SimpleImage,
			list: NestedList,
			embed: Embed,
			quote: Quote,
			delimiter: Delimiter,
			code: CodeTool,
			underline: Underline,
			marker: Marker,
			inlineCode: InlineCode,
		},
		onReady: () => {
			new Undo({ editor })
			new DragDrop(editor)
		},
		data: {
			blocks: [
				{
					type: "header",
					data: {
						text: "Start typing here",
						level: 2,
					},
				},
			],
		},
	})
	return editor
}
