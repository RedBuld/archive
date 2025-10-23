import { Descendant } from 'slate'
import { ElementAttributes, TextAttributes, EditorHotKeys } from './types'

export const DEFAULT_HOTKEYS: EditorHotKeys = {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline',
    'mod+s': 'strikethrough',
    'mod+`': 'code',
}

export const DEFAULT_CONTENT: Descendant[] = [
    {
        type: 'paragraph',
        children: [
            { 'text': '' }
        ],
    }
]

export const TEXT_ALIGN_TYPES = [ 'start', 'center', 'end', 'justify' ] as const

export const LIST_TYPES = [ 'numbered-list', 'bulleted-list' ] as const

export const ELEMENT_TAGS: Record<string, ( el: HTMLElement ) => ElementAttributes> = {
    A: el => ({ type: 'link', url: el.getAttribute('href')! }),
    BLOCKQUOTE: () => ({ type: 'block-quote' }),
    H1: () => ({ type: 'heading-one' }),
    H2: () => ({ type: 'heading-two' }),
    H3: () => ({ type: 'heading-three' }),
    H4: () => ({ type: 'heading-four' }),
    H5: () => ({ type: 'heading-five' }),
    H6: () => ({ type: 'heading-six' }),
    IMG: el => ({ type: 'image', url: el.getAttribute('src')! }),
    LI: () => ({ type: 'list-item' }),
    OL: () => ({ type: 'numbered-list' }),
    P: () => ({ type: 'paragraph' }),
    PRE: () => ({ type: 'code-block' }),
    UL: () => ({ type: 'bulleted-list' }),
}

export const TEXT_TAGS: Record<string, () => TextAttributes> = {
    CODE: () => ({ code: true }),
    DEL: () => ({ strikethrough: true }),
    EM: () => ({ italic: true }),
    I: () => ({ italic: true }),
    S: () => ({ strikethrough: true }),
    STRONG: () => ({ bold: true }),
    U: () => ({ underline: true }),
  }