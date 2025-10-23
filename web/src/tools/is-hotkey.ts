type BUTTONS_TYPE = {
    [index: string]: string
}
type CODES_TYPE = {
    [index: string]: number
}

type HOTKEY = string
type HOTKEYS = HOTKEY | HOTKEY[]

type OPTIONS = {
    byKey?: boolean
    [index: string]: any
}

type KEY = {
    key?: string
    which?: number
    [index: string]: any
}

var IS_MAC = typeof window != 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);

var MODIFIERS: BUTTONS_TYPE = {
  alt: 'altKey',
  control: 'ctrlKey',
  meta: 'metaKey',
  shift: 'shiftKey'
};

var ALIASES: BUTTONS_TYPE = {
  add: '+',
  break: 'pause',
  cmd: 'meta',
  command: 'meta',
  ctl: 'control',
  ctrl: 'control',
  del: 'delete',
  down: 'arrowdown',
  esc: 'escape',
  ins: 'insert',
  left: 'arrowleft',
  mod: IS_MAC ? 'meta' : 'control',
  opt: 'alt',
  option: 'alt',
  return: 'enter',
  right: 'arrowright',
  space: ' ',
  spacebar: ' ',
  up: 'arrowup',
  win: 'meta',
  windows: 'meta'
};

var CODES: CODES_TYPE = {
  backspace: 8,
  tab: 9,
  enter: 13,
  shift: 16,
  control: 17,
  alt: 18,
  pause: 19,
  capslock: 20,
  escape: 27,
  ' ': 32,
  pageup: 33,
  pagedown: 34,
  end: 35,
  home: 36,
  arrowleft: 37,
  arrowup: 38,
  arrowright: 39,
  arrowdown: 40,
  insert: 45,
  delete: 46,
  meta: 91,
  numlock: 144,
  scrolllock: 145,
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  '`': 192,
  '[': 219,
  '\\': 220,
  ']': 221,
  '\'': 222
};

for( var f = 1; f < 20; f++ )
{
    CODES['f' + f] = 111 + f;
}

/**
 * Is hotkey?
 */

export default function isHotkey(hotkey: HOTKEYS, options: OPTIONS|KeyboardEvent|undefined, event?: KeyboardEvent)
{
    if( options && !( 'byKey' in options ) )
    {
        event = options as KeyboardEvent;
        options = undefined;
    }
  
    if( !Array.isArray( hotkey ) )
    {
        hotkey = [hotkey]
    }
  
    var array = hotkey.map(
        (string) => parseHotkey( string, options )
    )
  
    var check = ( e: KeyboardEvent ) => array.some(
        ( key ) => compareHotkey( key, e )
    )
  
    var ret = event == null ? check : check( event )
    return ret
}

export function isCodeHotkey( hotkey: HOTKEYS, event?: KeyboardEvent )
{
    return isHotkey( hotkey, event )
}

export function isKeyHotkey( hotkey: HOTKEYS, event?: KeyboardEvent )
{
    return isHotkey( hotkey, { byKey: true }, event)
}

/**
 * Parse.
 */

export function parseHotkey( hotkey: HOTKEY, options: OPTIONS|undefined )
{
    var byKey = options && options.byKey
    var ret: KEY = {}

    // Special case to handle the `+` key since we use it as a separator.
    hotkey = hotkey.replace('++', '+add')
    var values = hotkey.split('+')
    var length = values.length;

    // Ensure that all the modifiers are set to false unless the hotkey has them.
    for( var k in MODIFIERS )
    {
        ret[ MODIFIERS[ k ] ] = false
    }

    var _iteratorNormalCompletion = true
    var _didIteratorError = false
    var _iteratorError = undefined

    var _iterator = values[ Symbol.iterator ]()
    try
    {
        for(
            var _step;
            !( _iteratorNormalCompletion = ( _step = _iterator.next() ).done??false );
            _iteratorNormalCompletion = true
        )
        {
            var value = _step.value??''

            var optional = value.endsWith('?') && value.length > 1
        
            if( optional )
            {
                value = value.slice( 0, -1 )
            }

            var name = toKeyName( value )
            var modifier = MODIFIERS[ name ]

            if( value.length > 1 && !modifier && !ALIASES[ value ] && !CODES[ name ] )
            {
                throw new TypeError('Unknown modifier: "' + value + '"')
            }

            if( length === 1 || !modifier )
            {
                if( byKey )
                {
                    ret.key = name
                }
                else
                {
                    ret.which = toKeyCode( value )
                }
            }

            if( modifier )
            {
                ret[ modifier ] = optional ? null : true
            }
        }
    }
    catch( err )
    {
        _didIteratorError = true
        _iteratorError = err
    }
    finally
    {
        try
        {
            if( !_iteratorNormalCompletion && _iterator.return )
            {
                _iterator.return()
            }
        }
        finally
        {
            if( _didIteratorError )
            {
                throw _iteratorError
            }
        }
    }

    return ret;
}

/**
 * Compare.
 */

export function compareHotkey( key: KEY, event: KeyboardEvent )
{
    for( var prop in key )
    {
        var expected = key[ prop ]
        var actual: any = null

        if( expected == null )
        {
            continue
        }
    
        if( prop === 'key' && event.key != null )
        {
            actual = event.key.toLowerCase()
        }
        else if( prop === 'which' )
        {
            // maybe META key
            actual = ( expected === 91 && event.which === 93 ) ? 91 : event.which
        }
        else
        {
            actual = event[ prop as keyof KeyboardEvent ]
        }

        if( actual == null && expected === false )
        {
            continue
        }

        if( actual !== expected )
        {
            return false
        }
    }

    return true
}

/**
 * Utils.
 */

export function toKeyCode( name: string )
{
    name = toKeyName( name )
    var code = CODES[ name ] || name.toUpperCase().charCodeAt( 0 )
    return code
}

export function toKeyName( name: string )
{
    name = name.toLowerCase()
    name = ALIASES[ name ] || name
    return name
}