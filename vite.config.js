import { defineConfig } from 'vite';
import { resolve } from 'path';

// List all your HTML entry points here
const htmlPages = [
  'index.html',
  'src/html/setup-courses.html',
  'src/html/add-assignment.html',
  'src/html/add-session.html',
  'src/html/assignments.html',
  'src/html/dashboard.html',
  'src/html/forgot-password.html',
  'src/html/gpa.html',
  'src/html/home.html',
  'src/html/login.html',
  'src/html/me.html',
  'src/html/notes.html',
  'src/html/planner.html',
  'src/html/pomodoro.html',
  'src/html/setup-1.html',
  'src/html/signup.html',
];

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: htmlPages.reduce((entries, file) => {
        // Output all HTML files to dist root
        const name = file === 'index.html' ? 'index' : file.split('/').pop().replace('.html', '');
        entries[name] = resolve(__dirname, file);
        return entries;
      }, {}),
      output: {
        entryFileNames: '[name].html',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});
