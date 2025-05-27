import { createPostMenu  } from './post-menu.js';
import { parse } from './parse-md.js';

function displayPost(postData) {
    const feed = document.getElementById('feed');
    const date = JSON.parse(postData['date']);
    let imagesData = postData['images'];
    imagesData = typeof imagesData === 'object' ? imagesData : JSON.parse(imagesData);

    const postDOM = document.createElement('div');
    postDOM.classList.add('post');
    postDOM.innerHTML = `<div class="post-header">
                            <div class="user-info">
                                <div class="profile-image"></div>
                                <div class="post-info">
                                    <span class="post-username">${postData['username']}</span>
                                    <div class="post-date">${date['date-ui']}
                                        <span class="hover-date">${date['date-tooltip']}</span>
                                    </div>
                                </div>
                            </div>
                            <i class="post-menu-button fa-solid fa-ellipsis"></i>
                         </div>
                         <div class="md-output post-content">
                            ${parse(postData['caption'], imagesData)}
                         </div>`;

    feed.insertBefore(postDOM, feed.firstChild);

    const postProfileImage = postDOM.querySelector('.profile-image');
    postProfileImage.style.backgroundImage = `url(${postData['profile_image']})`;

    setTimeout(() => {
        const postMenuButton = postDOM.querySelector('.post-menu-button');
        const postContent = postDOM.querySelector('.post-content');

        createPostMenu(postMenuButton, postDOM, postData);

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

        if (postData['username'] === sessionStorage.getItem('username')) {
            postProfileImage.addEventListener('changeProfileImage', (e) => {
                postProfileImage.style.backgroundImage = e.profileImageURL;
            }) 
        }

    }, 0); // Delay to allow content rendering
}

// Convert HTML input into string
// function decodeHTML(input) {
//     console.log(input);
//     const patterns = [
//         { regex: /<div>(.+)<\/div>/gms, replace: '$1\n' },
//         { regex: /<img (.+?)>/gm, replace: '\n<img $1>' },
//         { regex: /&lt;/gm, replace: '<' },
//         { regex: /&gt;/gm, replace: '>' },
//         { regex: /&amp;/gm, replace: '&' },
//         { regex: /&quot;/gm, replace: '"' },
//         { regex: /(?:&#39|&apos;)/gm, replace: '\'' }
//     ];

//     for (const { regex, replace } of patterns) {
//         input = input.replace(regex, replace);
//     }
    
//     input = input.replace(/\s*$/, '');
    
//     console.log(input);
//     return input;
// }

export { displayPost };