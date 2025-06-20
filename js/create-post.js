import { displayPost } from "./display-post.js";

const createPost = document.getElementById('create-post');
let writePostUI = null;

createPost.onclick = () => {    
    if (writePostUI !== null) {
        return;
    }

    // Creat the UI
    writePostUI = document.createElement('div');
    writePostUI.id = 'write-post';
    writePostUI.innerHTML = `<div class="header">
                                <h2>Create Post</h2>
                                <i id="cancel-create" class="fa-solid fa-xmark"></i>
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
                                <div id="submit-post">Post</div>
                             </div>`;   

    const uiBlock = document.createElement('div');
    uiBlock.id = 'ui-block';
    uiBlock.appendChild(writePostUI);

    document.getElementById('main').appendChild(uiBlock);
    document.body.style.overflowY = 'hidden'; // Prevent user from scrolling

    const postText = document.getElementById('post-text'); 
    const addImage = document.getElementById('add-image');
    const cancelCreate = document.getElementById('cancel-create');
    const submitPost = document.getElementById('submit-post');
    const imagesList = document.getElementById('images-list')
    let imagesObject = {};
    
    postText.focus();

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

    // Close create post UI
    cancelCreate.onclick = () => {
        document.body.style.overflowY = 'auto';
        uiBlock.remove();

        writePostUI = null;
    }

    // Submit post
    submitPost.onclick = () => {
        if (postText.value === '') {
            flushMessage('Please add something to the post', uiBlock,1500);
            return;
        }
        
        const postData = {
            username: sessionStorage.getItem('username'),
            caption: postText.value,
            images: imagesObject
        };

        console.log(postData);

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        };

        fetch('/create-post', options)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                const postData = data['post_data'];
                console.log(postData);
                console.log(postData['date']);
                console.log(JSON.parse(postData['date']));

                const feed = document.getElementById('feed');
                displayPost(feed, postData, localStorage.getItem('user_profile_image'));
                
                document.body.style.overflowY = 'auto';
                uiBlock.remove();

                writePostUI = null;
            });
    }
}

function insertNewImage(imageName, imageData, imagesList, imagesObject) {
    if (imagesObject[imageName]) {
        return;
    }
    
    imagesObject[imageName] = imageData;
    console.log(imagesObject);

    const imageDOM = document.createElement('div');
    imageDOM.classList.add('image');
    imageDOM.innerHTML = `<div class="image-info">
                            <i class="copy-image fa-solid fa-copy"></i>
                            <span>${truncate(imageName, 10)}</span>
                          </div>
                          <i class="remove-image fa-solid fa-xmark"></i>`;

    imagesList.appendChild(imageDOM);

    const copyImage = imageDOM.querySelector('.copy-image');
    const removeImage = imageDOM.querySelector('.remove-image');

    copyImage.onclick = () => {
        navigator.clipboard.writeText(`![alt](${imageName})`);
        const uiBlock = document.getElementById('ui-block');
        flushMessage('image copied!', uiBlock, 1000);
    }

    removeImage.onclick = () => {
        delete imagesObject[imageName];
        imageDOM.remove();
    }
}

function truncate(text, maxLength) {
  return text.length > maxLength
    ? text.slice(0, maxLength) + '...'
    : text;
}

function flushMessage(message, parentElement, delay) {
    const messageDOM = document.createElement('div');
    messageDOM.classList.add('message');
    messageDOM.innerHTML = message;
    
    parentElement.appendChild(messageDOM);

    //Remove message after 1s
    setTimeout(() => {
        messageDOM.remove();
    }, delay); 
}
export { insertNewImage };