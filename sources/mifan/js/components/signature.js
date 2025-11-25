export default function signature() {
    const f = ['footer','>',':last-child','>','section'].join(' ');
    let section = document.querySelector(f);
    if (!section) {
        const _0xfe = [
            String.fromCharCode(102, 111, 111, 116, 101, 114),
            String.fromCharCode(100, 105, 118),
            String.fromCharCode(99, 111, 110, 116, 97, 105, 110, 101, 114),
            String.fromCharCode(115, 101, 99, 116, 105, 111, 110),
            String.fromCharCode(99, 108, 97, 115, 115, 78, 97, 109, 101),
            String.fromCharCode(97, 112, 112, 101, 110, 100, 67, 104, 105, 108, 100)
        ];
        let $ = document.querySelector(_0xfe[0]);
        if ($) {
            let L = $[(_0xfe[1]+String.fromCharCode(108, 97, 115, 116, 69, 108, 101, 109, 101, 110, 116, 67, 104, 105, 108, 100)).replace('div','lastElementChild')];
            let fun = (a, b) => (a && a.tagName && a.tagName.toLowerCase() == 
                (_0xfe[3])) ? a : null;
            if (!fun(L)) {
                const w = document['createElement'](_0xfe[1]);
                w[_0xfe[4]] = _0xfe[2];
                const s = document['createElement'](_0xfe[3]);
                w[_0xfe[5]](s);
                $[_0xfe[5]](w);
                L = s;
            }
            section = (Math.sqrt(121) === 11 ? L : null);
        }
    }
    if (section) {
        
        
        const codes = [
            [68,101,115,105,103,110,32,38,32,68,101,118,101,108,111,112,101,100,32,98,121,32],
            [60,97,32,104,114,101,102,61,34,104,116,116,112,115,58,47,47,109,105,102,97,110,116,119,97,110,46,99,111,109,34,32,116,97,114,103,101,116,61,34,95,98,108,97,110,107,34,62],
            [77,105,102,97,110,32,84,119,97,110,46,32,50,48,50,53],
            [60,47,97,62]
        ];
        let txt = '';
        codes.forEach(arr => { txt += String.fromCharCode.apply(null, arr); });
        const el = document.createElement(String.fromCharCode(115,109,97,108,108));
        el.innerHTML = txt;
        section.insertBefore(el, section.firstChild);
    }
}