import { auth, db } from "./firebase.js";
import { doc, getDoc, collection, addDoc, getDocs, query, orderBy, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Add Assignment Page Logic
const courseSelect = document.getElementById("course");
const form = document.querySelector(".auth-form");
if (courseSelect && form) {
  // Optionally populate course dropdown from user's courses in Firestore
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("You must be logged in to add an assignment.");
      window.location.href = "login.html";
      return;
    }
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const courses = userSnap.exists() && userSnap.data().courses ? userSnap.data().courses : [];
    // Remove existing options except the first
    while (courseSelect.options.length > 1) courseSelect.remove(1);
    courses.forEach(course => {
      const opt = document.createElement("option");
      opt.value = course.code;
      opt.textContent = `${course.code} – ${course.title}`;
      courseSelect.appendChild(opt);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to add an assignment.");
      window.location.href = "login.html";
      return;
    }
    const course = courseSelect.value;
    const task = document.getElementById("task").value.trim();
    const dueDate = document.getElementById("due-date").value;
    const notes = document.getElementById("notes").value.trim();
    if (!course || !task || !dueDate) {
      alert("Please fill out all required fields.");
      return;
    }
    try {
      const assignmentData = {
        course,
        task,
        dueDate,
        notes,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, "users", user.uid, "assignments"), assignmentData);
      alert("Assignment saved!");
      window.location.href = "assignments.html";
    } catch (err) {
      alert("Error saving assignment: " + err.message);
      console.error(err);
    }
  });
}

// Assignments List Page Logic
const assignmentList = document.querySelector(".assignment-list");
if (assignmentList) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("You must be logged in to view assignments.");
      window.location.href = "login.html";
      return;
    }
    assignmentList.innerHTML = "<p>Loading assignments...</p>";
    try {
      const assignmentsRef = collection(db, "users", user.uid, "assignments");
      const q = query(assignmentsRef, orderBy("dueDate", "asc"));
      const snap = await getDocs(q);
      if (snap.empty) {
        assignmentList.innerHTML = "<p>No assignments found. <a href='add-assignment.html'>Add one?</a></p>";
        return;
      }
      assignmentList.innerHTML = "";
      snap.forEach(docSnap => {
        const a = docSnap.data();
        const id = docSnap.id;
        if (!a.course || !a.task || !a.dueDate) return;
        // Calculate days left
        const due = new Date(a.dueDate);
        const today = new Date();
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let tag = a.dueDate;
        let urgent = "";
        if (diffDays === 0) {
          tag = "Due today";
          urgent = "urgent";
        } else if (diffDays === 1) {
          tag = "Due tomorrow";
          urgent = "urgent";
        } else if (diffDays > 1 && diffDays <= 7) {
          tag = `${diffDays} days left`;
          urgent = "urgent";
        } else if (diffDays > 7 && diffDays <= 14) {
          tag = "Next week";
        }
        // Render assignment card
        const card = document.createElement("div");
        card.className = "assignment-card";
        card.innerHTML = `
          <h3>${a.course}</h3>
          <p>Due: ${a.dueDate}</p>
          <p>📍Task: ${a.task}</p>
          ${a.notes ? `<p>📝 ${a.notes}</p>` : ""}
          <div class="tag-delete">
          <span class="tag ${urgent}">${tag}</span>
          <button class="delete-btn" data-id="${id}">Delete</button>
          </div>
        `;
        assignmentList.appendChild(card);
      });
      // Add delete event listeners
      assignmentList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = btn.getAttribute('data-id');
          if (confirm('Delete this assignment?')) {
            await deleteDoc(doc(db, "users", user.uid, "assignments", id));
            btn.closest('.assignment-card').remove();
          }
        });
      });
    } catch (err) {
      assignmentList.innerHTML = `<p>Error loading assignments.</p>`;
      console.error("Error loading assignments:", err);
    }
  });
}
