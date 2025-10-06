import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Helper to get element by ID
function $(id) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`Element with id '${id}' not found.`);
  }
  return el;
}

// Handle Forgot Password
const forgotForm = document.querySelector(".auth-form");
const forgotPage = window.location.pathname.includes("forgot-password.html");
if (forgotForm && forgotPage) {
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const emailInput = $("email");
    if (!emailInput) return;
    const email = emailInput.value.trim();
    let message = document.getElementById("message");
    if (!message) {
      message = document.createElement("p");
      message.id = "message";
      forgotForm.parentNode.insertBefore(message, forgotForm);
    }
    try {
      await sendPasswordResetEmail(auth, email);
      message.textContent = "Password reset email sent! Check your inbox.";
      message.className = "success";
    } catch (error) {
      message.textContent = `Error: ${error.message}`;
      message.className = "error";
      console.error("Password reset error:", error);
    }
  });
} else if (forgotPage && !forgotForm) {
  console.warn("Forgot password form not found on page.");
}

// Handle Sign Up
const signupForm = $("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const firstnameInput = $("firstname");
    const lastnameInput = $("lastname");
    const emailInput = $("email");
    const passwordInput = $("password");
    if (!firstnameInput || !lastnameInput || !emailInput || !passwordInput) return;
    const firstname = firstnameInput.value.trim();
    const lastname = lastnameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store full name in Firestore under "users" collection
      await setDoc(doc(db, "users", user.uid), {
        firstname: firstname,
        lastname: lastname,
        email: email,
        uid: user.uid
      });

      alert("Signup successful! You can now log in.");
      window.location.href = "setup-1.html";
    } catch (error) {
      alert("Signup error: " + error.message);
      console.error("Signup error:", error);
    }
  });
} else if ($("signup-form") === null) {
  console.warn("Signup form not found on page.");
}

// Handle Login
const loginForm = $("login-form");
let message = document.getElementById("message");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const emailInput = $("email");
    const passwordInput = $("password");
    if (!emailInput || !passwordInput) return;
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!message) {
      message = document.createElement("p");
      message.id = "message";
      loginForm.parentNode.insertBefore(message, loginForm);
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      message.textContent = "Log in Successful";
      message.className = "success";
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);
    } catch (error) {
      message.textContent = `Unsuccessful ${error.message}`;
      message.className = "error";
      console.error("Login error:", error);
    }
  });
} else if ($("login-form") === null) {
  console.warn("Login form not found on page.");
}



