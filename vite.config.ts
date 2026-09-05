import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json' with {type:'json'};
import release from './release-notes.json' with {type:'json'};
export default defineConfig(({command,isPreview})=>({
 base:command==='build'||isPreview?'/090990999/':'/',
 define:{__APP_VERSION__:JSON.stringify(pkg.version)},
 plugins:[react(),{
  name:'app-version',
  generateBundle(){this.emitFile({type:'asset',fileName:'version.json',source:JSON.stringify({version:pkg.version,...release,publishedAt:new Date().toISOString()})});},
  configureServer(server){server.middlewares.use('/version.json',(_req,res)=>{res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify({version:pkg.version,...release,publishedAt:''}));});}
 }],
 build:{rolldownOptions:{output:{codeSplitting:{groups:[{name(id){if(/node_modules[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/.test(id))return 'motion';return null;}}]}}}}
}));


