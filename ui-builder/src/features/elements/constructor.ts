import { Element } from './element'
import { BoxElement } from './extensions/box'
import { ButtonElement } from './extensions/button'
import { ColumnsElement } from './extensions/columns'
import { ImageElement } from './extensions/image'
import { TextElement } from './extensions/text'

export const box = (children?: Element[]) => new BoxElement().populate(children ?? [])
export const btn = (txt: string) => new ButtonElement().unstyled().txt(txt)
export const txt = (txt: string) => new TextElement().unstyled().txt(txt)
export const grid = (columns: number) => new ColumnsElement().cols(columns)
export const img = (src?: string) => new ImageElement().src(src ?? '')
