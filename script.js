// we will decide i we use superbase or aws
        // // Supabase Configuration
        // const SUPABASE_URL = 'YOUR_SUPABASE_URL';
        // const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
        // const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Theme Management
        function initTheme() {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        }

        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        }

        function updateThemeIcon(theme) {
            document.getElementById('themeIcon').textContent = theme === 'dark' ? '☀️' : '🌙';
        }

        // // Auth State Management
        // async function checkAuth() {
        //     const { data: { user } } = await supabase.auth.getUser();
        //     if (user) {
        //         document.getElementById('authButtons').style.display = 'none';
        //         document.getElementById('dashboardLink').style.display = 'block';
        //         document.getElementById('logoutButton').style.display = 'block';
        //     }
        // }

        // async function handleLogout() {
        //     await supabase.auth.signOut();
        //     window.location.reload();
        // }

        // Load Posts
        async function loadPosts() {
            try {
                const { data: posts, error } = await supabase
                    .from('posts')
                    .select(`
                        *,
                        profiles:user_id (username)
                    `)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const container = document.getElementById('postsContainer');
                
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

                container.innerHTML = posts.map(post => {
                    const excerpt = post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '');
                    const date = new Date(post.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    });
                    const author = post.profiles?.username || 'Anonymous';
                    const initial = author.charAt(0).toUpperCase();

                    return `
                        <div class="col-md-6 col-lg-4">
                            <div class="post-card" onclick="viewPost('${post.id}')">
                                <span class="post-category">📝 Article</span>
                                <h3 class="post-title">${post.title}</h3>
                                <p class="post-excerpt">${excerpt}</p>
                                <div class="post-meta">
                                    <div class="author-info">
                                        <div class="author-avatar">${initial}</div>
                                        <span class="author-name">${author}</span>
                                    </div>
                                    <span class="post-date">${date}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            } catch (error) {
                console.error('Error loading posts:', error);
                document.getElementById('postsContainer').innerHTML = `
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
    