import {createRoot} from 'react-dom/client';
import '@fontsource-variable/saira/wdth.css';
import App from './app/page';
import './app/globals.css';
import './app/theme.css';
createRoot(document.getElementById('root')!).render(<App/>);
