import { useRef, useEffect } from 'react'
import noUiSlider, { API } from 'nouislider'

export default function RangeInputSingle({
    id,
    min = 1,
    max = 100,
    value = 1,
    step = 1,
    callback
} : {
    id: string,
    min?: number,
    max?: number,
    value: number|string,
    step: number,
    callback: Function
})
{
    const nouiRef = useRef<API>(null)
    const bodyRef = useRef<HTMLDivElement|null>(null)

    const overridedClasses = {
        target: "r-target block w-full relative",
        base: "r-base block h-5 w-full relative py-2 overflow-hidden",
        origin: "r-origin absolute top-0 right-0 w-full h-full z-[1]",
        handle: "r-handle absolute top-0 -right-2.5 w-5 h-5 z-[2] rounded-full bg-sky-500 cursor-pointer",
        handleLower: "handle-lower",
        handleUpper: "handle-upper",
        touchArea: "touch-area",
        horizontal: "horizontal",
        vertical: "vertical",
        background: "background",
        connect: "r-connect absolute top-0 right-0 w-full h-full bg-sky-100 z-[1]",
        connects: "r-connects relative w-full h-full rounded-md overflow-hidden bg-zinc-500 z-[1]",
        ltr: "ltr",
        rtl: "rtl",
        textDirectionLtr: "txt-dir-ltr",
        textDirectionRtl: "txt-dir-rtl",
        draggable: "draggable",
        drag: "state-drag",
        tap: "state-tap",
        active: "active",
        tooltip: "tooltip",
        pips: "pips",
        pipsHorizontal: "pips-horizontal",
        pipsVertical: "pips-vertical",
        marker: "marker",
        markerHorizontal: "marker-horizontal",
        markerVertical: "marker-vertical",
        markerNormal: "marker-normal",
        markerLarge: "marker-large",
        markerSub: "marker-sub",
        value: "value",
        valueHorizontal: "value-horizontal",
        valueVertical: "value-vertical",
        valueNormal: "value-normal",
        valueLarge: "value-large",
        valueSub: "value-sub",
    }

    function initNoUISlider()
    {
        if( bodyRef.current )
        {
            try {
                nouiRef.current = noUiSlider.create(
                    bodyRef.current,
                    {
                        start: [ value ],
                        step: step,
                        range: {
                            'min': [ min ],
                            'max': [ max ]
                        },
                        cssPrefix: '',
                        cssClasses: overridedClasses
                    }
                )
            } catch (error) {
                return
            }
        }
    }

    function destroyNoUISlider()
    {
        if( nouiRef.current )
        {
            nouiRef.current.destroy()
        }
    }

    useEffect(
        () => {
            nouiRef.current && nouiRef.current.on( 'update', ( values ) => {
                if( values[0] != value )
                {
                    callback( values[0] )
                }
            })
            return () => {
                nouiRef.current && nouiRef.current.off( 'update' )
            }
        },
        [ callback, nouiRef.current, value ]
    )

    useEffect(
        () => {
            if( nouiRef.current && nouiRef.current?.get() != value )
            {
                nouiRef.current.set( [value] )
            }
        },
        [ value ]
    )

    useEffect(
        () => {
            initNoUISlider()
            return () => {
                destroyNoUISlider()
            }
        },
        [ bodyRef.current ]
    )


    return (
        <div className="block flex-col w-full relative z-[0]">
            <div id={id} ref={bodyRef}></div>
        </div>
    )
}