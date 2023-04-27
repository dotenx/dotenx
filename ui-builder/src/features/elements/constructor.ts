import { color } from '../simple/palette'
import { Element } from './element'
import { BoxElement } from './extensions/box'
import { ButtonElement } from './extensions/button'
import { ColumnsElement } from './extensions/columns'
import { FormElement } from './extensions/form'
import { IconElement } from './extensions/icon'
import { ImageElement } from './extensions/image'
import { InputElement } from './extensions/input'
import { LinkElement } from './extensions/link'
import { SubmitElement } from './extensions/submit'
import { TemplateElement } from './extensions/template'
import { TextElement } from './extensions/text'
import { TextareaElement } from './extensions/textarea'
import { VideoElement } from './extensions/video'

export const box = (children?: Element[]) => new BoxElement().populate(children ?? [])
export const btn = (txt: string) => new ButtonElement().unstyled().txt(txt)
export const submit = (txt: string) => new SubmitElement().unstyled().txt(txt)
export const txt = (txt: string) => new TextElement().unstyled().txt(txt)
export const link = () =>
	new LinkElement().cssHover({
		cursor: 'pointer',
	})
export const grid = (columns: number) => new ColumnsElement().cols(columns)
export const img = (src?: string) => new ImageElement().src(src ?? '')
export const icn = (name: string) =>
	new IconElement().type('fas').setName(name).css({ display: 'flex', justifyContent: 'center' })
export const template = (children: Element) => new TemplateElement().populate([children])
export const flex = (children: Element[]) => box(children).css({ display: 'flex' })
export const column = (children: Element[]) => flex(children).css({ flexDirection: 'column' })
export const textarea = () => new TextareaElement()
export const input = () => new InputElement()
export const form = (children?: Element[]) => new FormElement().populate(children ?? [])
export const video = (src?: string) => new VideoElement().src(src ?? '')
export const container = (children?: Element[]) =>
	box(children).css({ maxWidth: '1200px', margin: '0 auto' })
export const paper = (children?: Element[]) =>
	box(children).css({ padding: '1rem', color: color('text') })
export const frame = (children?: Element[]) =>
	box(children)
		.css({
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			paddingTop: '40px',
			paddingBottom: '40px',
			paddingLeft: '15%',
			paddingRight: '15%',
		})
		.cssTablet({
			paddingLeft: '10%',
			paddingRight: '10%',
			paddingTop: '30px',
			paddingBottom: '30px',
		})
		.cssMobile({
			paddingLeft: '5%',
			paddingRight: '5%',
			paddingTop: '20px',
			paddingBottom: '20px',
		})

export const frameGrid = (children?: Element[]) =>
	box(children)
		.css({
			display: 'grid',
			gridTemplateColumns: '1fr 1fr',
			paddingTop: '40px',
			paddingBottom: '40px',
			paddingLeft: '15%',
			paddingRight: '15%',
			columnGap: '4rem',
		})
		.cssTablet({
			gridTemplateColumns: '1fr',
			paddingLeft: '10%',
			paddingRight: '10%',
			paddingTop: '30px',
			paddingBottom: '30px',
			rowGap: '2rem',
		})
		.cssMobile({
			paddingLeft: '5%',
			paddingRight: '5%',
			paddingTop: '20px',
			paddingBottom: '20px',
		})
