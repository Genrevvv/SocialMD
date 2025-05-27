import { insertNewImage } from './create-post.js';
import { parse } from './parse-md.js';
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
                            <div id="post-editor">
                                <div class="editor-section text-editor-section">
                                    <span class="sub-header">Text Editor</span>
                                    <textarea id="post-text" placeholder="Drop some random thoughts"></textarea>
                                </div>
                                <div class="editor-section images-list-section">
                                    <span class="sub-header">Images list</span>
                                    <div id="images-list"></div>
                                </div>
                            </div>
                            <div id="add-to-your-post">
                                <h2>Add to your post</h2>
                                <i id="add-image" class="fa-solid fa-image"></i>
                            </div>
                            <div id="update-post">Save</div>
                            </div>`;   

    document.getElementById('main').appendChild(editPostUI);

    const postText = document.getElementById('post-text');
    const addImage = document.getElementById('add-image');
    const cancelEdit = document.getElementById('cancel-edit');
    const updatePost = document.getElementById('update-post');
    const imagesList = document.getElementById('images-list')
    let imagesObject = {};

    postText.focus();

    // Set post input content
    postText.value = postData['caption'];

    // Insert images on image list
    let imagesData = postData['images'];
    imagesData = typeof imagesData === 'object' ? imagesData : JSON.parse(imagesData);

    for (let key in imagesData) {
        console.log(key);
        insertNewImage(key, imagesData[key], imagesList, imagesObject);
    }

    // Add to your post (Insert image)
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
                insertNewImage(file.name, imageData, imagesList, imagesObject);

                postText.focus();
                console.log(imageData);
            }

            fileReader.readAsDataURL(file);
        }
        input.click();
    }

    // Close edit post UI
    cancelEdit.onclick = () => {
        editPostUI.remove()
        editPostUI = null;
    }

    // Update post
    updatePost.onclick = () => {
        postData['caption'] = postText.value;
        postData['images'] = imagesObject;

        const updatedPostData = {
            post_id: postData['post_id'],
            caption: postData['caption'],
            images: postData['images']
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
                    postContent.innerHTML = parse(postData['caption'], postData['images']);

                    editPostUI.remove();
                    editPostUI = null;
                    
                    setTimeout(() => {
                        // Create a new post menu with the updated data
                        const postMenuButton = postDOM.querySelector('.post-menu-button');
                        createPostMenu(postMenuButton, postDOM, postData, true);

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