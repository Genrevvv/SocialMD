const menuContent = {
    mainMenu: `<div class="user-info">
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
               </div>`,
    settings: `<h2>Settings</h2>
               <div id="delete-account" class="menu-option">
                    <i class="fa-solid fa-trash"></i>
                    <span class="text">Delete Account</span>
               </div>`,
    deleteMenu: `<h2>Delete Account</h2>
                 <div class="content">
                    <p>Are you sure you want to delete your account?</p>
                    <div class="delete-option">
                        <span id="delete-yes" class="option">Yes</span>
                        <span id="delete-no" class="option">No</span>
                    </div>
                 </div>`
};

let menuDOM = null;

const profile = document.getElementById('profile');

profile.onclick = (e) => {
    if (!(e.target.id === 'profile')) {
        return;
    }

    if (menuDOM !== null) {
        menuDOM.remove();
        menuDOM = null;

        return;
    }

    menuDOM = document.createElement('div');
    menuDOM.id = 'user-menu';
    menuDOM.innerHTML = menuContent.mainMenu;

    profile.appendChild(menuDOM);

    setOnClickAction('settings', (e) => {
        e.stopPropagation();

        menuDOM.innerHTML = menuContent.settings;

        setOnClickAction('delete-account', (e) => {
            e.stopPropagation();

            menuDOM.innerHTML = menuContent.deleteMenu;

            setOnClickAction('delete-yes', (e) => {
                e.stopPropagation();

                fetch('/delete-account')
                    .then(res => res.json())
                    .then(data => {
                        if (data['success']) {
                            sessionStorage.removeItem('username');
                            window.location.href = '/';
                        }
                    });
            });
            
            setOnClickAction('delete-no', (e) => {
                e.stopPropagation();

                menuDOM.remove();
                menuDOM = null;
            });
        });
    });
    
    setOnClickAction('logout', (e) => {
        e.stopPropagation();

        fetch('/logout')
            .then(res => res.json())
            .then(data => {
                if (data['success']) {
                    sessionStorage.removeItem('username');
                    window.location.href = '/';
                }
            });
    });
}

// Remove menu when user clicked somewhere else in the DOM
document.onclick = (e) => {
    if (profile.contains(e.target)) {
        return;
    }

    if (menuDOM !== null) {
        menuDOM.remove();
        menuDOM = null;
    }
}

function setOnClickAction(id, handler) {
    document.getElementById(id).onclick = handler;
}
