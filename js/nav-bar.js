const menuContent = {
    mainMenu: `<div class="user-info">
                    <div class="user-image profile-image"></div>
                    <h1>${sessionStorage.getItem('username')}</h1>
               </div>
               <div id="settings" class="menu-option">
                    <i class="fa-solid fa-gear"></i>
                    <span class="text">Settings</span>
               </div>
               <div id="logout" class="menu-option">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span class="text">Log Out</span>
               </div>`,
    settings: `<h2>Settings</h2>
               <div id="change-username" class="menu-option">
                    <i class="fa-solid fa-user-pen"></i>
                    <span class="text">Change Username</span>
               </div>
               <div id="delete-account" class="menu-option">
                    <i class="fa-solid fa-trash"></i>
                    <span class="text">Delete Account</span>
               </div>`,
    changeMenu: `<h2>Change Username</h2>
                 <form id="change-username-form">
                    <div class="input">
                        <span class="text">New username:</span>
                        <input id="username" name="username" type="text" placeholder="New username" autofocus>
                    </div>
                    <div class="input">
                        <span class="text">Password:</span>
                        <input id="password" name="password" type="password" placeholder="Password">
                    </div>
                    <div class="input">
                        <button type="submit">Submit</button>
                    </div>
                 </form>`,
    deleteMenu: `<h2>Delete Account</h2>
                 <div class="content">
                    <p>Are you sure you want to delete your account?</p>
                    <div class="delete-option">
                        <span id="delete-yes" class="option">Yes</span>
                        <span id="delete-no" class="option">No</span>
                    </div>
                 </div>`
};

const navBar = document.getElementById('nav-bar');
navBar.querySelector('.profile-image').style.backgroundImage = localStorage.getItem('user_profile_image');

// Nav-bar icons
const home = document.getElementById('home-icon');
home.onclick = () => {
    window.location = '/';
}

const friends = document.getElementById('friends-icon');
friends.onclick = () => {
    window.location = '/friends';
}

let menuDOM = null;

const profile = document.getElementById('profile');
profile.onclick = (e) => {
    if (!(e.target.id === 'profile')) {
        return;
    }

    if (menuDOM !== null) {
        removeMenu();
        return;
    }

    menuDOM = document.createElement('div');
    menuDOM.id = 'user-menu';
    menuDOM.innerHTML = menuContent.mainMenu;
    menuDOM.querySelector('.profile-image').style.backgroundImage = localStorage.getItem('user_profile_image');

    profile.appendChild(menuDOM);

    document.getElementById('settings').onclick = settings;
    document.getElementById('logout').onclick = logout;
}


function settings(e) {
    e.stopPropagation();
    menuDOM.innerHTML = menuContent.settings;

    // change-username
    document.getElementById('change-username').onclick = (e) => {
        e.stopPropagation();
        menuDOM.innerHTML = menuContent.changeMenu;

        document.getElementById('change-username-form').onsubmit = (e) => {
            e.preventDefault();

            const username =  document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const data = { username, password };
            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            };

            fetch('/change-username', options)
                .then(res => res.json())
                .then(data => {
                    console.log(data);

                    if (data['success']) {
                        sessionStorage.setItem('username', data['username']);                
                        window.location.href = '/';
                    }
                });
        }
    }

    // delete-account
    document.getElementById('delete-account').onclick = (e) => {
        e.stopPropagation();
        menuDOM.innerHTML = menuContent.deleteMenu;

        document.getElementById('delete-yes').onclick = (e) => {
            e.stopPropagation();
            fetch('/delete-account')
                .then(res => res.json())
                .then(data => {
                    if (data['success']) {
                        sessionStorage.removeItem('username');
                        window.location.href = '/';
                    }
                });
        }

        document.getElementById('delete-no').onclick = (e) => {
            e.stopPropagation();
            removeMenu();
        }
    }
}

function logout(e) {
    e.stopPropagation();
    fetch('/logout')
        .then(res => res.json())
        .then(data => {
            if (data['success']) {
                sessionStorage.removeItem('username');
                window.location.href = '/';
            }
        });
}

function removeMenu() {
    menuDOM.remove();
    menuDOM = null;
}

// Remove menu when user clicked somewhere else in the DOM
document.onclick = (e) => {
    if (profile.contains(e.target)) {
       return;
    }
    if (menuDOM !== null) {
        removeMenu();
    }
}
