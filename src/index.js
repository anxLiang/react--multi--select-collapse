import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'tinper-bee/assets/tinper-bee.css';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
