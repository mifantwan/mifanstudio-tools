// Import
import '../sass/library.sass'
import { onReady } from './globalInit.js';

const initLibraryList = [];

export const registerLibraryInit = (fn) => {
    if (typeof fn === 'function') {
        initLibraryList.push(fn);
    }
};

onReady(() => {
    if (!initLibraryList.length) return;
    initLibraryList.forEach((fn) => {
        try {
            fn();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    });
});