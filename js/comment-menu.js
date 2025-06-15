let commentMenu = null;
let tempButton = null;

function createCommentMenu(commentDOM, commentData) {
    const commentMenuButton = commentDOM.querySelector('.comment-menu-button');

    commentMenuButton.onclick = () => {
        if (commentMenu !== null) {
            if (commentMenuButton === tempButton) {
                commentMenu.remove();
                commentMenu = null;

                tempButton = null;
                return;
            }

            commentMenu.remove();
            commentMenu = null;
        }

        tempButton = commentMenuButton;

        if (commentData['username'] === sessionStorage.getItem('username')) {
            commentMenu = createOwnerCommentMenu(commentDOM, commentData);
            return;
        }

        commentMenu = createNonOwnerCommentMenu(commentDOM, commentData);
    }
}

function createOwnerCommentMenu(commentDOM, commentData) {
    commentMenu = document.createElement('div');
    commentMenu.id = 'comment-menu';
    commentMenu.innerHTML = `<div class="delete-comment option">
                                <i class="fa-solid fa-trash"></i>
                                <span>Delete Comment</span>
                             </div>`;
                             
    commentDOM.appendChild(commentMenu);

    const deleteComment = commentDOM.querySelector('.delete-comment');
    deleteComment.onclick = () => {
    const data = { comment_id: commentData['comment_id'] };
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }

    fetch('/delete-comment', options)
        .then(res => res.json())
        .then(data => { 
            console.log(data);

            if (!data['success']) {
                return;
            }

            commentDOM.remove();
        });
    }

    return commentMenu;
}

function createNonOwnerCommentMenu(commentDOM, commentData) {
    commentMenu = document.createElement('div');
    commentMenu.id = 'comment-menu';
    commentMenu.innerHTML = `<div class="hide-comment option">
                                <i class="fa-solid fa-eye-slash"></i>
                                <span>Hide Comment</span>
                             </div>`;

    commentDOM.appendChild(commentMenu);

    const hideComment = commentDOM.querySelector('.hide-comment');
    hideComment.onclick = () => {
        const data = { comment_id: commentData['comment_id'] };
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }

        fetch('/hide-comment', options)
            .then(res => res.json())
            .then(data => {
                if (!data['success']) {
                    return;
                }

                const hideCommentEvent = new CustomEvent('hide-comment');
                document.dispatchEvent(hideCommentEvent);

                commentDOM.remove();
            });
    }

    return commentMenu;
}

export { createCommentMenu };