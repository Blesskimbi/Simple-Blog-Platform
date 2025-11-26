# Simple-Blog-Platform
A simple web application that allows users to create, edit, and view blog posts. This project is designed for learning Git, GitHub collaboration, and basic web development concepts.

We want to build a simple blog platform where users can read blog posts, and authenticated users can create, edit, and delete their own posts. The platform uses:

HTML/CSS/Bootstrap → UI layout and styling

JavaScript → App logic

Supabase → Authentication + Database

Key Features to Implement
1. Public Homepage

Show a list of blog posts from the Supabase database.

For each blog post, display:

Title

Short excerpt (first 100–150 characters of the content)

Author name

Date created

Each post should be clickable to open the full post page.

2. Blog Post Page

Display full content of a selected post.

Show:

Title

Content

Author

Date

Include a “Back to Home” link.

3. User Authentication (Supabase Auth)

Signup page with email + password.

Login page with email + password.

After login, redirect the user to their dashboard.

Use Supabase's built-in auth methods (email/password).

4. User Dashboard

After login, the user should see a dashboard with:

Button: Create New Post

List of the user's posts with buttons:

Edit

Delete

5. Create Post Page

Form with:

Title (text input)

Content (textarea)

Submit button
On submit:

Insert into Supabase table posts

title

content

user_id (from Supabase auth)

created_at (timestamp)

6. Edit Post Page

Load the user’s existing post into a form.

Allow editing title + content.

On submit, update the row in Supabase.

7. Delete Post

Delete the selected post from Supabase.

Only allow deleting if the logged-in user is the owner.

Database Structure (Supabase)

Create a posts table:

Column	Type	Description
id	uuid (Primary Key)	Auto-generated
user_id	uuid (Foreign Key to auth.users)	Post owner
title	text	Post title
content	text	Full blog content
created_at	timestamp	Post creation date

Enable Row Level Security and create policies so users can:

Read all posts

Insert, update, delete only their own posts

Frontend Stack

Use Bootstrap for layout: navbar, container, cards, forms.

Use plain JavaScript (no frameworks).

Use fetch() + Supabase JS client to communicate with database.

Pages Required

index.html → homepage showing all posts

post.html → single post view

login.html

signup.html

dashboard.html

create-post.html

edit-post.html

Behavior

If user is logged in → show dashboard link

If user is not logged in → show login/signup buttons

Redirect users away from restricted pages if not authenticated
