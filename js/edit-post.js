import { parse } from './parse-md.js';
import { decodeHTML } from './display-post.js';
import { createPostMenu } from './post-menu.js';

let editPostUI = null;

function editPostMenu(postMenu, postDOM, postData) {
    if (postMenu !== null) {
        postMenu.remove();
        postMenu = null;
    }

    if (editPostUI !== null) {
        return;
    }

    console.log(postData['caption']);
    editPostUI = document.createElement('div');
    editPostUI.id = 'write-post';
    editPostUI.innerHTML = `<div class="header">
                                <h2>Edit Post</h2>
                                <i id="cancel-edit" class="fa-solid fa-xmark"></i>
                            </div>
                            <div id="post-container">
                                <div id="post-text" contenteditable="true"></div>
                                <div id="placeholder">Drop some random thoughts...</div>
                            </div>
                            <div id="add-to-your-post">
                                <h2>Add to your post</h2>
                                <i id="add-image" class="fa-solid fa-image"></i>
                            </div>
                            <div id="update-post">Save</div>`;

    document.getElementById('main').appendChild(editPostUI);

    const postText = document.getElementById('post-text');
    postText.oninput = () => {
        const placeholder = document.getElementById('placeholder');

        if (postText.innerText.trim() !== '' || postText.querySelector('img')) {
            placeholder.innerText = '';
            postText.focus();
        }
        else {
            placeholder.innerText = 'Drop some random thoughts...';
            postText.focus();
        }
    }

    // Set post input content
    postText.innerHTML = postData['caption'];
    postText.dispatchEvent(new Event('input'));

    // Add to your post (Insert image)
    const addImage = document.getElementById('add-image');
    addImage.onclick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];

            // I don't think this will even happen tho, lol
            if (!file) {
                return;
            }

            const fileReader = new FileReader();
            fileReader.onload = () => {
                const imageData = fileReader.result;
                
                const newImage = document.createElement('img');
                newImage.src = imageData;
                
                postText.innerHTML += '\n';
                postText.appendChild(newImage);
                postText.dispatchEvent(new Event('input'));

                postText.focus;

                console.log(imageData);
            }

            fileReader.readAsDataURL(file);
        }
        input.click();
    }

    // Close edit post UI
    const cancelEdit = document.getElementById('cancel-edit');
    cancelEdit.onclick = () => {
        editPostUI.remove()
        editPostUI = null;
    }

    // Update post
    const updatePost = document.getElementById('update-post');
    updatePost.onclick = () => {
        postData['caption'] = postText.innerHTML;

        const updatedPostData = {
            post_id: postData['post_id'],
            caption: postData['caption']
        };

        console.log(updatedPostData);

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedPostData)
        };

        fetch('/update-post', options)
            .then(res => res.json())
            .then(data => {
                if (data['success']) {
                    const postContent = postDOM.querySelector('.post-content');
                    postContent.innerHTML = parse(decodeHTML(postData['caption']));

                    editPostUI.remove();
                    editPostUI = null;
                    
                    setTimeout(() => {
                        // Create a new post menu with the updated data
                        const postMenuButton = postDOM.querySelector('.post-menu-button');
                        createPostMenu(postMenuButton, postDOM, postData);

                        // Adjust post styling againa fter editing when overflowing
                        const postContent = document.querySelector('.post-content');
                        if (postContent.scrollHeight > postContent.clientHeight) {
                            const more = document.createElement('div');
                            more.classList.add('more-button');
                            more.textContent = '(See more)';

                            postContent.appendChild(more);

                            more.onclick = () => {
                                postContent.style.maxHeight = 'none';
                                more.remove();
                            }
                        }
                    }, 10); // Delay to allow content rendering
                }
            });
    }
}

export { editPostMenu };