/** @type {import('tailwindcss').Config} */

function hexToRGB(hex)
{
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [ parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16) ].join(' ') : '';
}

export default {
    content: ["./src/**/*.{js,tx,jsx,tsx,svg}","./index.html"],
    theme: {
        extend: {
            fontSize: {
                'base': ['0.9rem','1rem'],
                'sm': ['0.8rem','1rem'],
                'md': ['0.85rem','1rem'],
                '3xl': ['1.8rem','2rem'],
            },
            transitionProperty: {
                'max-h': 'max-height',
                'top': 'top',
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'lg-r': '0 0px 25px -5px rgb(0 0 0 / 0.55), 0 0px 15px -5px rgb(0 0 0 / 0.1)'
            }
        },
    },
    plugins: [hexToRGB],
}