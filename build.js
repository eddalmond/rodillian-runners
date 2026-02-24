#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const WORDPRESS_URL = process.env.WORDPRESS_URL || 'https://example.com/wp-json/wp/v2';
const OUTPUT_DIR = path.join(__dirname, 'dist');

async function fetchWP(endpoint) {
    return new Promise((resolve, reject) => {
        const url = `${WORDPRESS_URL}${endpoint}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Failed to parse JSON'));
                }
            });
        }).on('error', reject);
    });
}

function stripHTML(html) {
    return html.replace(/<[^>]*>/g, '').trim();
}

function excerpt(html, length = 150) {
    const text = stripHTML(html);
    return text.length > length ? text.substring(0, length) + '...' : text;
}

function generatePage(posts, type) {
    const titles = {
        posts: 'Latest News',
        pages: 'Pages'
    };
    
    let html = `<section id="${type}" class="${type}">\n`;
    html += `  <div class="container">\n`;
    html += `    <h2>${titles[type] || type}</h2>\n`;
    html += `    <div class="${type}-grid">\n`;
    
    for (const post of posts) {
        const title = stripHTML(post.title.rendered);
        const content = excerpt(post.content.rendered);
        const date = new Date(post.date).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        
        html += `      <article class="${type}-card">\n`;
        if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
            html += `        <img src="${post._embedded['wp:featuredmedia'][0].source_url}" alt="${title}">\n`;
        }
        html += `        <h3>${title}</h3>\n`;
        html += `        <p class="meta">${date}</p>\n`;
        html += `        <p>${content}</p>\n`;
        html += `        <a href="${post.link}" class="read-more">Read more</a>\n`;
        html += `      </article>\n`;
    }
    
    html += `    </div>\n`;
    html += `  </div>\n`;
    html += `</section>\n`;
    
    return html;
}

async function build() {
    console.log('Building static site...\n');
    
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    const indexPath = path.join(__dirname, 'index.html');
    let indexHTML = fs.readFileSync(indexPath, 'utf8');
    
    const injectPoint = '</main>';
    let dynamicContent = '';
    
    try {
        console.log('Fetching posts from WordPress...');
        const posts = await fetchWP('/posts?_embed&per_page=6');
        console.log(`Found ${posts.length} posts\n`);
        
        if (posts.length > 0) {
            dynamicContent += generatePage(posts, 'posts');
        }
    } catch (err) {
        console.log(`Warning: Could not fetch posts: ${err.message}\n`);
    }
    
    try {
        console.log('Fetching pages from WordPress...');
        const pages = await fetchWP('/pages?_embed&per_page=10');
        console.log(`Found ${pages.length} pages\n`);
        
        if (pages.length > 0) {
            dynamicContent += generatePage(pages, 'pages');
        }
    } catch (err) {
        console.log(`Warning: Could not fetch pages: ${err.message}\n`);
    }
    
    if (dynamicContent) {
        indexHTML = indexHTML.replace(injectPoint, dynamicContent + injectPoint);
    }
    
    const cssContent = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
    const cssBlock = `<style>\n${cssContent}</style>`;
    indexHTML = indexHTML.replace('<link rel="stylesheet" href="styles.css">', cssBlock);
    
    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHTML);
    console.log('Build complete!');
    console.log(`Output: ${OUTPUT_DIR}/index.html`);
}

build().catch(console.error);
