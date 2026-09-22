import Navigation from './Navigation';
import ScrollService from './ScrollService';

export default class Header {
    element: HTMLElement;
    navigation?: Navigation;
    headerCmp: HTMLElement | null = null;
    utilityNav: HTMLElement | null = null;

    static SELECTORS = {
        headerCmp: 'cmp-header',
        navToggle: '.cmp-utility-nav__menuToggle',
        utilityNav: '.cmp-utility-nav',
        headerNav: '.cmp-header__nav',
        nav: '[data-calix-cmp-is="navigation"]',
        overlay: '#site-overlay',
        aspectRatio: 'aspect-ratio',
        headerLogo: '.cmp-header__logo'
    };

    constructor(element: HTMLElement) {
        this.element = element;
        this.init();
    }

    init(): void {
        const S = Header.SELECTORS;
        const navComponent = this.element.querySelector<HTMLElement>(S.nav);
        const logoImg = this.element.querySelector<HTMLImageElement>(`${S.headerLogo} img`);
        if (logoImg) {
            const ratio = logoImg.getAttribute(S.aspectRatio);
            if (ratio) logoImg.style.aspectRatio = ratio;
        }
        if (navComponent) {
            this.navigation = new Navigation(navComponent);
        }
        this.headerCmp = this.element.classList.contains(S.headerCmp)
            ? this.element
            : this.element.querySelector<HTMLElement>(`.${S.headerCmp}`);
        this.utilityNav = this.element.querySelector<HTMLElement>(S.utilityNav);
        this.addOverlay();
        this.attachEventHandlers(this.element);
        ScrollService.getInstance().addCallback(this.onScroll.bind(this));
        this.onScroll();
    }

    onScroll(): void {
        if (!this.headerCmp || !this.utilityNav) return;
        const floating = window.pageYOffset >= this.utilityNav.offsetHeight;
        this.headerCmp.classList.toggle(`${Header.SELECTORS.headerCmp}--floating`, floating);
    }

    attachEventHandlers(element: HTMLElement): void {
        const S = Header.SELECTORS;
        const navToggle = element.querySelector<HTMLElement>(S.navToggle);
        const headerNav = element.querySelector<HTMLElement>(S.headerNav);
        const overlay = document.querySelector<HTMLElement>(S.overlay);
        const body = document.body;

        const openMobileMenu = () => {
            navToggle?.classList.add('cmp-utility-nav__menuToggle--expanded');
            headerNav?.classList.add('cmp-header__nav--expanded');
            overlay?.classList.add('calix-site-overlay--visible');
            body.classList.add('noscroll');
        };

        const closeMobileMenu = () => {
            navToggle?.classList.remove('cmp-utility-nav__menuToggle--expanded');
            headerNav?.classList.remove('cmp-header__nav--expanded');
            overlay?.classList.remove('calix-site-overlay--visible');
            body.classList.remove('noscroll');
            if (this.navigation && this.navigation.expanded) {
                this.navigation.closeNavigation();
            }
        };

        navToggle?.addEventListener('click', () => {
            const isOpen = headerNav?.classList.contains('cmp-header__nav--expanded');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        overlay?.addEventListener('click', closeMobileMenu);
    }

    addOverlay(): void {
        if (!this.headerCmp || document.getElementById('site-overlay')) return;
        const host = this.headerCmp.closest('header') || this.headerCmp.closest('.experiencefragment');
        if (!host || !host.parentNode) return;
        const overlay = document.createElement('div');
        overlay.id = 'site-overlay';
        overlay.className = 'calix-site-overlay';
        host.parentNode.insertBefore(overlay, host.nextSibling);
    }
}
