function changeProfileImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];

        const fileReader = new FileReader();
        fileReader.onload = () => {
            const imageData = fileReader.result;

            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({'profile_image': imageData})
            }

            fetch('/update-profile-image', options)
                .then(res => res.json())
                .then(data => {
                    if (!data['success']) {
                        return;
                    }

                    const profileImagesDOM = document.querySelectorAll('.user-image.profile-image');
                    const imageURL = `url(${imageData})`;
                    localStorage.setItem('user_profile_image', imageData);

                    for (let profileDOM of profileImagesDOM) {
                        profileDOM.style.backgroundImage = imageURL;
                    }
                })
        }

        fileReader.readAsDataURL(file);
    }
    input.click();
}

let unfriendButton = null;
let lastFriendElement = null;
function displayFriend(userData, parentElement) {
    const friendElement = document.createElement('div');
    friendElement.classList.add('friend-element');
    friendElement.innerHTML = `<div class="friend-info">
                                <div class="friend-image profile-image"></div>
                                <span class="username">${userData['username']}</span>
                               </div>`;
    
    parentElement.appendChild(friendElement);

    const profileImage = userData['profile_image'];
    const friendProfileImage = friendElement.querySelector('.friend-image.profile-image');
    friendProfileImage.style.backgroundImage = profileImage ? `url(${profileImage})` : 'url(/assets/images/user.png)';

    friendElement.onclick = () => {
        if (unfriendButton !== null) {
            if (friendElement === lastFriendElement) {
                unfriendButton.remove();
                unfriendButton = null;
                
                lastFriendElement.classList.remove('highlighted');
                lastFriendElement = null;
                return;
            }

            lastFriendElement.classList.remove('highlighted');
            unfriendButton.remove();
            unfriendButton = null;
        }

        lastFriendElement = friendElement;

        console.log(userData['username']);

        unfriendButton = document.createElement('div');
        unfriendButton.innerHTML = `<div class="unfriend-button">Unfriend</div>`;
        friendElement.classList.toggle('highlighted');

        friendElement.appendChild(unfriendButton);

        unfriendButton.onclick = (e) => {
            e.stopPropagation();

            const options  = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            }

            fetch('/delete-friend-status', options)
                .then(res => res.json())
                .then(data => {
                    if (!data['success']) {
                        return;
                    }
                    
                    console.log(`You've unfriended ${userData['username']}`);
                    friendElement.remove();
                });
        }
    }
}

export { changeProfileImage, displayFriend };