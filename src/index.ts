
// browser ES Module compels to have extension at the end (TS does not care if we add .js)
// browser ES Module compels to have / or ./ at the beginning, so I added in tsconfig.json an alias /app => src/
import { App } from '/app/app.js';

new App().run().then(() => console.log('Done!'));
