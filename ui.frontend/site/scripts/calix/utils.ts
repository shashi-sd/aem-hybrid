export function actionOnClickOutside(
    element: any,
    action: () => void,
    params: { exceptionClassArray?: string[]; useCapture?: boolean } = {}
): void {
    const exceptionClassArray = params.exceptionClassArray || [];
    const useCapture = params.useCapture || false;

    const outsideClickListener = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (
            !element.contains(target) &&
            target.classList && target.classList.length &&
            !exceptionClassArray.some((className) => target.classList.contains(className))
        ) {
            action();
            removeClickListener();
        }
    };

    const removeClickListener = () => {
        document.removeEventListener('click', outsideClickListener, useCapture);
    };

    document.addEventListener('click', outsideClickListener, useCapture);
    element.clearListener = removeClickListener;
}
