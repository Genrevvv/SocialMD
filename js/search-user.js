function searchUserHandler() {
    const findFriends = document.getElementById('find-friends');

    const searchBar = findFriends.querySelector('#user-search-bar');
    const users = findFriends.querySelectorAll('.people .user-card');
    console.log(users);

    searchBar.addEventListener('input', () => {
        const query = searchBar.value.toLowerCase();
        console.log(query);
        users.forEach(user => {
            console.log(user);
            user.style.display = user.id.toLowerCase().startsWith(query) ? '' : 'none';
        });
    });
}

export { searchUserHandler };