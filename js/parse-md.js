function parse(input, imagesObject) {
    if (!input) {
        return;
    }
    
    const patterns = [
        { regex: /^\s*$/gm, replace: '<br>' },
        { regex: /^# (.+?)$/gm, replace: '<h1>$1</h1>' },
        { regex: /^## (.+?)$/gm, replace: '<h2>$1</h2>' },
        { regex: /^### (.+?)$/gm, replace: '<h3>$1</h3>' },
        { regex: /^#### (.+?)$/gm, replace: '<h4>$1</h4>' },
        { regex: /^##### (.+?)$/gm, replace: '<h5>$1</h5>' },
        { regex: /^###### (.+?)$/gm, replace: '<h6>$1</h6>' },
        { regex: /^> (.+?)$/gm, replace: '<span class="quote">$1</span>' },
        { regex: /`([^`]+?)`/g, replace: '<span class="inline-code">$1</span>' },
        { regex: /\[(.+)\]\((.+)\)/gm, replace:'<a href="$2">$1</a>' },
        { regex: /\*\*(.+?)\*\*/gm, replace: '<strong>$1</strong>' },
        { regex: /__(.+?)__/gm, replace: '<strong>$1</strong>' },
        { regex: /\*(.+?)\*/gm, replace: '<em>$1</em>' },
        { regex: /_(.+?)_/gm, replace: '<em>$1</em>' },
        { regex: /^---$/gm, replace: '<hr>' },
        { regex: /^(?!<(?:.+?)>)(.+|\n)(?!<\/(?:.+?)>)$/gm, replace: '<p>$1</p>' }
        
    ];

    // Temporarily save code blocks
    const codeBlocks = [];
    input = input.replace(/```([\s\S]*)```/gm, (_, code) => {
        codeBlocks.push(code);
        return `<codeblock${codeBlocks.length - 1}>`;
    });

    // Format images
    const imageRegex = /!\[(.+?)\]\((.+?)\)/gm;
    input = input.replace(imageRegex, (_, alt, src) => {
        return `<img alt="${alt}" src="${imagesObject[src]}"`;
    });

    // Format all the other patterns
    for (const { regex , replace } of patterns) {
        input = input.replace(regex, replace);
    }

    // Input regex back from temporary codeBlock array
    input = input.replace(/<codeblock(\d+)>/g, (_, i) => {
        return `<pre class="code-block">${escapeHTML(codeBlocks[i])}</pre>`;
    });
    
    return input;
}

function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


export { parse };
