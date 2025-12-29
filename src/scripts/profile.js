document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login";
        return;
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "/login";
        });
    }

    try {
        const response = await fetch("/api/auth/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user data");
        }

        const user = await response.json();

        const usernameSpan = document.getElementById("username");
        const roleSpan = document.getElementById("role");
        const userInfoDiv = document.getElementById("userInfo");

        if (usernameSpan) {
            usernameSpan.textContent = user.username;
        }
        if (roleSpan) {
            roleSpan.textContent = user.role;
        }

        if (userInfoDiv) {
            userInfoDiv.innerHTML = `
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
                <p><strong>Role:</strong> ${user.role}</p>
            `;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        // Redirect to login if there's an error fetching data
        localStorage.removeItem("token");
        window.location.href = "/login";
    }
});
