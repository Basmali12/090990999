import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({command})=>({base:command==='build'?'/090990999/':'/',plugins:[react()],build:{rolldownOptions:{output:{codeSplitting:{groups:[{name(id){if(/node_modules[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/.test(id))return 'motion';return null;}}]}}}}}));

