export default class NavigationSectionMultilevel {
    element: HTMLElement;

    static SELECTORS = {
        megaNav: 'nav[data-calix-cmp-is="navigation"]',
        navButton: '.cmp-navigation-section-multilevel__menu-button',
        backButton: '.cmp-navigation-section-multilevel__back-btn'
    };

    static CLASSNAMES = {
        menuItemClass: 'cmp-navigation-section-multilevel__menu-item',
        topMenuClass: 'cmp-navigation-section-multilevel__menu-item--top',
        hasSubmenuClass: 'has-submenu',
        topMenuActive: 'nav-top-menu-active',
        menuActive: 'nav-menu-active',
        menuXfActive: 'nav-menu-xf-active',
        submenuActive: 'nav-submenu-active'
    };

    constructor(element: HTMLElement) {
        this.element = element;
        this.init();
    }

    init(): void {
        const { megaNav, navButton, backButton } = NavigationSectionMultilevel.SELECTORS;
        const { menuItemClass, topMenuClass, hasSubmenuClass, topMenuActive, menuActive, menuXfActive, submenuActive } =
            NavigationSectionMultilevel.CLASSNAMES;
        const navComponent = this.element.closest(megaNav);

        const removeActive = (item: Element | null) => {
            if (!item) return;
            item.classList.remove('active');
            item.querySelector(navButton)?.setAttribute('aria-expanded', 'false');
            const activeChild = item.querySelector('.active');
            if (activeChild) {
                activeChild.classList.remove('active');
                activeChild.querySelector(navButton)?.setAttribute('aria-expanded', 'false');
            }
        };

        const toggleNavActive = (node: Element | null, addClass: boolean) => {
            if (!node) return;
            const root = navComponent || this.element;
            const isMenuitem = node.classList.contains(menuItemClass);
            const isTopMenu = node.classList.contains(topMenuClass);
            const hasSubmenu = node.classList.contains(hasSubmenuClass);
            const toggled = isTopMenu ? topMenuActive : (isMenuitem ? (hasSubmenu ? menuActive : menuXfActive) : submenuActive);
            if (addClass) {
                root.setAttribute(`data-${toggled}`, '');
            } else {
                root.removeAttribute(`data-${toggled}`);
            }
        };

        this.element.querySelectorAll(navButton).forEach((button) => {
            button.addEventListener('click', (event) => {
                const parent = (event.target as HTMLElement).closest('li');
                if (!parent) return;
                if (parent.classList.contains('active')) {
                    removeActive(parent);
                    toggleNavActive(parent, false);
                } else {
                    const currentActive = parent.parentNode ? (parent.parentNode as Element).querySelector('.active') : null;
                    removeActive(currentActive);
                    toggleNavActive(currentActive, false);
                    toggleNavActive(parent, true);
                    parent.classList.add('active');
                    parent.querySelector(navButton)?.setAttribute('aria-expanded', 'true');
                }
            });
        });

        this.element.querySelectorAll(backButton).forEach((button) => {
            button.addEventListener('click', (event) => {
                const parent = (event.target as HTMLElement).closest('li');
                if (!parent) return;
                parent.classList.remove('active');
                parent.querySelector(navButton)?.setAttribute('aria-expanded', 'false');
                toggleNavActive(parent, false);
            });
        });
    }
}
