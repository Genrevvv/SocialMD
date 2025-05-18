let postMenu = null;
let tempButton = null;

function createPostMenu(postMenuButton, newPost, postData) {
    postMenuButton.onclick = () => {
        if (postMenu !== null) {
            if (postMenuButton === tempButton) {
                postMenu.remove();
                postMenu = null;

                tempButton = null;
                return;
            }

            postMenu.remove();
            postMenu = null;
        }

        tempButton = postMenuButton;

        postMenu = document.createElement('div');
        postMenu.id = 'post-menu';
        postMenu.innerHTML = `<div id="delete-post" class="option">
                                <i class="fa-solid fa-trash"></i>
                                <span>Delete Post</span>
                            </div>`;

        const postHeader = newPost.querySelector('.post-header');
        postHeader.appendChild(postMenu);

        const deletePost = document.getElementById('delete-post');
        deletePost.onclick = () => {
            const postID = {
                post_id: postData['post_id']
            };

            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postID)
            };

            fetch('/delete-post', options)
                .then(res => res.json())
                .then(data => {
                    if (data['success']) {
                        newPost.remove();
                    }
                });
        }
    }
}

export { createPostMenu };