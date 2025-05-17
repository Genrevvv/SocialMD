import { parse } from './parse-md.js';

const feed = document.getElementById('feed');
fetch('/load-feed')
    .then(res => res.json())
    .then(data => {
        if (data.length === 0) {
            return;
        }
        
        let date = null;
        for (let postData of data) {
            date = JSON.parse(postData['date']);
            console.log(postData['date']);
            console.log(date);
            console.log(date['date-ui']);
            displayPost(postData, date);
        }

        console.table(data);
    });


function displayPost(postData, date) {
    const newPost = document.createElement('div');
    newPost.classList.add('post');
    newPost.innerHTML = `<div class="post-header">
                            <div class="user-info">
                                <div class="profile-img"></div>
                                <div class="post-info">
                                    <span class="post-username">${postData['username']}</span>
                                    <div class="post-date">${date['date-ui']}
                                        <span class="hover-date">${date['date-tooltip']}</span>
                                    </div>
                                </div>
                            </div>
                         </div>
                         <div id="md-output" class="post-content">
                            ${parse(postData['caption'])}
                         </div>`;

    feed.insertBefore(newPost, feed.firstChild);

    const postHeader = newPost.querySelector('.post-header');
    const postMenu = document.createElement('i');
    postMenu.classList.add('post-menu', 'fa-solid', 'fa-ellipsis');

    postHeader.appendChild(postMenu);
    
    const postContent = newPost.querySelector('.post-content');

    if (postContent.scrollHeight > postContent.clientHeight) {
        postContent.classList.add('truncate'); 

        const more = document.createElement('div');
        more.classList.add('more-button');
        more.textContent = '(See more)';

        postContent.appendChild(more);

        more.onclick = () => {
            postContent.style.maxHeight = 'none';
            more.remove();
        }
    }

}