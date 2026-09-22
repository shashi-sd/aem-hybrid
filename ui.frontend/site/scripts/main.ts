import App from './App';

import './main.scss';

import './globalInit';

import { initCalixSiteChrome } from './calix';

;(function () {
    const start = () => {
        initCalixSiteChrome();
        new App(); // eslint-disable-line
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
