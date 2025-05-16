import { parse } from '/utils/parse-md/parse-md.js';

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
                            <div class="profile-img"></div>
                            <div class="user-info">
                                <span class="post-username">${postData['username']}</span>
                                <div class="post-date">${date['date-ui']}
                                    <span class="hover-date">${date['date-tooltip']}</span>
                                </div>
                            </div>
                         </div>
                         <div id="md-output" class="post-content">
                            ${parse(postData['caption'])}
                         </div>`;

    feed.insertBefore(newPost, feed.firstChild);
}