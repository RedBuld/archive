import { PropsWithChildren, ReactNode, PointerEvent } from 'react'
import ReactDOM from 'react-dom'
import { useSlate } from 'slate-react'
import { EditorBlockButtonProps, EditorMarkButtonProps } from './types'
import { isAlignType, isBlockActive, isMarkActive, toggleBlock, toggleMark } from './tools'

interface BaseProps {
  [key: string]: unknown
}

interface ButtonProps {
    active?: boolean
    reversed?: boolean
}

export function Button(
    { active, reversed, ...props } : PropsWithChildren<ButtonProps & BaseProps>
)
{
    return (
        <button {...props}/>
    )
}

export function Instruction(
    { ...props }: PropsWithChildren<BaseProps>
)
{
    return (
        <div {...props} />
    )
}

export function Menu(
    { ...props }: PropsWithChildren<BaseProps>
)
{
    return (
        <div {...props} />
    )
}

export function Portal(
    { children } : { children?: ReactNode }
)
{
    return typeof document === 'object' ? ReactDOM.createPortal(children, document.body) : null
}

export function Toolbar(
    { ...props }: PropsWithChildren<BaseProps>
)
{
    return (
        <Menu {...props} />
    )
}

export function ToolbarBlockButton(
    { format, icon } : EditorBlockButtonProps
)
{
    const editor = useSlate()
    const active = isBlockActive(
        editor,
        format,
        isAlignType( format ) ? 'align' : 'type'
    )
    return (
        <Button
            className={`inline-flex flex-col p-2 rounded-md ${active ? 'bg-zinc-400 text-white' : 'bg-zinc-300 text-black'}`}
            active={active}
            onPointerDown={
                ( event: PointerEvent<HTMLButtonElement> ) => event.preventDefault()
            }
            onClick={
                () => toggleBlock( editor, format )
            }
        >{icon}</Button>
    )
}

export function ToolbarMarkButton(
    { format, icon } : EditorMarkButtonProps
)
{
    const editor = useSlate()
    const active = isMarkActive( editor, format )

    return (
        <Button
            className={`inline-flex flex-col p-2 rounded-md ${active ? 'bg-zinc-400 text-white' : 'bg-zinc-300 text-black'}`}
            active={active}
            onPointerDown={
                ( event: PointerEvent<HTMLButtonElement> ) => event.preventDefault()
            }
            onClick={
                () => toggleMark( editor, format )
            }
        >{icon}</Button>
    )
}

export function ToolbarDelimiter()
{
    return (
        <span className="inline-flex my-1 mx-2 w-px bg-zinc-400"></span>
    )
}