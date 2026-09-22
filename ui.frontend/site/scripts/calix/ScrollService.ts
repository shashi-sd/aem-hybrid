let id = 0;

type ScrollEntry = { id: number; callback: () => void };

export default class ScrollService {
    private static instance: ScrollService;

    callbacks: ScrollEntry[] = [];
    ticking = false;

    static getInstance(): ScrollService {
        if (!ScrollService.instance) {
            ScrollService.instance = new ScrollService();
        }
        return ScrollService.instance;
    }

    constructor() {
        window.addEventListener('scroll', () => {
            if (!this.ticking) {
                window.requestAnimationFrame(() => this.onScroll());
                this.ticking = true;
            }
        }, { passive: true });
    }

    onScroll(): void {
        this.callbacks.forEach((entry) => entry.callback());
        this.ticking = false;
    }

    addCallback(callback: () => void): () => void {
        const entryId = id++;
        this.callbacks.push({ id: entryId, callback });
        return () => {
            this.callbacks = this.callbacks.filter((item) => item.id !== entryId);
        };
    }
}
