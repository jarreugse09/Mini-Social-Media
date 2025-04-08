document.addEventListener("DOMContentLoaded", () => {
    const toggleMode = document.getElementById("toggleMode");

    // Check if user has a preference
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light-mode");
    }

    toggleMode.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");

        // Save user preference
        if (document.body.classList.contains("light-mode")) {
            localStorage.setItem("theme", "light");
        } else {
            localStorage.setItem("theme", "dark");
        }
    });
});


document.addEventListener("DOMContentLoaded", async () => {
    try {
        const user = await getUserData();
        if (!user) {
            alert("User not authenticated!");
            window.location.href = "/";
            return;
        }

        document.getElementById("username").textContent = user.username;
        document.getElementById("role").textContent = user.role;

        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("token");
            alert("Logged out!");
            window.location.href = "/";
        });

        applyRoleRestrictions(user.role);
        fetchUsers();
        fetchPosts();
    } catch (error) {
        console.error("Error loading user data:", error);
    }
});

function applyRoleRestrictions(role) {
    if (["user", "reactor", "commenter"].includes(role)) {
        document.getElementById("createPostSection").style.display = "none";
    }

    if (["user", "reactor"].includes(role)) {
        document.getElementById("postsContainer").classList.add("disable-likes-comments");
    }
}

async function showManageUsers() {
    const user = await getUserData();
    const manageUsersSection = document.querySelector(".manage-users");

    if (!user || user.role !== "admin") {
        manageUsersSection.style.display = "none";
    } else {
        manageUsersSection.style.display = "block";
    }
}

showManageUsers();



async function getUserData() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const response = await fetch("/api/auth/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch user data");
        return await response.json();
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
}

// Fetch and display users
async function fetchUsers() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const user = await getUserData();
        if (!user) return;

        const response = await fetch("/api/users", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch users");

        const users = await response.json();
        const filteredUsers = users.filter(u => u.username !== user.username);
        displayUsers(filteredUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

function displayUsers(users) {
    const usersList = document.getElementById("usersList");
    usersList.innerHTML = "";

    users.forEach(user => {
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

    document.querySelectorAll(".role-select").forEach(select => {
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
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ username, role })
        });

        if (!response.ok) throw new Error("Failed to update role");

        alert(`Role updated: ${username} is now a ${role}`);
    } catch (error) {
        console.error("Error updating role:", error);
    }
}

// Create Post Functionality
let selectedImage = null;

document.addEventListener("DOMContentLoaded", async () => {
    const user = await getUserData();

    if (!user || (user.role !== "poster" && user.role !== "admin")) {
        document.getElementById("createPostSection").style.display = "none";
        return;
    }

    document.getElementById("postImage").addEventListener("change", (event) => {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                selectedImage = e.target.result;
                document.getElementById("imagePreview").src = selectedImage;
                document.getElementById("imagePreview").style.display = "block";
            };

            reader.readAsDataURL(file);
        } else {
            selectedImage = null;
            document.getElementById("imagePreview").style.display = "none";
        }
    });

    document.getElementById("discardPost").addEventListener("click", () => {
        document.getElementById("postTitle").value = "";
        document.getElementById("postDescription").value = "";
        document.getElementById("postImage").value = "";
        selectedImage = null;
        document.getElementById("imagePreview").style.display = "none";
    });

    document.getElementById("submitPost").addEventListener("click", async () => {
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

        const posts = JSON.parse(localStorage.getItem("posts")) || [];

        const newPost = {
            id: Date.now(),
            username: user.username,
            title,
            description,
            image: selectedImage,
            likes: 0,
        };

        posts.unshift(newPost);
        localStorage.setItem("posts", JSON.stringify(posts));

        document.getElementById("postTitle").value = "";
        document.getElementById("postDescription").value = "";
        document.getElementById("postImage").value = "";
        selectedImage = null;
        document.getElementById("imagePreview").style.display = "none";

        fetchPosts();
    });
});


// Fetch and Display Posts
async function fetchPosts() {
    const posts = JSON.parse(localStorage.getItem("posts")) || [];
    displayPosts(posts);
}

async function displayPosts(posts) {
    const postsContainer = document.getElementById("postsContainer");
    const user = await getUserData();
    if (!user) return;

    postsContainer.innerHTML = "";

    posts.forEach(post => {
        if (!Array.isArray(post.comments)) post.comments = [];

        const postElement = document.createElement("div");
        postElement.classList.add("post");

        let likeButton = user.role !== "user" ? `<button onclick="likePost(${post.id})">👍<span class="like-count" id="likes-${post.id}">${post.likes}</span></button>` : "";
        let commentSection = user.role !== "user" && user.role !== "reactor" ? `
            <input type="text" id="comment-input-${post.id}" placeholder="Write a comment...">
            <button onclick="addComment(${post.id})">Post</button>
        ` : "";
        let deleteButton = (user.role === "admin" || (user.role === "poster" && post.username === user.username)) ? `<button onclick="deletePost(${post.id})">🗑️</button>` : "";

        postElement.innerHTML = `
            <h3>Posted by: <strong>${post.username}</strong></h3>
            <h4 style="margin-top: 5px;">${post.title}</h4>
            <p2>${post.description}</p2>
            ${post.image ? `<img src="${post.image}" alt="Post Image" class="post-image">` : ""}

            <div class="post-actions">
                ${likeButton}
                ${user.role !== "user" && user.role !== "reactor" ? `<button onclick="commentPost(${post.id})">💬</button>` : ""}
                ${deleteButton}
            </div>
            <div class="divider"></div>
            <div class="comments">
                <h4>Comments</h4>
                <ul id="comments-${post.id}">
                    ${post.comments.map(comment => `
                        <li>
                            <strong>${comment.username}:</strong> ${comment.text}
                            ${comment.username === user.username ? `<button onclick="deleteComment(${post.id}, ${comment.id})">🗑️</button>` : ""}
                        </li>
                    `).join("")}
                </ul>
                ${commentSection}
            </div>
        `;

        postsContainer.appendChild(postElement);
    });
}

async function addComment(postId) {
    const user = await getUserData();
    console.log("User Data:", user);
    
    if (!user || user.role === "user" || user.role === "reactor") return;

    const commentInput = document.getElementById(`comment-input-${postId}`);
    if (!commentInput) {
        console.error("Comment input not found!");
        return;
    }

    const text = commentInput.value.trim();
    if (!text) return;

    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    console.log("All Posts:", posts);

    const postIndex = posts.findIndex(p => p.id === parseInt(postId));
    if (postIndex === -1) {
        console.error("Post not found!");
        return;
    }

    if (!posts[postIndex].comments) posts[postIndex].comments = [];

    posts[postIndex].comments.push({ id: Date.now(), username: user.username, text });

    localStorage.setItem("posts", JSON.stringify(posts));
    commentInput.value = "";
    fetchPosts();
}


async function deleteComment(postId, commentId) {
    const user = await getUserData();
    if (!user || user.role === "user" || user.role === "reactor" || user.role === "commenter") return;

    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    const post = posts.find(p => p.id === parseInt(postId));
    if (!post) return;

    post.comments = post.comments.filter(c => c.id !== parseInt(commentId));

    localStorage.setItem("posts", JSON.stringify(posts));
    fetchPosts();
}

function deletePost(postId) {
    const user = getUserData();
    if (!user || user.role === "user" || user.role === "reactor" || user.role === "commenter") return;

    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    posts = posts.filter(post => post.id !== parseInt(postId));

    localStorage.setItem("posts", JSON.stringify(posts));
    fetchPosts();
}

function likePost(postId) {
    const user = getUserData();
    if (!user || user.role === "user" || user.role === "reactor") return;

    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    let postIndex = posts.findIndex(p => p.id === parseInt(postId));

    if (postIndex !== -1) {
        let post = posts[postIndex];

        if (!post.likedBy) post.likedBy = []; // Ensure likedBy exists

        const userIndex = post.likedBy.indexOf(user.username);

        if (userIndex === -1) {
            post.likedBy.push(user.username);
            post.likes = (post.likes || 0) + 1;
        } else {
            post.likedBy.splice(userIndex, 1);
            post.likes = Math.max((post.likes || 0) - 1, 0);
        }

        posts[postIndex] = post; // Update the post in the array
        localStorage.setItem("posts", JSON.stringify(posts));
        fetchPosts();
    }
}


// Load posts when the page loads
document.addEventListener("DOMContentLoaded", fetchPosts);
