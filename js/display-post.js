import { createPostMenu  } from './post-menu.js';
import { parse } from './parse-md.js';

function displayPost(postData) {
    const feed = document.getElementById('feed');
    const date = JSON.parse(postData['date']);

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
                            <i class="post-menu-button fa-solid fa-ellipsis"></i>
                         </div>
                         <div class="md-output post-content">
                            ${parse(decodeHTML(postData['caption']))}
                         </div>`;

    feed.insertBefore(newPost, feed.firstChild);

    setTimeout(() => {
        const postMenuButton = newPost.querySelector('.post-menu-button');    
        createPostMenu(postMenuButton, newPost, postData);

        const postContent = newPost.querySelector('.post-content');
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
    }, 0); // Delay to allow content rendering
}

// Convert HTML input into string
function decodeHTML(input) {
    console.log(input);
    const patterns = [
        { regex: /(?:<div>)?<br>(?:<\/div>)?/gm, replace: '\n' },
        { regex: /<div>([\s\S]+?)<\/div>/gm, replace: '\n$1' },
        { regex: /<img (.+?)>/gm, replace: '\n<img $1>' },
        { regex: /&lt;/gm, replace: '<' },
        { regex: /&gt;/gm, replace: '>' },
        { regex: /&amp;/gm, replace: '&' },
        { regex: /&quot;/gm, replace: '"' },
        { regex: /(?:&#39|&apos;)/gm, replace: '\'' }
    ];

    for (const { regex, replace } of patterns) {
        input = input.replace(regex, replace);
    }
    
    input = input.replace(/\s*$/, '');
    
    console.log(input);
    return input;
}

export { decodeHTML, displayPost };