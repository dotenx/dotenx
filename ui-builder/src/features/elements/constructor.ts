import { Element } from './element'
import { BoxElement } from './extensions/box'
import { ButtonElement } from './extensions/button'
import { ColumnsElement } from './extensions/columns'
import { IconElement } from './extensions/icon'
import { ImageElement } from './extensions/image'
import { LinkElement } from './extensions/link'
import { TemplateElement } from './extensions/template'
import { TextElement } from './extensions/text'

export const box = (children?: Element[]) => new BoxElement().populate(children ?? [])
export const btn = (txt: string) => new ButtonElement().unstyled().txt(txt)
export const txt = (txt: string) => new TextElement().unstyled().txt(txt)
export const link = () => new LinkElement().unstyled()
export const grid = (columns: number) => new ColumnsElement().cols(columns)
export const img = (src?: string) => new ImageElement().src(src ?? '')
export const icn = (name: string) => new IconElement().type('fas').setName(name)
export const template = (children: Element) => new TemplateElement().populate([children])
export const flex = (children: Element[]) => box(children).css({ display: 'flex' })
