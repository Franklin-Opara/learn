import { auth, db } from "./firebase.js";
import { doc, setDoc } from "firebase/firestore";

// Handle dynamic course row addition
window.addCourseRow = function () {
  const courseContainer = document.querySelector(".auth-form");

  const courseBlock = document.createElement("div");
  courseBlock.classList.add("course-block");

  courseBlock.innerHTML = `
    <label>Course Code</label>
    <input type="text" placeholder="e.g. CSC101" required>

    <label>Course Title</label>
    <input type="text" placeholder="e.g. Introduction to Programming" required>

    <label>Credit Load</label>
    <input type="number" placeholder="e.g. 3" min="1" max="6" required>
  `;

  // Insert above the buttons
  const addButton = courseContainer.querySelector("button[type='button']");
  courseContainer.insertBefore(courseBlock, addButton);
};

// Handle form submission
document.getElementById("course-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to save your courses.");
    return;
  }

  const courseBlocks = document.querySelectorAll(".course-block");
  const courses = [];

  courseBlocks.forEach((block) => {
    const inputs = block.querySelectorAll("input");
    const code = inputs[0].value.trim().toUpperCase();
    const title = inputs[1].value.trim();
    const credit = parseInt(inputs[2].value, 10);

    if (code && title && !isNaN(credit)) {
      courses.push({ code, title, credit });
    }
  });

  if (courses.length === 0) {
    alert("Please add at least one course.");
    return;
  }

  try {
    await setDoc(doc(db, "users", user.uid), {
      courses: courses,
    }, { merge: true });

    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Error saving courses:", error);
    alert("There was an error saving your courses. Please try again.");
  }
});
