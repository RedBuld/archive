import { useState } from 'react'
import { useOutsideClick } from '../../tools/general'
import { FilterToLabel, ShortData } from '../../types/general'
import Scrollbar from 'react-scrollbars-custom'

function FilterSelect({
    type,
    options,
    activeValues,
    setValue
}: {
    type: string,
    options: ShortData[],
    activeValues: number[],
    setValue: Function
})
{
    const active_values = activeValues??[]
    const active_labels = options.filter( ( o ) => active_values.includes( o.id ) )

    const [open, setOpen] = useState( false )
    const setClose = async () => {
        setOpen( false )
    }

    const ref = useOutsideClick( setClose )

    function toggleValue(value: number)
    {
        let _index = active_values.indexOf( value )
        if( _index === -1 )
        {
            active_values.push( value )
        }
        else
        {
            active_values.splice( _index, 1 )
        }
        setValue( type, active_values )
    }

    return (
        <div className="relative z-[2] w-full md:min-w-48" ref={ ref }>
            <button onClick={ ()=>setOpen( !open ) } className="inline-flex items-center justify-between w-full rounded-lg p-3 pl-4 bg-white hover:bg-zinc-50">
                <span className={`block text-left text-base items-center w-full truncate ${ active_labels.length > 0 ? 'text-zinc-900' : 'text-zinc-600' }`}>
                    { FilterToLabel[ type ] }{ active_labels.length ? ': ' + active_labels.map( ( l ) => l.name ).join(', ') : '' }
                </span>
                <span className="inline-flex ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={"w-5 h-5 " + (open?"text-zinc-900":"text-zinc-600")}>
                        <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd"></path>
                    </svg>
                </span>
            </button>
            <Scrollbar
                translateContentSizeYToHolder={true}
                disableTracksWidthCompensation={true}
                className={ "flex flex-grow flex-col absolute top-1 left-0 max-h-[40vh] w-full bg-white rounded-lg shadow " + (open ? "block" : "hidden")}
                contentProps={{
                    renderer: ( props ) => {
                        const { elementRef, ...restProps } = props
                        let modRestProps = restProps ?? {}
                        const key = modRestProps[ 'key' ]
                        delete modRestProps[ 'key' ]
                        modRestProps[ 'style' ] && delete modRestProps[ 'style' ][ 'display' ]
                        return (
                            <div key={ key } { ...modRestProps } ref={ elementRef } className="flex flex-col w-full p-3" />
                        )
                    }
                }}
            >
                { options.map( ( value ) => {
                    return (
                        <div key={`f_${ type }_${ value.id }`} className="flex flex-col">
                            <div className="flex items-center p-3 cursor-pointer hover:bg-zinc-200 rounded-md" onClick={ () => { toggleValue( value.id ) } }>
                                <div className={"flex justify-center items-center w-4 h-4 border rounded" +( active_values.includes( value.id ) ? " text-white bg-blue-600 border-blue-600" : " text-zinc-100 bg-zinc-100 border-zinc-300")}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 799.99917 586.66918" fill="currentColor" aria-hidden="true" className="w-3 h-3 text-inherit">
                                        <path fillRule="evenodd" d="m785.14443,16.70738c19.80631,21.22416,19.80631,54.92198,0,76.14614l-445.23111,477.1058c-11.52669,12.35179-27.80111,18.2545-43.98763,16.36322-14.86328.56498-29.38476-5.38218-39.90397-16.65578L14.85474,311.23445c-19.80631-21.22426-19.80631-54.92198,0-76.14624,20.78776-22.27641,55.30599-22.27641,76.09375-.00061l207.15006,221.96594L709.05068,16.70738c20.78776-22.27651,55.30599-22.27651,76.09375,0Z"></path>
                                    </svg>
                                </div>
                                <span className="ml-2 text-base font-medium text-zinc-600 hover:text-zinc-900">{ value.name }</span>
                            </div>
                        </div>
                    )
                })}
            </Scrollbar>
        </div>
    );
}

export default FilterSelect;