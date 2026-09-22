import Header from './Header';
import NavigationSectionMultilevel from './NavigationSectionMultilevel';

const INIT_FLAG = 'calixInit';

function initEach(selector: string, create: (el: HTMLElement) => void): void {
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        if (el.dataset[INIT_FLAG]) return;
        el.dataset[INIT_FLAG] = 'true';
        try {
            create(el);
        } catch (e) {
            console.error('[calix-site] init failed for', selector, e);
        }
    });
}

export function initCalixSiteChrome(): void {
    initEach('[data-calix-cmp-is="navigation-section-multilevel"]', (el) => new NavigationSectionMultilevel(el));
    initEach('[data-calix-cmp-is="header"]', (el) => new Header(el));
}
