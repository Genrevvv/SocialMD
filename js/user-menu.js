const profile = document.getElementById('profile');
let profileMenu = null;
let settingMenu = null;
let deleteMenu = null;

profile.onclick = (e) => {
    if (!(e.target.id === 'profile')) {
        return;
    }

    if (profileMenu === null) {
        profileMenu = document.createElement('div');
        profileMenu.id = 'profile-menu';
        profileMenu.innerHTML = `<div class="user-info">
                                    <div class="profile-img"></div>
                                    <h1>${sessionStorage.getItem('username')}</h1>
                                 </div>
                                 <div id="settings" class="menu-option">
                                    <i class="fa-solid fa-gear"></i>
                                    <span class="text">Settings</span>
                                 </div>
                                 <div id="logout" class="menu-option">
                                    <i class="fa-solid fa-right-from-bracket"></i>
                                    <span class="text">Log Out</span>
                                 </div>`;

        profile.appendChild(profileMenu);

        document.getElementById('settings').onclick = (e) => {
            e.stopPropagation();

            profileMenu.remove();
            profileMenu = null;

            settingMenu = document.createElement('div');
            settingMenu.id = 'setting-menu';
            settingMenu.innerHTML = `<h2>Settings</h2>
                                     <div id="delete-account" class="menu-option">
                                        <i class="fa-solid fa-trash"></i>
                                        <span class="text">Delete Account</span>
                                     </div>`;

            profile.appendChild(settingMenu);

            document.getElementById('delete-account').onclick = (e) => {
                e.stopPropagation();

                settingMenu.remove();
                settingMenu = null;

                deleteMenu = document.createElement('div');
                deleteMenu.id = 'delete-menu';
                deleteMenu.innerHTML = `<h2>Delete Account</h2>
                                        <div class="content">
                                            <p>Are you sure you want to delete your account?</p>
                                            <div class="delete-option">
                                                <span id="delete-yes" class="option">Yes</span>
                                                <span id="delete-no" class="option">No</span>
                                            </div>
                                        </div>
                                        `;

                profile.appendChild(deleteMenu);

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

                    deleteMenu.remove();
                    deleteMenu = null;
                }
            }
        }

        document.getElementById('logout').onclick = () => {
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
    }
    else {
        profileMenu.remove();
        profileMenu = null;
    }

    console.log('hi');
}

// Remove menu when user clicked somewhere else in the DOM
document.onclick = (e) => {
    if (profile.contains(e.target)) {
        return;
    }

    if (profileMenu !== null) {
        profileMenu.remove();
        profileMenu = null;
    }

    if (settingMenu !== null) {
        settingMenu.remove();
        settingMenu = null;
    }
    
    if (deleteMenu !== null) {
        deleteMenu.remove();
        deleteMenu = null;
    }
}

// TODO: Refactor profileMenu, settingMenu, and deleteMenu to become a single menu