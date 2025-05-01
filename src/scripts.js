const API_BASE = 'http://localhost:3000';
const userTableBody = document.getElementById("user-table-body");
const modal = document.getElementById("add-user-modal");
const addUserBtn = document.getElementById("add-user-button");
const closeModalBtn = document.querySelector(".close");
const addUserForm = document.getElementById("add-user-form");


// Reference modals and buttons
const updateModal = document.getElementById("update-user-modal");
const updateForm = document.getElementById("update-user-form");
const closeUpdateModalBtn = document.getElementById("close-update-modal");

const deleteModal = document.getElementById("delete-user-modal");
const confirmDeleteBtn = document.getElementById("confirm-delete-button");
const cancelDeleteBtn = document.getElementById("cancel-delete-button");

// Login modal elements
const loginModal = document.getElementById("login-modal");
const showLoginBtn = document.getElementById("show-login-button");
const closeLoginBtn = document.getElementById("close-login-modal");
const loginForm = document.getElementById("login-form");

let isAuthenticated = false;
let loggedInUserId = null;

// Show "Add User" modal
addUserBtn.onclick = () => {
  if (!isAuthenticated) {
    alert("Please login first to add users.");
    return;
  }
  modal.style.display = "block";
};

// Hide "Add User" modal
closeModalBtn.onclick = () => {
  modal.style.display = "none";
};

// Show Login modal
showLoginBtn.onclick = () => {
  loginModal.style.display = "block";
};

// Hide Login modal
closeLoginBtn.onclick = () => {
  loginModal.style.display = "none";
};

// Hide modals if user clicks outside them
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
  if (e.target === loginModal) loginModal.style.display = "none";
};

// Fetch users from backend
async function fetchUsers() {
  try {
    const res = await axios.get(`${API_BASE}/users`, {
      withCredentials: true
    });
    const users = res.data;
    userTableBody.innerHTML = "";
    users.forEach(user => renderUser(user));
    document.querySelector(".number-of-users").textContent = users.length;
    isAuthenticated = true;
  } catch (err) {
    console.error("Error fetching users:", err.response?.data || err.message);
    isAuthenticated = false;
    alert("Please login first to access users.");
  }
}

// Render a single user row
function renderUser(user) {
  const tr = document.createElement("tr");
  tr.setAttribute('data-user-id', user._id);

  tr.innerHTML = `
    <td><input type="checkbox" /></td>
    <td>
      <div class="user-info">
        <img class="profile-img" src="https://i.pravatar.cc/40?u=${user.email}" alt="Profile" />
      </div>
      <strong>${user.username}</strong><br><br>
      <span>${user.email}</span>
    </td>
    <td><span class="badge admin">Admin</span></td>
    <td>Just now</td>
    <td>Just now</td>
    <td class="actions">
      <span class="three-dots">⋮</span>
      <div class="dropdown">
        <button class="view-btn"><i class="fa-solid fa-user"></i> View</button>
        <button class="update-btn"><i class="fas fa-pen-to-square"></i> Update</button>
        <button class="delete-btn"><i class="fas fa-trash-alt"></i> Delete</button>
      </div>
    </td>
  `;
  userTableBody.appendChild(tr);
}

// Add user
addUserForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!isAuthenticated) {
    alert("Please login first to add users.");
    return;
  }

  const { username, email, password } = addUserForm;

  try {
    const res = await axios.post(`${API_BASE}/auth/register`, {
      username: username.value,
      email: email.value,
      password: password.value
    }, {
      withCredentials: true
    });

    if (res.data) {
      renderUser(res.data);
      addUserForm.reset();
      modal.style.display = "none";
    }
  } catch (err) {
    console.error("Error adding user:", err.response?.data || err.message);
    alert("Failed to add user.");
  }
};

// Login form handler
loginForm.onsubmit = async (e) => {
  e.preventDefault();
  const { email, password } = loginForm;

  try {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email: email.value,
      password: password.value
    }, {
      withCredentials: true
    });

    if (res.data) {
      alert("Login successful!");
      loginModal.style.display = "none";
      isAuthenticated = true;
      loggedInUserId = res.data.userId;
      fetchUsers();
    }
  } catch (err) {
    console.error("Login failed:", err.response?.data || err.message);
    isAuthenticated = false;
    alert("Login failed. Please check your credentials.");
  }
};

// Dropdown toggle
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('three-dots')) {
    const dropdown = e.target.nextElementSibling;
    document.querySelectorAll('.dropdown').forEach(d => {
      if (d !== dropdown) d.classList.remove('show');
    });
    dropdown.classList.toggle('show');
  } else if (!e.target.closest('.actions')) {
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('show'));
  }
});

// Handle clicks on Update and Delete buttons dynamically
let currentUserId = null;

// Close buttons
closeUpdateModalBtn.onclick = () => updateModal.style.display = "none";
cancelDeleteBtn.onclick = () => deleteModal.style.display = "none";

// Handle click outside
window.onclick = function(e) {
  if (e.target === updateModal) updateModal.style.display = "none";
  if (e.target === deleteModal) deleteModal.style.display = "none";
};

// Handle table actions
userTableBody.addEventListener("click", function(e) {
  const updateBtn = e.target.closest("button.update-btn");
  const deleteBtn = e.target.closest("button.delete-btn");
  const tr = e.target.closest("tr");

  if (!tr) return;
  const userId = tr.getAttribute("data-user-id");

  if (updateBtn) {
    const username = tr.querySelector("strong").innerText;
    const email = tr.querySelector("span").innerText;
    updateForm.elements["username"].value = username;
    updateForm.elements["email"].value = email;
    currentUserId = userId;
    updateModal.style.display = "block";
  }

  if (deleteBtn) {
    currentUserId = userId;
    deleteModal.style.display = "block";
  }
});

// Handle update form submission
updateForm.onsubmit = async (e) => {
  e.preventDefault();
  const username = updateForm.elements["username"].value;
  const email = updateForm.elements["email"].value;

  try {
    await axios.put(`${API_BASE}/users/${currentUserId}`, { username, email }, { withCredentials: true });
    updateModal.style.display = "none";
    fetchUsers();
    alert("User updated successfully!");
  } catch (err) { 
    console.error("Update failed:", err);
    alert("Failed to update user.");
  }
};

// Handle delete confirmation
confirmDeleteBtn.onclick = async () => {
  try {
    await axios.delete(`${API_BASE}/users/${currentUserId}`, { withCredentials: true });
    deleteModal.style.display = "none";
    fetchUsers();
    alert("User deleted successfully!");
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Failed to delete user.");
  }
};