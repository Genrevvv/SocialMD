function createPostOptions(postDOM, postData) {
    const postOptions = postDOM.querySelector('.options');
    const reactButton = postOptions.querySelector('.react-button');

    reactButton.onclick = () => {
        console.log(`You reacted to ${postData['username']}'s post!`);
        
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
                    reactQuantityDOM.innerText = postData['reacted'] ? reactQuantity : reactQuantity + 1;
                    reactButton.className = 'react-button fa-solid fa-heart reacted';

                    return;
                }

                reactQuantityDOM.innerText = reactQuantity - 1 < 0 ? '' : reactQuantity - 1;
                reactButton.className = 'react-button fa-regular fa-heart';
            });
    }
}

export { createPostOptions };