const profile = document.getElementById('profile');
let profileMenu = null;

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
                                <div class="menu-button">
                                    <button id="logout">Logout</button>
                                </div>`;

        profile.appendChild(profileMenu);

        const logout = document.getElementById('logout');
        logout.onclick = () => {
            fetch('/logout')
                .then(res => res.json())
                .then(data => {
                    if (data['success']) {
                        sessionStorage.removeItem('username');
                        window.location.href = '/';
                    }
                })
        } 
    }
    else {
        profileMenu.remove();
        profileMenu = null;
    }

    console.log('hi');
}