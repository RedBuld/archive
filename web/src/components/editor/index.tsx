import React, { KeyboardEvent, useCallback, useMemo } from 'react'
import { Transforms, createEditor } from 'slate'
import { withHistory } from 'slate-history'
import { Slate, Editable, RenderElementProps, RenderLeafProps, RenderPlaceholderProps, withReact } from 'slate-react'
import isHotkey from '@/tools/is-hotkey'
import { CustomEditor, CustomElement, AlignType, EditorProps } from './types'
import { DEFAULT_HOTKEYS, DEFAULT_CONTENT } from './consts'
import { ToolbarMarkButton, ToolbarBlockButton, ToolbarDelimiter, Toolbar } from './components'
import { deserialize, toggleMark, isAlignElement } from './tools'
// icons
import { MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdFormatStrikethrough, MdSuperscript, MdSubscript } from "react-icons/md"
import { MdLooksOne, MdLooksTwo } from "react-icons/md"
import { MdFormatQuote, MdCode } from "react-icons/md"
import { MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight, MdFormatAlignJustify } from "react-icons/md"
import { MdFormatListNumbered, MdFormatListBulleted } from "react-icons/md"
// 
import './style.css'



export default function Editor( {
    hotkeys,
    initialValue,
    save
} : EditorProps )
{
    const activeHotKeys = hotkeys ?? DEFAULT_HOTKEYS
    const renderElement = useCallback(
        (props: RenderElementProps) => <Element {...props} />,
        []
    )

    const renderLeaf = useCallback(
        (props: RenderLeafProps) => <Leaf {...props} />,
        []
    )

    const editor = useMemo(
        () => withHtml( withHistory( withReact( createEditor() ) ) ),
        []
    )

    return (
        <div className="relative flex flex-col w-full min-h-full bg-zinc-200">
            <Slate
                editor={editor}
                initialValue={ initialValue?.length?initialValue:DEFAULT_CONTENT }
                onChange={
                    ( value ) => {
                        const is_change = editor.operations.some( op => 'set_selection' !== op.type )
                        if( is_change && typeof save == 'function' )
                        {
                            save( value )
                        }
                    }
                }
            >
                <Toolbar className="sticky top-0 z-[2] flex flex-row items-stretch gap-2 p-3 bg-zinc-200 shadow-lg">
                    <ToolbarMarkButton format="bold" icon={<MdFormatBold/>} />
                    <ToolbarMarkButton format="italic" icon={<MdFormatItalic/>} />
                    <ToolbarMarkButton format="underline" icon={<MdFormatUnderlined/>} />
                    <ToolbarMarkButton format="strikethrough" icon={<MdFormatStrikethrough/>} />
                    <ToolbarMarkButton format="sup" icon={<MdSuperscript/>} />
                    <ToolbarMarkButton format="sub" icon={<MdSubscript/>} />
                    <ToolbarDelimiter/>
                    <ToolbarBlockButton format="heading-one" icon={<MdLooksOne/>} />
                    <ToolbarBlockButton format="heading-two" icon={<MdLooksTwo/>} />
                    <ToolbarBlockButton format="block-quote" icon={<MdFormatQuote/>} />
                    <ToolbarBlockButton format="code-block" icon={<MdCode/>} />
                    <ToolbarDelimiter/>
                    <ToolbarBlockButton format="start" icon={<MdFormatAlignLeft/>} />
                    <ToolbarBlockButton format="center" icon={<MdFormatAlignCenter/>} />
                    <ToolbarBlockButton format="end" icon={<MdFormatAlignRight/>} />
                    <ToolbarBlockButton format="justify" icon={<MdFormatAlignJustify/>} />
                    <ToolbarDelimiter/>
                    <ToolbarBlockButton format="numbered-list" icon={<MdFormatListNumbered/>} />
                    <ToolbarBlockButton format="bulleted-list" icon={<MdFormatListBulleted/>} />
                </Toolbar>
                <div className="slate-editor-content flex flex-col flex-grow p-3">
                    <Editable
                        className="block min-h-full p-3 outline-none bg-white rounded-md"
                        renderElement={ renderElement }
                        renderLeaf={ renderLeaf }
                        spellCheck
                        autoFocus
                        style={{
                            'minHeight': '100%'
                        }}
                        onKeyDown={
                            ( event: KeyboardEvent<HTMLDivElement> ) => {
                                for( const hotkey in activeHotKeys )
                                {
                                    if( isHotkey( hotkey, event as any ) )
                                    {
                                        event.preventDefault()
                                        const mark = activeHotKeys[ hotkey ]
                                        toggleMark( editor, mark )
                                    }
                                }
                            }
                        }
                        placeholder="Содержание главы..."
                        renderPlaceholder={
                            ( { children, attributes }: RenderPlaceholderProps ) => {
                                attributes['style'] = {}
                                return (
                                    <span {...attributes} className="block opacity-50 -mt-6 pointer-events-none">{children}</span>
                                )
                            }
                        }
                    />
                </div>
            </Slate>
        </div>
    )
}

function withHtml(
    editor: CustomEditor
)
{
    const { insertData, isInline, isVoid } = editor
  
    editor.isInline = (element: CustomElement) => {
        return element.type === 'link' ? true : isInline(element)
    }
  
    editor.isVoid = (element: CustomElement) => {
        return element.type === 'image' ? true : isVoid(element)
    }
  
    editor.insertData = ( data ) => {
        const html = data.getData( 'text/html' )
        if( html )
        {
            const parsed = new DOMParser().parseFromString( html, 'text/html' )
            const fragment = deserialize( parsed.body, 0 )
            Transforms.insertFragment( editor, fragment )
            return
        }
  
        insertData( data )
    }
    return editor
}


function Element(
    { attributes, children, element } : RenderElementProps
)
{
    const style: React.CSSProperties = {}

    if( isAlignElement( element ) )
    {
        style.textAlign = element.align as AlignType
    }

    switch( element.type )
    {
        case 'heading-one':
            return (
                <h1 style={style} {...attributes}>{children}</h1>
            )
        case 'heading-two':
            return (
                <h2 style={style} {...attributes}>{children}</h2>
            )
        case 'bulleted-list':
            return (
                <ul style={style} {...attributes}>{children}</ul>
            )
        case 'numbered-list':
            return (
                <ol style={style} {...attributes}>{children}</ol>
            )
        case 'list-item':
            return (
                <li style={style} {...attributes}>{children}</li>
            )
        case 'code-block':
            return (
                <code style={style} {...attributes}>{children}</code>
            )
        case 'block-quote':
            return (
                <blockquote style={style} {...attributes}>{children}</blockquote>
            )
        case 'table':
            return (
                <table style={style} {...attributes}>{children}</table>
            )
        case 'table-row':
            return (
                <tr style={style} {...attributes}>{children}</tr>
            )
        case 'table-cell':
            return (
                <td style={style} {...attributes}>{children}</td>
            )
        default:
            return (
                <p style={style} {...attributes}>{children}</p>
            )
    }
}

function Leaf(
    { attributes, children, leaf } : RenderLeafProps
)
{
    if( leaf.bold )
    {
        children = <strong>{children}</strong>
    }

    if( leaf.code )
    {
        children = <code>{children}</code>
    }

    if( leaf.italic )
    {
        children = <em>{children}</em>
    }

    if( leaf.underline )
    {
        children = <u>{children}</u>
    }

    if( leaf.strikethrough )
    {
        children = <s>{children}</s>
    }

    if( leaf.sub )
    {
        children = <sub>{children}</sub>
    }

    if( leaf.sup )
    {
        children = <sup>{children}</sup>
    }

    return <span {...attributes}>{children}</span>
}

// 


