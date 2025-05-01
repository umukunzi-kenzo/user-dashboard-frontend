const API_BASE = 'http://localhost:3000';
const userTableBody = document.getElementById("user-table-body");
const modal = document.getElementById("add-user-modal");
const addUserBtn = document.getElementById("add-user-button");
const closeModalBtn = document.querySelector(".close");
const addUserForm = document.getElementById("add-user-form");

// Login modal elements
const loginModal = document.getElementById("login-modal");
const showLoginBtn = document.getElementById("show-login-button");
const closeLoginBtn = document.getElementById("close-login-modal");
const loginForm = document.getElementById("login-form");

let isAuthenticated = false; // 🌟 New flag to track if the user is logged in
let loggedInUserId = null; // 🌟 Store logged-in user's ID

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
    isAuthenticated = true; // 🌟 If fetch succeeds, user is authenticated
  } catch (err) {
    console.error("Error fetching users:", err.response?.data || err.message);
    isAuthenticated = false; // 🌟 If fetch fails, user is not authenticated
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
      isAuthenticated = true; // 🌟 Update flag
      loggedInUserId = res.data.userId; // 🌟 Store logged-in user's ID
      fetchUsers(); // Fetch users after login
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
userTableBody.addEventListener('click', async function (e) {
  const deleteBtn = e.target.closest('button.delete-btn');
  const updateBtn = e.target.closest('button.update-btn');
  const tr = e.target.closest('tr');

  if (!tr) return;

  const userId = tr.getAttribute('data-user-id');

  if (!isAuthenticated) {
    alert("Please login first to update or delete users.");
    return;
  }

  // Check if logged-in user is the same as the user being updated
  if (updateBtn && userId !== loggedInUserId) {
    alert("You can only update your own information.");
    return;
  }

  if (deleteBtn) {
    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
      try {
        await axios.delete(`${API_BASE}/users/${userId}`, {
          withCredentials: true
        });

        tr.remove();
        alert("User deleted successfully!");
      } catch (err) {
        console.error("Failed to delete user:", err.response?.data || err.message);
        alert("Failed to delete user.");
      }
    }
  }

  if (updateBtn) {
    const usernameElement = tr.querySelector('strong');
    const emailElement = tr.querySelector('span');

    if (!usernameElement || !emailElement) {
      console.error('Username or email elements not found inside the row.');
      return;
    }

    const currentUsername = usernameElement.innerText;
    const currentEmail = emailElement.innerText;

    const newUsername = prompt("Edit username:", currentUsername);
    const newEmail = prompt("Edit email:", currentEmail);

    if (newUsername && newEmail) {
      try {
        await axios.put(`${API_BASE}/users/${userId}`, {
          username: newUsername,
          email: newEmail
        }, {
          withCredentials: true
        });

        usernameElement.innerText = newUsername;
        emailElement.innerText = newEmail;
        alert("User updated successfully!");
      } catch (err) {
        console.error("Failed to update user:", err.response?.data || err.message);
        alert("Failed to update user.");
      }
    } else {
      alert("Update cancelled. No empty fields allowed.");
    }
  }
});

// 🏁 Do not fetch users immediately — fetch only after login

