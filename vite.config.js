import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        setupCourses: resolve(__dirname, 'src/html/setup-courses.html'),
        addAssignment: resolve(__dirname, 'src/html/add-assignment.html'),
        addSession: resolve(__dirname, 'src/html/add-session.html'),
        assignments: resolve(__dirname, 'src/html/assignments.html'),
        dashboard: resolve(__dirname, 'src/html/dashboard.html'),
        forgotPassword: resolve(__dirname, 'src/html/forgot-password.html'),
        gpa: resolve(__dirname, 'src/html/gpa.html'),
        home: resolve(__dirname, 'src/html/home.html'),
        login: resolve(__dirname, 'src/html/login.html'),
        me: resolve(__dirname, 'src/html/me.html'),
        notes: resolve(__dirname, 'src/html/notes.html'),
        planner: resolve(__dirname, 'src/html/planner.html'),
        pomodoro: resolve(__dirname, 'src/html/pomodoro.html'),
        setup1: resolve(__dirname, 'src/html/setup-1.html'),
        signup: resolve(__dirname, 'src/html/signup.html'),
        // Add any other HTML pages here
      }
    }
  }
});
