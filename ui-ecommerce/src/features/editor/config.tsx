import Checklist from "@editorjs/checklist"
import CodeTool from "@editorjs/code"
import Delimiter from "@editorjs/delimiter"
import EditorJS from "@editorjs/editorjs"
import Embed from "@editorjs/embed"
import Header from "@editorjs/header"
import InlineCode from "@editorjs/inline-code"
import Marker from "@editorjs/marker"
import NestedList from "@editorjs/nested-list"
import Quote from "@editorjs/quote"
import RawTool from "@editorjs/raw"
import SimpleImage from "@editorjs/simple-image"
import Table from "@editorjs/table"
import TextVariantTune from "@editorjs/text-variant-tune"
import Underline from "@editorjs/underline"
import Warning from "@editorjs/warning"
import DragDrop from "editorjs-drag-drop"
import AlignmentTuneTool from "editorjs-text-alignment-blocktune"
import Undo from "editorjs-undo"

export const EDITOR_ID = "editorjs"

export const createEditor = () => {
	const editor = new EditorJS({
		holder: EDITOR_ID,
		tools: {
			header: Header,
			raw: RawTool,
			image: SimpleImage,
			checklist: Checklist,
			list: NestedList,
			embed: Embed,
			quote: Quote,
			table: Table,
			warning: Warning,
			delimiter: Delimiter,
			code: CodeTool,
			underline: Underline,
			marker: Marker,
			inlineCode: InlineCode,
			textVariant: TextVariantTune,
			alignmentTuneTool: AlignmentTuneTool,
		},
		tunes: ["textVariant", "alignmentTuneTool"],
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
