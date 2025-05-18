import { displayPost } from "./display-post.js";

fetch('/load-feed')
    .then(res => res.json())
    .then(data => {
        if (data['result'].length === 0) {
            return;
        }
        
        for (let postData of data['result']) {
            displayPost(postData);
        }
    });
