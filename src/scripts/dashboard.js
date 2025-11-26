document.addEventListener("DOMContentLoaded", () => {
  const toggleMode = document.getElementById("toggleMode");

  // Check if user has a preference
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
  }

  if (toggleMode) {
    toggleMode.addEventListener("click", () => {
      document.body.classList.toggle("light-mode");

      // Save user preference
      if (document.body.classList.contains("light-mode")) {
        localStorage.setItem("theme", "light");
      } else {
        localStorage.setItem("theme", "dark");
      }
    });
  }
});

// Utility
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

// Auth helpers
async function getUserData() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to fetch user data");
    return await response.json();
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

function applyRoleRestrictions(role) {
  const createPostEl = document.getElementById("createPostSection");
  if (!role || ["user", "reactor", "commenter"].includes(role)) {
    if (createPostEl) createPostEl.style.display = "none";
  } else {
    if (createPostEl) createPostEl.style.display = "block";
  }
}

async function showManageUsers() {
  const user = await getUserData();
  const manageUsersSection = document.querySelector(".manage-users");

  if (!manageUsersSection) return;
  if (!user || user.role !== "admin") {
    manageUsersSection.style.display = "none";
  } else {
    manageUsersSection.style.display = "block";
  }
}

// Users list rendering (admin only UI)
async function fetchUsers() {
  const token = localStorage.getItem("token");
  if (!token) return; // Guests don't need this

  try {
    const user = await getUserData();
    if (!user) return;

    const response = await fetch("/api/users", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to fetch users");

    const users = await response.json();
    const filteredUsers = users.filter((u) => u.username !== user.username);
    displayUsers(filteredUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

function displayUsers(users) {
  const usersList = document.getElementById("usersList");
  if (!usersList) return;
  usersList.innerHTML = "";

  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <span>${user.username}</span>
            <select class="role-select" data-username="${user.username}">
                <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
                <option value="poster" ${user.role === "poster" ? "selected" : ""}>Poster</option>
                <option value="commenter" ${user.role === "commenter" ? "selected" : ""}>Commenter</option>
                <option value="reactor" ${user.role === "reactor" ? "selected" : ""}>Reactor</option>
                <option value="user" ${user.role === "user" ? "selected" : ""}>User</option>
            </select>
        `;
    usersList.appendChild(li);
  });

  document.querySelectorAll(".role-select").forEach((select) => {
    select.addEventListener("change", async (event) => {
      const username = event.target.dataset.username;
      const newRole = event.target.value;
      await updateUserRole(username, newRole);
    });
  });
}

async function updateUserRole(username, role) {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch("/api/users/assign-role", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username, role }),
    });

    if (!response.ok) throw new Error("Failed to update role");

    alert(`Role updated: ${username} is now a ${role}`);
  } catch (error) {
    console.error("Error updating role:", error);
  }
}

// Create Post helpers
let selectedImage = null;
function resetCreatePostForm() {
  const titleEl = document.getElementById("postTitle");
  const descEl = document.getElementById("postDescription");
  const imgEl = document.getElementById("postImage");
  const preview = document.getElementById("imagePreview");
  if (titleEl) titleEl.value = "";
  if (descEl) descEl.value = "";
  if (imgEl) imgEl.value = "";
  selectedImage = null;
  if (preview) preview.style.display = "none";
}

// Setup post creation form
document.addEventListener("DOMContentLoaded", async () => {
  const user = await getUserData();

  if (!user || (user.role !== "poster" && user.role !== "admin")) {
    const createPostEl = document.getElementById("createPostSection");
    if (createPostEl) createPostEl.style.display = "none";
    return;
  }

  const postImageEl = document.getElementById("postImage");
  if (postImageEl) {
    postImageEl.addEventListener("change", (event) => {
      const file = event.target.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
          selectedImage = e.target.result;
          const preview = document.getElementById("imagePreview");
          if (preview) {
            preview.src = selectedImage;
            preview.style.display = "block";
          }
        };

        reader.readAsDataURL(file);
      } else {
        selectedImage = null;
        const preview = document.getElementById("imagePreview");
        if (preview) preview.style.display = "none";
      }
    });
  }

  const discardBtn = document.getElementById("discardPost");
  if (discardBtn) {
    discardBtn.addEventListener("click", () => {
      resetCreatePostForm();
    });
  }

  const submitBtn = document.getElementById("submitPost");
  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      const title = document.getElementById("postTitle").value.trim();
      const description = document.getElementById("postDescription").value.trim();
      const user = await getUserData();

      if (!user || (user.role !== "poster" && user.role !== "admin")) {
        alert("You are not authorized to create posts!");
        return;
      }

      if (!title || !description) {
        alert("Title and description are required!");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      
      const imageFile = document.getElementById("postImage").files[0];
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (selectedImage) {
        // If selectedImage exists but no file (e.g., from database), send as imageUrl
        formData.append("imageUrl", selectedImage);
      }

      try {
        const response = await fetch("/api/posts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });

        if (!response.ok) throw new Error("Failed to create post");

        resetCreatePostForm();
        fetchPosts();
      } catch (error) {
        console.error("Error creating post:", error);
        alert("Failed to create post");
      }
    });
  }
});

// Posts API
async function fetchPosts() {
  try {
    const response = await fetch("/api/posts");
    if (!response.ok) throw new Error("Failed to fetch posts");

    const data = await response.json();
    const posts = data.posts || data;
    displayPosts(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}

async function displayPosts(posts) {
  const postsContainer = document.getElementById("postsContainer");
  const user = await getUserData();

  if (!postsContainer) return;
  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    if (!Array.isArray(post.comments)) post.comments = [];

    const postElement = document.createElement("div");
    postElement.classList.add("post");

    const isAuthed = !!user;
    const canLike = isAuthed && user.role !== "user";
    const canComment = isAuthed && user.role !== "user" && user.role !== "reactor";
    const canDelete = isAuthed && (user.role === "admin" || (user.role === "poster" && post.username === user.username));

    let likeButton = `<button ${canLike ? `onclick="likePost('${post._id}')"` : `data-require-auth="like" data-post-id="${post._id}"`}>
        👍<span class="like-count" id="likes-${post._id}">${post.likes}</span>
      </button>`;

    let dislikeButton = `<button ${canLike ? `onclick="dislikePost('${post._id}')"` : `data-require-auth="dislike" data-post-id="${post._id}"`}>
        👎<span class="dislike-count" id="dislikes-${post._id}">${post.dislikes}</span>
      </button>`;

    let commentSection = canComment
      ? `
            <div class="comment-form">
              <input type="text" id="comment-input-${post._id}" placeholder="Write a comment..." class="comment-input">
              <button onclick="addComment('${post._id}')" class="comment-btn">Post</button>
            </div>
        `
      : `
            <button class="btn" data-require-auth="comment" data-post-id="${post._id}">Comment</button>
        `;

    let deleteButton = canDelete
      ? `<button onclick="deletePost('${post._id}')">🗑️</button>`
      : "";

    postElement.innerHTML = `
            <h3>Posted by: <strong>${post.username}</strong></h3>
            <h4 style="margin-top: 5px;">${post.title}</h4>
            <p2>${post.description}</p2>
            ${post.image ? `<img src="${post.image}" alt="Post Image" class="post-image">` : ""}

            <div class="post-actions">
                ${likeButton}
                ${dislikeButton}
                ${canComment ? `<button onclick="toggleCommentSection('${post._id}')">💬</button>` : ''}
                ${deleteButton}
            </div>
            <div class="divider"></div>
            <div class="comments">
                <h4>Comments</h4>
                <ul id="comments-${post._id}">
                    ${post.comments
                      .map(
                        (comment) => `
                        <li>
                            <strong>${comment.username}:</strong> ${comment.text}
                            ${isAuthed && comment.username === user.username ? `<button onclick="deleteComment('${post._id}', '${comment._id}')">🗑️</button>` : ""}
                        </li>
                    `
                      )
                      .join("")}
                </ul>
                ${commentSection}
            </div>
        `;

    postsContainer.appendChild(postElement);
  });
}

async function addComment(postId) {
  const user = await getUserData();
  if (!user) {
    openAuthModal("comment");
    return;
  }
  if (user.role === "user" || user.role === "reactor") return;

  const commentInput = document.getElementById(`comment-input-${postId}`);
  if (!commentInput) return;

  const text = commentInput.value.trim();
  if (!text) return;

  try {
    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error("Failed to add comment");

    commentInput.value = "";
    fetchPosts();
  } catch (error) {
    console.error("Error adding comment:", error);
    alert("Failed to add comment");
  }
}

async function deleteComment(postId, commentId) {
  const user = await getUserData();
  if (!user || user.role === "user" || user.role === "reactor" || user.role === "commenter") return;

  try {
    const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) throw new Error("Failed to delete comment");

    fetchPosts();
  } catch (error) {
    console.error("Error deleting comment:", error);
    alert("Failed to delete comment");
  }
}

function deletePost(postId) {
  const userPromise = getUserData();
  // handle async check
  userPromise.then((user) => {
    if (!user) {
      openAuthModal("delete");
      return;
    }
    if (!user || user.role === "user" || user.role === "reactor" || user.role === "commenter") return;

    if (!confirm("Are you sure you want to delete this post?")) return;

    fetch(`/api/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete post");
        fetchPosts();
      })
      .catch((error) => {
        console.error("Error deleting post:", error);
        alert("Failed to delete post");
      });
  });
}

function likePost(postId) {
  const userPromise = getUserData();
  userPromise.then((user) => {
    if (!user) {
      openAuthModal("like");
      return;
    }
    if (user.role === "user" || user.role === "reactor") return;

    fetch(`/api/posts/${postId}/like`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to like post");
        return res.json();
      })
      .then((post) => {
        const el = document.getElementById(`likes-${postId}`);
        if (el) el.textContent = post.likes;
      })
      .catch((error) => {
        console.error("Error liking post:", error);
      });
  });
}

function dislikePost(postId) {
  const userPromise = getUserData();
  userPromise.then((user) => {
    if (!user) {
      openAuthModal("dislike");
      return;
    }
    if (user.role === "user" || user.role === "reactor") return;

    fetch(`/api/posts/${postId}/dislike`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to dislike post");
        return res.json();
      })
      .then((post) => {
        const el = document.getElementById(`dislikes-${postId}`);
        if (el) el.textContent = post.dislikes;
      })
      .catch((error) => {
        console.error("Error disliking post:", error);
      });
  });
}

// Modal helpers and wiring
function openAuthModal(intent) {
  const modal = qs('#authModal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'false');
  modal.dataset.intent = intent || '';
}
function closeAuthModal() {
  const modal = qs('#authModal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  delete modal.dataset.intent;
}

function setupAuthModal() {
  const modal = qs('#authModal');
  if (!modal) return;

  qsa('[data-close-modal]').forEach(btn => btn.addEventListener('click', closeAuthModal));

  const openBtn = qs('#openAuthModalBtn');
  if (openBtn) openBtn.addEventListener('click', () => openAuthModal());

  // Tabs
  const tabs = qsa('.tab');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const panelId = tab.dataset.tab;
    qsa('.tab-panel').forEach(p => p.classList.remove('active'));
    const panel = qs(`#${panelId}`);
    if (panel) panel.classList.add('active');
  }));

  // Forms
  const loginForm = qs('#modalLoginForm');
  if (loginForm) loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = qs('#loginUsername').value.trim();
    const password = qs('#loginPassword').value.trim();
    if (!username || !password) return;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      closeAuthModal();
      window.location.href = '/';
    } catch (err) {
      alert(err.message);
    }
  });

  const registerForm = qs('#modalRegisterForm');
  if (registerForm) registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = qs('#registerUsername').value.trim();
    const password = qs('#registerPassword').value.trim();
    if (!username || !password) return;
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      alert('Registration successful! You can now log in.');
      // Switch to login tab after successful sign up
      qsa('.tab').forEach(t => t.classList.remove('active'));
      qsa('.tab-panel').forEach(p => p.classList.remove('active'));
      qs('[data-tab="loginTab"]').classList.add('active');
      qs('#loginTab').classList.add('active');
    } catch (err) {
      alert(err.message);
    }
  });

  // Intercept guest interactions (like/comment buttons rendered with data-require-auth)
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-require-auth]');
    if (!btn) return;
    e.preventDefault();
    const intent = btn.getAttribute('data-require-auth');
    openAuthModal(intent);
  });
}

// Boot
showManageUsers();

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user = await getUserData();

    // Toggle nav controls
    const openAuthModalBtn = document.getElementById("openAuthModalBtn");
    const userMenu = document.getElementById("userMenu");
    const navUsername = document.getElementById("navUsername");
    const logoutBtnTop = document.getElementById("logoutBtnTop");

    if (user) {
      const uEl = document.getElementById("username");
      const rEl = document.getElementById("role");
      if (uEl) uEl.textContent = user.username;
      if (rEl) rEl.textContent = user.role;
      if (navUsername) navUsername.textContent = user.username;
      if (openAuthModalBtn) openAuthModalBtn.style.display = "none";
      if (userMenu) userMenu.style.display = "flex";
    } else {
      const uEl = document.getElementById("username");
      const rEl = document.getElementById("role");
      if (uEl) uEl.textContent = "Guest";
      if (rEl) rEl.textContent = "Explore";
      if (openAuthModalBtn) openAuthModalBtn.style.display = "inline-flex";
      if (userMenu) userMenu.style.display = "none";
    }

    const logoutHandler = () => {
      localStorage.removeItem("token");
      window.location.href = "/";
    };

    const logoutBtnSide = document.getElementById("logoutBtn");
    if (logoutBtnSide) logoutBtnSide.addEventListener("click", logoutHandler);
    if (logoutBtnTop) logoutBtnTop.addEventListener("click", logoutHandler);

    applyRoleRestrictions(user?.role);
    fetchUsers();
    fetchPosts();

    // Setup auth modal interactions
    setupAuthModal();
  } catch (error) {
    console.error("Error loading user data:", error);
  }
});
