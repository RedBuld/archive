import { Editor as SlateEditor, Element as SlateElement, Transforms } from 'slate'
import { jsx } from 'slate-hyperscript'
import { ELEMENT_TAGS, TEXT_ALIGN_TYPES, TEXT_TAGS, LIST_TYPES } from './consts'
import { CustomEditor, CustomElement, CustomElementFormat, CustomElementWithAlign, CustomTextKey, AlignType, ListType, ParsedNodeAttributes } from './types'

export function deserialize(
    el: HTMLElement | ChildNode,
    depth: number =1
): any
{
    if( el.nodeType === 3 && el.textContent?.trim() )
    {
        return el.textContent.trimStart()
    }
    else if( el.nodeType !== 1 )
    {
        return null
    }
    else if( el.nodeName === 'BR' )
    {
        return '\n'
    }
  
    const { nodeName } = el
    
    let parent = el
  
    if( nodeName === 'PRE' && el.childNodes[0] && el.childNodes[0].nodeName === 'CODE' )
    {
        parent = el.childNodes[0]
    }

    let ndepth = depth+1
    let children = Array.from( parent.childNodes ).map( ( e) => deserialize( e, ndepth ) ).flat()
  
    if( children.length === 0 )
    {
        children = [{ text: '' }]
    }
  
    if( el.nodeName === 'BODY' )
    {
        return jsx( 'fragment', {}, children )
    }
  
    if( ELEMENT_TAGS[ nodeName ] )
    {
        let attrs = ELEMENT_TAGS[ nodeName ]( el as HTMLElement ) as ParsedNodeAttributes
        if( depth <= 2 )
        {
            let styles = ( el as HTMLElement ).style
            let align: string = styles.textAlign
            if( align == 'left' ) { align = 'start' }
            if( align == 'right' ) { align = 'end' }

            attrs.underline = styles.textDecoration == 'underline'
            attrs.strikethrough = styles.textDecoration == 'line-through'
            attrs.bold = parseInt(styles.fontWeight) > 600
            attrs.italic = styles.fontStyle == 'italic'
            attrs.align = TEXT_ALIGN_TYPES.includes( align as AlignType ) ? align : undefined
        }
        return jsx( 'element', attrs, children )
    }
  
    if( TEXT_TAGS[ nodeName ] )
    {
        const attrs = TEXT_TAGS[ nodeName ]()
        return children.map(
            ( child ) => jsx( 'text', attrs, child )
        )
    }
  
    return children
}

export function toggleBlock(
    editor: CustomEditor,
    format: CustomElementFormat
)
{
    const isActive = isBlockActive(
        editor,
        format,
        isAlignType( format ) ? 'align' : 'type'
    )
    const isList = isListType( format )

    Transforms.unwrapNodes(
        editor,
        {
            match: ( node ) => !SlateEditor.isEditor( node ) && SlateElement.isElement( node ) && isListType( node.type ) && !isAlignType( format ),
            split: true,
        }
    )

    let newProperties: Partial<SlateElement>
    if( isAlignType( format ) )
    {
        newProperties = {
            align: isActive ? undefined : format,
        }
    }
    else
    {
        newProperties = {
            type: isActive ? 'paragraph' : isList ? 'list-item' : format,
        }
    }

    Transforms.setNodes<SlateElement>( editor, newProperties )

    if( !isActive && isList )
    {
        const block = { type: format, children: [] }
        Transforms.wrapNodes( editor, block )
    }
}

export function toggleMark(
    editor: CustomEditor,
    format: CustomTextKey
)
{
    const isActive = isMarkActive( editor, format )
  
    if( isActive )
    {
        SlateEditor.removeMark( editor, format )
    }
    else
    {
        SlateEditor.addMark( editor, format, true )
    }
}

// 

export function isBlockActive(
    editor: CustomEditor,
    format: CustomElementFormat,
    blockType: 'type' | 'align' = 'type'
)
{
    const { selection } = editor
    if( !selection )
    {
        return false
    }

    const [ match ] = Array.from(
        SlateEditor.nodes(
            editor,
            {
                at: SlateEditor.unhangRange( editor, selection ),
                match: ( node ) => {
                    if( !SlateEditor.isEditor( node ) && SlateElement.isElement( node ) )
                    {
                        if( blockType === 'align' && isAlignElement( node ) )
                        {
                            return node.align === format
                        }
                        return node.type === format
                    }
                    return false
                },
            }
        )
    )

    return !!match
}

export function isMarkActive(
    editor: CustomEditor,
    format: CustomTextKey
)
{
    const marks = SlateEditor.marks( editor )
    return marks ? marks[ format ] === true : false
}

// 

export function isAlignType(
    format: CustomElementFormat
) : format is AlignType
{
    return TEXT_ALIGN_TYPES.includes( format as AlignType )
}

export function isListType(
    format: CustomElementFormat
) : format is ListType
{
    return LIST_TYPES.includes( format as ListType )
}

export function isAlignElement(
    element: CustomElement
) : element is CustomElementWithAlign
{
    return 'align' in element
}
