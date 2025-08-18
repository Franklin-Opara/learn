
import { auth, db } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";


// DOM elements
const noteTitleInput = document.querySelector(".note-title");
const noteBodyInput = document.querySelector(".note-body");
const saveNoteBtn = document.querySelector(".save-note-btn");
const notesList = document.querySelector(".note-items");


function renderNoteItem(note, id) {
  const li = document.createElement("li");
  li.className = "note-item";
  li.innerHTML = `
    <div class="note-content">
      <strong>${note.title || "Untitled"}</strong>
      <p>${note.body ? note.body.replace(/\n/g, "<br>") : ""}</p>
    </div>
    <button class="delete-note-btn" data-id="${id}">Delete</button>
  `;
  return li;
}

function clearNoteInputs() {
  noteTitleInput.value = "";
  noteBodyInput.value = "";
}

function showNotes(user) {
  notesList.innerHTML = "<li class='note-item'>Loading...</li>";
  const notesRef = collection(db, "users", user.uid, "notes");
  const q = query(notesRef, orderBy("createdAt", "desc"));
  getDocs(q).then(snap => {
    if (snap.empty) {
      notesList.innerHTML = "<li class='note-item'>No notes yet.</li>";
      return;
    }
    notesList.innerHTML = "";
    snap.forEach(docSnap => {
      const note = docSnap.data();
      const id = docSnap.id;
      notesList.appendChild(renderNoteItem(note, id));
    });
    // Add delete listeners
    notesList.querySelectorAll('.delete-note-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this note?')) {
          await deleteDoc(doc(db, "users", user.uid, "notes", id));
          btn.closest('.note-item').remove();
          if (!notesList.querySelector('.note-item')) {
            notesList.innerHTML = "<li class='note-item'>No notes yet.</li>";
          }
        }
      });
    });
  }).catch(() => {
    notesList.innerHTML = "<li class='note-item'>Error loading notes.</li>";
  });
}

onAuthStateChanged(auth, user => {
  if (!notesList) return;
  if (!user) {
    notesList.innerHTML = "<li class='note-item'>Please log in to view notes.</li>";
    return;
  }
  showNotes(user);

  // Notes save
  if (saveNoteBtn) {
    saveNoteBtn.onclick = async () => {
      const title = noteTitleInput.value.trim();
      const body = noteBodyInput.value.trim();
      if (!title && !body) {
        alert("Please enter a note title or body.");
        return;
      }
      try {
        await addDoc(collection(db, "users", user.uid, "notes"), {
          title,
          body,
          createdAt: new Date().toISOString()
        });
        clearNoteInputs();
        showNotes(user);
      } catch (err) {
        alert("Error saving note: " + err.message);
      }
    };
  }
});
