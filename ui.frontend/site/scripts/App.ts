import { create } from './utilities/moduleLoader';
import { moduleMap } from './moduleMap';

export default class App {
    static SELECTORS = {
        MODULES: '[data-cmp-is]'
    };

    modules: any[];

    constructor() {
        this.modules = [];
        this.loadModules();
    }

    destroy() {
        this.modules.forEach((module: any) => {
            if (typeof module.destroy === 'function') {
                module.destroy();
            }
        });
    }

    loadModules() {
        create(moduleMap).then((modules) => {
            this.modules.push(modules);
        });
    }
}
