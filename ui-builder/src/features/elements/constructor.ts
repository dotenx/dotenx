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

export const box = (children?: Element[]) => new BoxElement().populate(children ?? [])
export const btn = (txt: string) => new ButtonElement().unstyled().txt(txt)
export const submit = (txt: string) => new SubmitElement().unstyled().txt(txt)
export const txt = (txt: string) => new TextElement().unstyled().txt(txt)
export const link = () => new LinkElement().unstyled()
export const grid = (columns: number) => new ColumnsElement().cols(columns)
export const img = (src?: string) => new ImageElement().src(src ?? '')
export const icn = (name: string) => new IconElement().type('fas').setName(name)
export const template = (children: Element) => new TemplateElement().populate([children])
export const flex = (children: Element[]) => box(children).css({ display: 'flex' })
export const textarea = () => new TextareaElement()
export const input = () => new InputElement()
export const form = (children?: Element[]) => new FormElement().populate(children ?? [])
