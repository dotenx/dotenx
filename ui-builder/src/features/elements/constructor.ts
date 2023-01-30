import { BoxElement } from './extensions/box'
import { ButtonElement } from './extensions/button'
import { ColumnsElement } from './extensions/columns'
import { ImageElement } from './extensions/image'
import { TextElement } from './extensions/text'

export const box = () => new BoxElement()
export const btn = (txt: string) => new ButtonElement().txt(txt)
export const txt = (txt: string) => new TextElement().txt(txt)
export const grid = (columns: number) => new ColumnsElement().cols(columns)
export const img = () => new ImageElement()
