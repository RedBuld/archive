import { useSignal, useSignalEffect } from "@preact/signals-react"
import Editor from "@/components/editor"

export default function DemoEditorPage()
{
    let cachedValue = localStorage.getItem( 'editor_cache' )
    const initialValue: any[] = cachedValue ? JSON.parse( cachedValue ) : []
    const editorContent = useSignal<any[]>([])

    function saveContent( c: any[] )
    {
        editorContent.value = c
    }
    
    useSignalEffect(
        () => {
            console.log( JSON.stringify( editorContent.value ) )
            localStorage.setItem( 'editor_cache', JSON.stringify( editorContent.value ) )
        }
    )

    return(
        <div className="flex flex-row items-stretch w-full min-h-screen bg-white">
            <div className="flex flex-col w-full min-h-full">
                <Editor initialValue={initialValue} save={saveContent}/>
            </div>
        </div>
    )
}