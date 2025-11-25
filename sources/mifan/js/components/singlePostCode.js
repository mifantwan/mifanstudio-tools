// Syntax highlighting patterns for different languages
const syntaxPatterns = {
    python: {
        keywords: /\b(def|class|if|elif|else|for|while|try|except|finally|with|import|from|as|return|yield|lambda|pass|break|continue|and|or|not|in|is|None|True|False)\b/g,
        strings: /(['"])(?:(?=(\\?))\2.)*?\1/g,
        comments: /#.*$/gm,
        numbers: /\b\d+\.?\d*\b/g,
        functions: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g
    },
    javascript: {
        keywords: /\b(const|let|var|function|class|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|this|super|extends|import|export|default|async|await|typeof|instanceof|in|of|true|false|null|undefined)\b/g,
        strings: /(['"`])(?:(?=(\\?))\2.)*?\1/g,
        comments: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
        numbers: /\b\d+\.?\d*\b/g,
        functions: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g
    },
    html: {
        tags: /<\/?[\w\s="/.':;#-\/]+>/g,
        attributes: /\s+[\w-]+(?=\s*=\s*["'])/g,
        strings: /(["'])(?:(?=(\\?))\2.)*?\1/g,
        comments: /<!--[\s\S]*?-->/g
    },
    css: {
        selectors: /[^{}]+(?=\{)/g,
        properties: /[\w-]+(?=\s*:)/g,
        values: /:\s*[^;]+/g,
        comments: /\/\*[\s\S]*?\*\//g,
        strings: /(["'])(?:(?=(\\?))\2.)*?\1/g
    },
    json: {
        keys: /"([^"]+)":/g,
        strings: /"([^"]+)"/g,
        numbers: /\b\d+\.?\d*\b/g,
        booleans: /\b(true|false|null)\b/g
    },
    rust: {
        keywords: /\b(fn|let|mut|const|static|struct|enum|impl|trait|type|where|use|pub|mod|crate|super|self|if|else|match|loop|while|for|in|break|continue|return|async|await|move|ref|unsafe|extern|dyn|true|false)\b/g,
        strings: /(r#*"(?:[^"\\]|\\.)*"#*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
        comments: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
        numbers: /\b\d+\.?\d*\b/g,
        functions: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\(|!)/g
    },
    php: {
        keywords: /\b(function|class|interface|trait|namespace|use|public|private|protected|static|final|abstract|const|if|else|elseif|switch|case|default|for|foreach|while|do|break|continue|return|try|catch|finally|throw|new|clone|extends|implements|instanceof|echo|print|require|require_once|include|include_once|true|false|null)\b/g,
        strings: /(['"])(?:(?=(\\?))\2.)*?\1/g,
        comments: /\/\/.*$|\/\*[\s\S]*?\*\/|#.*$/gm,
        numbers: /\b\d+\.?\d*\b/g,
        functions: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g
    },
    liquid: {
        tags: /\{%[\s\S]*?%\}|\{\{[\s\S]*?\}\}/g,
        keywords: /\b(if|elsif|else|endif|unless|endunless|case|when|endcase|for|endfor|break|continue|assign|capture|endcapture|increment|decrement|include|render|section|layout|block|endblock|comment|endcomment|raw|endraw|liquid|echo|tablerow|endtablerow|cycle|paginate|endpaginate)\b/g,
        filters: /\|[\s]*[a-zA-Z_][a-zA-Z0-9_]*/g,
        strings: /(["'])(?:(?=(\\?))\2.)*?\1/g,
        comments: /\{%\s*comment\s*%\}[\s\S]*?\{%\s*endcomment\s*%\}|\{#[\s\S]*?#\}/g,
        properties: /\b[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*/g
    }
};

function highlightCode(codeElement, language) {
    const originalText = codeElement.textContent;
    const patterns = syntaxPatterns[language];
    
    if (!patterns) {
        // If language not supported, just return original
        return;
    }

    const tokens = [];
    
    // Define priority order - earlier types take precedence
    const priorityOrder = ['comments', 'strings', 'keywords', 'booleans', 'numbers', 'functions', 'tags', 'attributes', 'properties', 'values', 'keys', 'selectors'];

    // Extract all tokens with their positions and priority
    Object.entries(patterns).forEach(([type, pattern]) => {
        const priority = priorityOrder.indexOf(type);
        const regex = new RegExp(pattern.source, pattern.flags || 'g');
        let match;
        
        // Reset regex lastIndex to avoid issues
        regex.lastIndex = 0;
        
        while ((match = regex.exec(originalText)) !== null) {
            tokens.push({
                type,
                start: match.index,
                end: match.index + match[0].length,
                text: match[0],
                priority: priority >= 0 ? priority : 999
            });
        }
    });

    // Sort tokens by priority first (lower priority number = higher priority), then by position
    tokens.sort((a, b) => {
        if (a.priority !== b.priority) {
            return a.priority - b.priority;
        }
        return a.start - b.start;
    });

    // Remove overlapping tokens (keep highest priority token)
    // Process tokens in priority order, so higher priority tokens are added first
    const filteredTokens = [];
    const usedRanges = [];
    
    tokens.forEach(token => {
        // Check if this token overlaps with any already used range
        const overlaps = usedRanges.some(range => 
            !(token.end <= range.start || token.start >= range.end)
        );
        
        if (!overlaps) {
            filteredTokens.push(token);
            usedRanges.push({ start: token.start, end: token.end });
        }
    });

    // Sort filtered tokens by position for rendering
    filteredTokens.sort((a, b) => a.start - b.start);

    // Build highlighted HTML
    let result = '';
    let lastIndex = 0;

    filteredTokens.forEach(token => {
        // Add text before token
        if (token.start > lastIndex) {
            result += escapeHtml(originalText.substring(lastIndex, token.start));
        }
        // Add highlighted token
        result += `<span class="hl-${token.type}">${escapeHtml(token.text)}</span>`;
        lastIndex = token.end;
    });

    // Add remaining text
    if (lastIndex < originalText.length) {
        result += escapeHtml(originalText.substring(lastIndex));
    }

    codeElement.innerHTML = result;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function detectLanguage(codeElement) {
    const classList = Array.from(codeElement.classList);
    const langClass = classList.find(cls => cls.startsWith('language-'));
    if (langClass) {
        return langClass.replace('language-', '');
    }
    return null;
}

export default function singlePostCode() {
    const codes = document.querySelectorAll('pre code');
    if (!codes.length) return;

    codes.forEach(codeElement => {
        const language = detectLanguage(codeElement);
        if (language && syntaxPatterns[language]) {
            highlightCode(codeElement, language);
        }
    });
}