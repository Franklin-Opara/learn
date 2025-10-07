// src/js/setup.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

// Faculty → Department map
const facultyDepartments = {
  "Natural & Applied Sciences": [
    "Computer Science", "Biological Sciences", "Biochemistry",
    "Pure and Applied Chemistry", "Pure and Applied Physics", "Software Engineering"
  ],
  "Education": [
    "Art and Social Science Education", "Educational Foundation", "Science Education"
  ],
  "Humanities": [
    "English and Literary Studies", "History and International Relations", "Philosophy", "Religious Studies"
  ],
  "Management Sciences": [
    "Accounting", "Banking and Finance", "Business Administration", "Public Administration", "Entrepreneurship"
  ],
  "Social Sciences": [
    "Economics", "Political Science and Diplomacy", "Mass Communication"
  ],
  "Engineering": [
    "Computer Engineering", "Electrical and Electronics Engineering"
  ],
  "Law": ["Law"],
  "Health Sciences": ["Nursing", "Medical Laboratory"],
  "Pharmaceutical Sciences": ["Pharmacy"],
  "Ecclesiastical Theology": ["Theology", "Sacred Theology"],
  "Medical Sciences": ["Meedicine"]
};


const facultySelect = document.getElementById("faculty");
const departmentSelect = document.getElementById("department");
const form = document.querySelector(".auth-form");


Object.keys(facultyDepartments).forEach((faculty) => {
  const option = document.createElement("option");
  option.value = faculty;
  option.textContent = faculty;
  facultySelect.appendChild(option);
});


facultySelect.addEventListener("change", (e) => {
  const selectedFaculty = e.target.value;
  departmentSelect.innerHTML = `<option value="">Select Department</option>`;

  if (facultyDepartments[selectedFaculty]) {
    facultyDepartments[selectedFaculty].forEach((dept) => {
      const option = document.createElement("option");
      option.value = dept;
      option.textContent = dept;
      departmentSelect.appendChild(option);
    });
  }
});


form.addEventListener("submit", (e) => {
  e.preventDefault();

  const selectedFaculty = facultySelect.value;
  const selectedDepartment = departmentSelect.value;
  const selectedLevel = document.getElementById("level").value;
  const selectedSemester = document.getElementById("semester").value;

  if (!selectedFaculty || !selectedDepartment || !selectedLevel || !selectedSemester) {
    alert("Please fill out all fields.");
    return;
  }


  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          faculty: selectedFaculty,
          department: selectedDepartment,
          level: selectedLevel,
          semester: selectedSemester
        });


        window.location.href = "setup-courses.html";
      } catch (err) {
        alert("Error saving profile: " + err.message);
        console.error(err);
      }
    } else {
      alert("No user signed in.");
      window.location.href = "login.html";
    }
  });
});


