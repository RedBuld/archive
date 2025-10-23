import { ReactElement } from 'react'
import { Descendant, BaseEditor, BaseRange, Range, Element } from 'slate'
import { ReactEditor, RenderElementProps } from 'slate-react'
import { HistoryEditor } from 'slate-history'
import { TEXT_ALIGN_TYPES, LIST_TYPES } from './consts'

// misc

export type ElementAttributes = {
    type: CustomElementType
    url?: string
}

export type TextAttributes = {
    code?: boolean
    align?: string
    bold?: boolean
    italic?: boolean
    underline?: boolean
    strikethrough?: boolean
}

export type ParsedNodeAttributes = ElementAttributes & TextAttributes

// Editor types

export type EditorHotKeys = {
    [index: string]: CustomTextKey
}

export type AlignType = ( typeof TEXT_ALIGN_TYPES )[ number ]

export type ListType = ( typeof LIST_TYPES )[ number ]

export type CustomElementFormat = CustomElementType | AlignType | ListType

export type EditorBlockButtonProps = {
    format: CustomElementFormat
    icon: ReactElement
}

export type EditorMarkButtonProps = {
    format: CustomTextKey
    icon: ReactElement
}

// Base type

export type EmptyText = {
    text: string
}

// Blocks types

export type ParagraphElement = {
    type: 'paragraph'
    align?: string
    children: Descendant[]
}

export type HeadingElement = {
    type: 'heading-one'
    align?: string
    children: Descendant[]
}

export type HeadingTwoElement = {
    type: 'heading-two'
    align?: string
    children: Descendant[]
}

export type HeadingThreeElement = {
    type: 'heading-three'
    align?: string
    children: Descendant[]
    }

export type HeadingFourElement = {
    type: 'heading-four'
    align?: string
    children: Descendant[]
}

export type HeadingFiveElement = {
    type: 'heading-five'
    align?: string
    children: Descendant[]
}

export type HeadingSixElement = {
    type: 'heading-six'
    align?: string
    children: Descendant[]
}

export type BlockQuoteElement = {
    type: 'block-quote'
    align?: string
    children: Descendant[]
}

export type BulletedListElement = {
    type: 'bulleted-list'
    align?: string
    children: Descendant[]
}

export type NumberedListItemElement = {
    type: 'numbered-list'
    align?: string
    children: Descendant[]
}

export type ListItemElement = {
    type: 'list-item';
    children: Descendant[]
}

export type TableElement = {
    type: 'table';
    children: TableRowElement[]
}

export type TableRowElement = {
    type: 'table-row';
    children: TableCellElement[]
}

export type TableCellElement = {
    type: 'table-cell';
    children: CustomText[]
}

export type LinkElement = {
    type: 'link';
    url: string;
    children: Descendant[]
}

export type ImageElement = {
    type: 'image'
    url: string
    children: Descendant[]
}

export type CodeBlockElement = {
    type: 'code-block'
    language: string
    children: Descendant[]
}

export type EditableVoidElement = {
    type: 'editable-void'
    children: Descendant[]
}

// Composites

export type CustomElementWithAlign =
    | ParagraphElement
    | HeadingElement
    | HeadingTwoElement
    | HeadingThreeElement
    | HeadingFourElement
    | HeadingFiveElement
    | HeadingSixElement
    | BlockQuoteElement
    | BulletedListElement
    | NumberedListItemElement

export type CustomElement =
    | ParagraphElement
    | HeadingElement
    | HeadingTwoElement
    | HeadingThreeElement
    | HeadingFourElement
    | HeadingFiveElement
    | HeadingSixElement
    | BlockQuoteElement
    | BulletedListElement
    | NumberedListItemElement
    | ListItemElement
    | TableElement
    | TableRowElement
    | TableCellElement
    | LinkElement
    | ImageElement
    | CodeBlockElement
    | EditableVoidElement

export type CustomText = {
    bold?: boolean
    italic?: boolean
    code?: boolean
    underline?: boolean
    strikethrough?: boolean
    sub?: boolean
    sup?: boolean
    // MARKDOWN PREVIEW SPECIFIC LEAF
    underlined?: boolean
    list?: boolean
    hr?: boolean
    blockquote?: boolean
    text: string
}

// 

export type CustomElementType = CustomElement[ 'type' ]

export type CustomTextKey = keyof Omit< CustomText, 'text' >

// 

export type RenderElementPropsFor<T> = RenderElementProps & {
  element: T
}

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor & { nodeToDecorations?: Map<Element, Range[]> }

export type EditorProps = {
    initialValue?: Descendant[],
    hotkeys?: EditorHotKeys,
    save?: Function
}

declare module 'slate' {
    interface CustomTypes {
        Editor: CustomEditor
        Element: CustomElement
        Text: CustomText
        Range: BaseRange & {
            [ key: string ]: unknown
        }
    }
}