import { breakpoints } from './breakpoints';
import { actionOnClickOutside } from './utils';

export default class Navigation {
    element: HTMLElement;
    expanded: boolean;
    observer: MutationObserver;
    multilevelPanelFirstExpanded: boolean;

    static CLASSNAMES = {
        accordionButtonExpanded: 'cmp-accordion__button--expanded',
        anyExpanded: 'cmp-accordion--expanded'
    };

    static SELECTORS = {
        accordionButton: '.cmp-accordion__button',
        accordionButtonExpanded: '.cmp-accordion__button--expanded',
        accordionPanelExpanded: '.cmp-accordion__panel--expanded',
        panels: '.cmp-accordion__panel-inner',
        background: '.cmp-accordion__panel-background',
        accordionTitle: '.cmp-accordion__title',
        listItem: '.cmp-navigation-section-simple__linkListCol__list-item',
        multilevelPanel: {
            menuCol: '.cmp-navigation-section-multilevel__menu-col',
            menuButton: '.cmp-navigation-section-multilevel__menu-button',
            activeMenuitem: '.cmp-navigation-section-multilevel__menu-item.active',
            activeSubmenuitem: '.cmp-navigation-section-multilevel__submenu-item.active',
            topMenuXf: '.cmp-navigation-section-multilevel__menu-xf-container--top .cmp-experiencefragment',
            menuXf: '.cmp-navigation-section-multilevel__menu-xf-container .cmp-experiencefragment',
            submenuList: '.cmp-navigation-section-multilevel__submenu-container .cmp-navigation-section-multilevel__submenu-list',
            submenuXf: '.cmp-navigation-section-multilevel__submenu-xf-container .cmp-experiencefragment',
            activeDataAttributes: ['data-nav-top-menu-active', 'data-nav-menu-active', 'data-nav-menu-xf-active', 'data-nav-submenu-active']
        }
    };

    constructor(element: HTMLElement) {
        this.element = element;
        this.expanded = false;
        this.observer = new MutationObserver(this.handleMutation.bind(this));
        this.multilevelPanelFirstExpanded = false;
        this.init();
    }

    init(): void {
        this.desktopChecker();
    }

    handleMutation(mutationList: MutationRecord[]): void {
        const S = Navigation.SELECTORS;
        for (const mutation of mutationList) {
            if (mutation.attributeName === 'data-cmp-expanded') {
                const anyExpanded = this.element.querySelector(S.accordionButtonExpanded);
                const setBackgroundHeight = () => {
                    const background = this.element.querySelector<HTMLElement>(S.background);
                    const panel = this.element.querySelector<HTMLElement>(S.accordionPanelExpanded);
                    if (background && panel) background.style.height = `${panel.offsetHeight}px`;
                };
                const clearAllListeners = () => {
                    this.element.querySelectorAll<any>(S.panels).forEach((panel) => {
                        if ('clearListener' in panel) panel.clearListener();
                    });
                };
                if (anyExpanded) {
                    this.expanded = true;
                    this.element.classList.add(Navigation.CLASSNAMES.anyExpanded);
                    clearAllListeners();
                    const expandedPanel = this.element.querySelector(S.accordionPanelExpanded);
                    const expandedPanelInner = expandedPanel ? expandedPanel.querySelector(S.panels) : null;
                    if (!expandedPanelInner) continue;
                    actionOnClickOutside(expandedPanelInner, () => this.closeNavigation(), {
                        exceptionClassArray: [
                            'cmp-accordion__header',
                            'cmp-accordion__button',
                            'cmp-accordion__title',
                            'cmp-accordion__icon'
                        ]
                    });
                    if (expandedPanelInner.querySelector(S.multilevelPanel.menuCol)) {
                        if (!this.multilevelPanelFirstExpanded) {
                            setBackgroundHeight();
                            this.multilevelPanelFirstExpanded = true;
                        }
                    } else {
                        setBackgroundHeight();
                    }
                } else {
                    this.expanded = false;
                    this.element.classList.remove(Navigation.CLASSNAMES.anyExpanded);
                    clearAllListeners();
                }
            } else {
                const background = this.element.querySelector<HTMLElement>(S.background);
                const menuColEl = this.element.querySelector<HTMLElement>(S.multilevelPanel.menuCol);
                if (!background || !menuColEl) continue;
                const initialHeight = background.offsetHeight;
                const activeMenuitem = this.element.querySelector(S.multilevelPanel.activeMenuitem);
                const activeSubmenuitem = this.element.querySelector(S.multilevelPanel.activeSubmenuitem);
                if (activeMenuitem) {
                    const l2Child = activeMenuitem.querySelector<HTMLElement>(S.multilevelPanel.submenuList) ||
                        activeMenuitem.querySelector<HTMLElement>(S.multilevelPanel.topMenuXf) ||
                        activeMenuitem.querySelector<HTMLElement>(S.multilevelPanel.menuXf);
                    let maxActiveChildHeight = l2Child ? l2Child.offsetHeight : 0;
                    if (activeSubmenuitem) {
                        const l3Child = activeSubmenuitem.querySelector<HTMLElement>(S.multilevelPanel.submenuXf);
                        if (l3Child && l3Child.offsetHeight > maxActiveChildHeight) {
                            maxActiveChildHeight = l3Child.offsetHeight;
                        }
                    }
                    if (maxActiveChildHeight + 98 > initialHeight) {
                        menuColEl.style.height = `${maxActiveChildHeight + 96}px`;
                    } else {
                        menuColEl.removeAttribute('style');
                    }
                } else {
                    menuColEl.removeAttribute('style');
                }
            }
        }
    }

    closeNavigation(): void {
        const expandedButton = this.element.querySelector<HTMLElement>(Navigation.SELECTORS.accordionButtonExpanded);
        this.expanded = false;
        this.element.classList.remove(Navigation.CLASSNAMES.anyExpanded);
        this.removeMultilevelActive();
        if (expandedButton) {
            expandedButton.click();
            expandedButton.blur();
        }
    }

    removeMultilevelActive(): void {
        const { activeMenuitem, activeSubmenuitem, activeDataAttributes, menuCol, menuButton } = Navigation.SELECTORS.multilevelPanel;
        const activeMenuItem = this.element.querySelector(activeMenuitem);
        const activeSubmenuItem = this.element.querySelector(activeSubmenuitem);
        const menuColEl = this.element.querySelector(menuCol);
        if (activeMenuItem) {
            activeMenuItem.classList.remove('active');
            activeMenuItem.querySelector(menuButton)?.setAttribute('aria-expanded', 'false');
        }
        if (activeSubmenuItem) {
            activeSubmenuItem.classList.remove('active');
            activeSubmenuItem.querySelector(menuButton)?.setAttribute('aria-expanded', 'false');
        }
        activeDataAttributes.forEach((attr) => this.element.removeAttribute(attr));
        if (menuColEl) menuColEl.removeAttribute('style');
    }

    desktopChecker(): void {
        const desktopMedia = window.matchMedia(`(min-width: ${breakpoints.large})`);

        const matchMediaChangeHandler = () => {
            this.closeNavigation();
            if (desktopMedia.matches) {
                this.observer.observe(this.element, {
                    attributes: true,
                    attributeFilter: ['data-cmp-expanded', ...Navigation.SELECTORS.multilevelPanel.activeDataAttributes],
                    attributeOldValue: true,
                    subtree: true
                });
            } else {
                this.observer.disconnect();
            }
        };

        if ('addEventListener' in desktopMedia) {
            desktopMedia.addEventListener('change', matchMediaChangeHandler);
        } else if ('addListener' in desktopMedia) {
            (desktopMedia as any).addListener(matchMediaChangeHandler);
        }
        matchMediaChangeHandler();
    }
}
