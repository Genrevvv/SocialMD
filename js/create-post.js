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
                                <h2>Create post</h2>
                                <i id="cancel-create" class="fa-solid fa-xmark"></i>
                             </div>
                             <div id="post-container">
                                <div id="post-text" contenteditable="true"></div>
                                <div id="placeholder">Drop some random thoughts...</div>
                             </div>
                             <div id="add-to-your-post">
                                <h2>Add to your post</h2>
                                <i id="add-image" class="fa-solid fa-image"></i>
                             </div>
                             <div id="submit-post">Post</div>`;
        
    document.getElementById('main').appendChild(writePostUI);

    const postText = document.getElementById('post-text'); 
    postText.innerText = '';
    postText.focus();

    // Handle event for displaying the placeholder
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
                
                postText.innerHTML += '<br>';
                postText.appendChild(newImage);
                postText.dispatchEvent(new Event('input'));

                postText.focus;

                console.log(imageData);
            }

            fileReader.readAsDataURL(file);
        }
        input.click();
    }

    // Close create post UI
    const cancelCreate = document.getElementById('cancel-create');
    cancelCreate.onclick = () => {
        writePostUI.remove()
        writePostUI = null;
    }

    // Submit post
    const submitPost = document.getElementById('submit-post');
    submitPost.onclick = () => {
        const postData = {
            username: sessionStorage.getItem('username'),
            caption: document.getElementById('post-text').innerHTML
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
                displayPost(postData);
                
                writePostUI.remove();
                writePostUI = null;
            });
    }
}
