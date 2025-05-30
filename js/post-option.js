import { displayComments } from './comments.js'

function createPostOptions(postDOM, postData) {
    const postOptions = postDOM.querySelector('.options');
    const reactButton = postOptions.querySelector('.react-button');
    const commentButton = postOptions.querySelector('.comment-button');
    
    reactButton.onclick = () => {        
        toggleReaction(postData, reactButton, postDOM);
    }

    commentButton.onclick= () => {
        console.log('You clicked comment');
        displayComments(postData);
    }

}

function toggleReaction(postData, reactButton, postDOM) {
    const data = {
        post_id: postData['post_id']
    }

    const options  = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }

    fetch('/toggle-reaction', options)
        .then(res => res.json())
        .then(data => {
            console.log(data);

            if (!data['success']) {
                return;
            }

            const reactQuantityDOM = postDOM.querySelector('.button.react .quantity');
            const reactQuantity = postData['reactions'];

            console.log(reactQuantity);

            if (data['action'] == 1) {
                reactQuantityDOM.innerText = postData['reacted'] === 'T' ? reactQuantity : reactQuantity + 1;
                reactButton.className = 'react-button fa-solid fa-heart reacted';

                console.log(`You reacted to ${postData['username']}'s post!`);
                return;
            }

            reactQuantityDOM.innerText =  postData['reacted'] === 'T' ? (reactQuantity - 1 <= 0 ? '' : reactQuantity - 1) : 
                                                                        (reactQuantity - 1 <= 0 ? '' : reactQuantity);
            reactButton.className = 'react-button fa-regular fa-heart';
        });
}

export { createPostOptions };