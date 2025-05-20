## SocialMD
A social media web app that allows users to use markdown syntax on posts.

### Features (Checklist):
1. Login and Logout
   - Login ✅
   - Logout ✅
2. Account Management System
   - Register ✅
   - Delete account ✅
   - Change username ✅
3. Content Management System
   - Create a post ✅ (Images are stored with caption as base64 for now. Not recommended for production.)
   - Delete post ✅ (No access control yet)
   - Edit post ✅ (No access control yet)
   - Support markdown in posts ✅
   - Load newsfeed ✅ (Only load user's post for now)
4. User Interaction System
   - Add friend
   - Remove friend
   - React to posts
   - Comment on posts
5. Responsive Design

### Requirements:
1. PHP
2. SQLite3

### How to run:
1. Navigate to the project directory:
   ```bash
   cd SocialMD
   ```
2. Start the PHP server:
   ```bash
   php -S localhost:8000
   ```
3. Open your browser and go to [localhost:8000](http://localhost:8000)
