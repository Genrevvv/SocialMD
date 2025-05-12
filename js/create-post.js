const createPost = document.getElementById('create-post');

let writePostUI = null;

createPost.onclick = () => {    
    if (writePostUI !== null) {
        return;
    }

    console.log('hi');

    writePostUI = document.createElement('div');
    writePostUI.id = 'write-post';
    writePostUI.innerHTML = `<div class="header">
                                <h2>Create post</h2>
                                <i id="cancel-create" class="fa-solid fa-xmark"></i>
                             </div>
                             <div class="post-container">
                                <div id="post-text" contenteditable="true" autofocus></div>
                                <div id="placeholder">Drop some random thoughts...</div>
                             </div>
                             <div id="post-button">Post</div>`;
        
    document.getElementById('main').appendChild(writePostUI);

    const postText = document.getElementById('post-text'); 
    postText.innerText = '';

    postText.oninput = () => {
        const placeholder = document.getElementById('placeholder');

        if (postText.innerText.trim() === '') {
            placeholder.innerText = 'Drop some random thoughts...';
        }
        else {
            placeholder.innerText = '';
        }
    }
    
    const cancelCreate = document.getElementById('cancel-create');
    cancelCreate.onclick = () => {
        writePostUI.remove()
        writePostUI = null;
    }
}