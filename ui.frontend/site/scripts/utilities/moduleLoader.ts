interface ModuleEntry {
    name: string;
    loader: () => Promise<any>;
}

function importModule(name: string, loader: () => Promise<any>): Promise<{ module: any; elements: NodeListOf<HTMLElement> } | null> {
    const elements = document.querySelectorAll<HTMLElement>(`[data-cmp-is="${name}"]`);

    if (elements.length === 0) return Promise.resolve(null);

    if (loader) {
        return loader()
            .then((module) => ({
                module: module.default,
                elements
            }))
            .catch((err: Error) =>
                Promise.reject(
                    new Error(`There was an error loading your JS file - ${err}`)
                )
            );
    }
    return Promise.reject(new Error(`There is no loader for ${name}`));
}

export function create(modules: ModuleEntry[]) {
    const isLoadedAttr = 'data-cmp-is-loaded';
    return Promise.all(
        modules.map(async (item) => {
            const data = await importModule(item.name, item.loader);
            const items: any[] = [];

            if (data) {
                const { module: Module, elements } = data;

                Array.from(elements).forEach(($target) => {
                    if ($target.getAttribute(isLoadedAttr) === 'true') return;

                    $target.setAttribute(isLoadedAttr, 'true');
                    items.push(new Module($target));
                });
            }

            return items;
        })
    );
}
