
import { auth, db } from "./firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const gradePoints = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  F: 0
};

const gpaForm = document.getElementById("gpa-form");
const gpaResult = document.getElementById("gpa-value");

function createCourseRow(course, idx) {
  const div = document.createElement("div");
  div.className = "course-row";
  div.innerHTML = `
    <div class="course-info">
      <p><strong>${course.code}</strong> – ${course.title}</p>
      <span>Credit Load: ${course.credit}</span>
    </div>
    <div class="grade-select">
      <label for="grade${idx}">Grade:</label>
      <select id="grade${idx}" name="grade${idx}" required>
        <option value="">--</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
        <option value="F">F</option>
      </select>
    </div>
  `;
  return div;
}

function renderCourses(courses) {
  // Remove all course rows except the template
  const form = document.getElementById("gpa-form");
  form.querySelectorAll(".course-row").forEach(row => row.remove());
  courses.forEach((course, idx) => {
    const row = createCourseRow(course, idx);
    form.insertBefore(row, form.querySelector("button[type='submit']"));
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be logged in to use the GPA calculator.");
    window.location.href = "login.html";
    return;
  }
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const courses = userSnap.exists() && userSnap.data().courses ? userSnap.data().courses : [];
  if (courses.length === 0) {
    alert("No courses found. Please add your courses first.");
    window.location.href = "setup-courses.html";
    return;
  }
  renderCourses(courses);
});

gpaForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const courseRows = gpaForm.querySelectorAll(".course-row");
  let totalPoints = 0;
  let totalCredits = 0;
  let valid = true;
  courseRows.forEach((row, idx) => {
    const grade = row.querySelector("select").value;
    const creditText = row.querySelector(".course-info span").textContent;
    const credit = parseInt(creditText.replace(/\D/g, ""), 10);
    if (!grade || isNaN(credit)) valid = false;
    totalPoints += (gradePoints[grade] || 0) * credit;
    totalCredits += credit;
  });
  if (!valid || totalCredits === 0) {
    gpaResult.textContent = "--";
    alert("Please select grades for all courses.");
    return;
  }
  const gpa = totalPoints / totalCredits;
  gpaResult.textContent = gpa.toFixed(2);
});
