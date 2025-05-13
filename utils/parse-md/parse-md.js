function parse(input) {
    const patterns = [
        { regex: /^# (.+)$/gm, replace: '<h1>$1</h1>' },
        { regex: /^## (.+)$/gm, replace: '<h2>$1</h2>' },
        { regex: /^### (.+)$/gm, replace: '<h3>$1</h3>' },
        { regex: /^#### (.+)$/gm, replace: '<h4>$1</h4>' },
        { regex: /^##### (.+)$/gm, replace: '<h5>$1</h5>' },
        { regex: /^###### (.+)$/gm, replace: '<h6>$1</h6>' },
        { regex: /^> (.+)$/gm, replace: '<span class="quote">$1</span>' },
        { regex: /((?:\*\*?|__?)?(?:\[.+\]\(.+\)|.+)+(?:\*\*?|__?)?)/gm, replace: '<p>$1</p>' },
        { regex: /\[(.+)\]\((.+)\)/gm, replace:'<a href="$2">$1</a>' },
        { regex: /\*\*(.+?)\*\*/gm, replace: '<strong>$1</strong>' },
        { regex: /__(.+?)__/gm, replace: '<strong>$1</strong>' },
        { regex: /\*(.+?)\*/gm, replace: '<em>$1</em>' },
        { regex: /_(.+?)_/gm, replace: '<em>$1</em>' },
        { regex: /^`([^`]+)`$/gm, replace: '<span class="inline-code">$1</span>' },
        { regex: /^```([\s\S]+)```$/gm, replace: '<pre class="code-block">$1</pre>' },
    ];

    for (const { regex , replace } of patterns) {
        input = input.replace(regex, replace);
    }

    return input;
}

export { parse };
