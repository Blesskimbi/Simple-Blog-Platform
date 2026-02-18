// we will decide if we use superbase or aws
// Supabase Configuration
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabaseClient; // Expose to global scope for inline scripts

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  document.getElementById("themeIcon").textContent =
    theme === "light" ? "🌙" : "☀️";
}

// Auth State Management
async function checkAuth() {
  const path = window.location.pathname.toLowerCase();
  
  // Define page groups
  const protectedPages = ["dashboard.html", "create-post.html", "edit-post.html"];
  const authPages = ["login.html", "signup.html"];

  const isProtectedPage = protectedPages.some(page => path.includes(page.toLowerCase()));
  const isAuthPage = authPages.some(page => path.includes(page.toLowerCase()));

  // Check auth state (Demo first, then Supabase)
  const mockUser = localStorage.getItem("demoUser");
  const { data: { session } } = await supabaseClient.auth.getSession();
  
  const isAuthenticated = !!(mockUser || session);

  // Sync localStorage isLoggedIn flag for consistency
  if (isAuthenticated) {
    localStorage.setItem("isLoggedIn", "true");
  } else {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("demoUser");
  }

  // Update navbar/UI based on auth state
  updateAuthUI(isAuthenticated);

  // Handle Redirections
  if (isAuthenticated && isAuthPage) {
    // If logged in, don't allow visiting login/signup
    window.location.href = "dashboard.html";
  } else if (!isAuthenticated && isProtectedPage) {
    // If not logged in, don't allow visiting dashboard/create/edit
    window.location.href = "login.html";
  }
}

function updateAuthUI(isAuthenticated) {
  const authButtons = document.getElementById("authButtons");
  const dashboardLink = document.getElementById("dashboardLink");
  const logoutButton = document.getElementById("logoutButton");

  if (isAuthenticated) {
    if (authButtons) authButtons.style.display = "none";
    if (dashboardLink) dashboardLink.style.display = "block";
    
    // Inject Profile Dropdown
    const navbarNav = document.getElementById('navbarContent');
    // If navbarContent not found, fallback to first .navbar-nav inside .collapse
    const targetNav = navbarNav ? navbarNav.querySelector('.navbar-nav') : document.querySelector('.navbar-collapse .navbar-nav');
    
    if (targetNav && !document.getElementById('userProfileDropdown')) {
        const li = document.createElement('li');
        li.id = 'userProfileDropdown';
        li.className = 'nav-item dropdown ms-3';
        li.innerHTML = `
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <div class="profile-img-placeholder rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                    👤
                </div>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="profile.html">Profile</a></li>
                <li><a class="dropdown-item text-danger" href="#" onclick="handleLogout()">Logout</a></li>
            </ul>
        `;
        targetNav.appendChild(li);
    }
    if (logoutButton) logoutButton.style.display = "none"; 
  } else {
    if (authButtons) authButtons.style.display = "block";
    if (dashboardLink) dashboardLink.style.display = "none";
    const profileDropdown = document.getElementById('userProfileDropdown');
    if (profileDropdown) profileDropdown.remove();
  }
}

async function handleLogout() {
  await supabaseClient.auth.signOut();
  localStorage.removeItem("demoUser");
  localStorage.removeItem("isLoggedIn");
  window.location.href = "index.html";
}

async function handleCreatePost(e) {
  e.preventDefault();

  const title = document.getElementById("postTitle").value;
  const content = document.getElementById("postContent").value;
  const submitBtn = document.getElementById("submitBtn");

  if (!title || !content) {
    showAlert("Please fill in all fields", "danger");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Publishing...";

  try {
    // Get user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    // Mock user fallback
    const mockUser = JSON.parse(localStorage.getItem("demoUser"));
    const userId = user ? user.id : mockUser ? mockUser.id : null;

    if (!userId) {
      throw new Error("You must be logged in to post.");
    }

    const { data, error } = await supabaseClient
      .from("posts")
      .insert([{ title, content, user_id: userId }])
      .select();

    if (error) throw error;

    showAlert("Post published successfully!", "success");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);
  } catch (error) {
    console.error("Error creating post:", error);
    showAlert(error.message || "Error creating post", "danger");
    submitBtn.disabled = false;
    submitBtn.textContent = "Publish Post";
  }
}

function showAlert(message, type) {
  const alertContainer = document.getElementById("alertContainer");
  if (alertContainer) {
    alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
  }
}

// Load Posts
async function loadPosts() {
  try {
    const { data: posts, error } = await supabaseClient
      .from("posts")
      .select(
        `
                        *,
                        profiles:user_id (username)
                    `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    const container = document.getElementById("postsContainer");
    if (!container) return; // Exit if container doesn't exist (e.g. on create-post.html)

    if (!posts || posts.length === 0) {
      container.innerHTML = `
                        <div class="col-12">
                            <div class="empty-state">
                                <h3> No posts yet</h3>
                                <p>Be the first to share your incredible story with our community!</p>
                                <a href="signup.html" class="btn btn-primary btn-lg">Start Writing Now</a>
                            </div>
                        </div>
                    `;
      return;
    }

    container.innerHTML = posts
      .map((post) => {
        // Strip HTML tags for excerpt
        const plainText = post.content.replace(/<[^>]*>/g, '');
        const excerpt =
          plainText.substring(0, 120) +
          (plainText.length > 120 ? "..." : "");
          
        const date = new Date(post.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        
        const author = post.profiles?.username || "Anonymous";
        const initial = author.charAt(0).toUpperCase();

        // Calculate reading time
        const words = plainText.trim().split(/\s+/).length;
        const readTime = Math.ceil(words / 200) || 1;

        return `
                        <div class="col-md-6 col-lg-4">
                            <div class="post-card" onclick="viewPost('${post.id}')">
                                ${post.cover_url ? `<img src="${post.cover_url}" class="card-img-top mb-3 rounded" style="height:160px; object-fit:cover;" alt="Cover">` : '<span class="post-category">📝 Article</span>'}
                                <h3 class="post-title">${post.title}</h3>
                                <p class="post-excerpt">${excerpt}</p>
                                <div class="post-meta">
                                    <div class="author-info">
                                        <div class="author-avatar">${initial}</div>
                                        <span class="author-name">${author}</span>
                                    </div>
                                    <div class="d-flex align-items-center gap-2">
                                        <span class="post-date text-nowrap">${date}</span>
                                        <span class="badge bg-secondary rounded-pill fw-normal">${readTime} min</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
      })
      .join("");
  } catch (error) {
    console.error("Error loading posts:", error);
    document.getElementById("postsContainer").innerHTML = `
                    <div class="col-12">
                        <div class="empty-state">
                            <h3>⚠️ Error loading posts</h3>
                            <p>${error.message}</p>
                            <button class="btn btn-primary" onclick="loadPosts()">Try Again</button>
                        </div>
                    </div>
                `;
  }
}

function viewPost(postId) {
  window.location.href = `post.html?id=${postId}`;
}

// Initialize
initTheme();
checkAuth();
loadPosts();
