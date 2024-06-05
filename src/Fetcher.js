import axios from 'axios';

const MERCURY_API = 'https://uptime-mercury-api.azurewebsites.net/webparser';

//fetch feed from input url
export const fetchRSSFeed = async (rssUrl) => {
    try {
        const response = await axios.get(rssUrl, { headers: {
                'Accept': 'application/rss+xml',
                'Access-Control-Allow-Origin' : '*'
        } });
        const parser = new DOMParser();
        const xml = parser.parseFromString(response.data, 'text/xml');
        const items = xml.querySelectorAll('item');
        const channel = xml.querySelector('channel > title').textContent;

        // create Array of articles with selected items from feed items
        const articles = Array.from(items).map(item => {
            const mediaContent = item.querySelector('media\\:content, content');
            const enclosure = item.querySelector('enclosure');
            const imageUrl = mediaContent?.getAttribute('url') || enclosure?.getAttribute('url') || '';
            return {
                feedTitle: channel,
                title: item.querySelector('title').textContent,
                link: item.querySelector('link').textContent,
                description: item.querySelector('description').textContent,
                pubDate: new Date(item.querySelector('pubDate').textContent),
                categories: Array.from(item.querySelectorAll('category')).map(cat => cat.textContent),
                imageUrl
            };
        });

        // sort articles by publish date latest to oldest
        articles.sort((a, b) => b.pubDate - a.pubDate);

        return articles;
    } catch (error) {
        console.error('Error fetching RSS feed:', error);
        return [];
    }
};

// validate input url
export const validateRSSFeed = async (rssUrl) => {
    try {
        const response = await axios.get(rssUrl, { headers: { 'Accept': 'application/rss+xml' } });
        const parser = new DOMParser();
        const xml = parser.parseFromString(response.data, 'text/xml');
        return (xml.querySelector('rss') || xml.querySelector('feed')) ? true : false; // Check for RSS or Atom feeds
    } catch (error) {
        return false;
    }
};

// fetch cleaned content from article link
export const fetchArticleContent = async (url) => {
    try {
        const response = await axios.post(MERCURY_API, { url });
        return response.data.content;
    } catch (error) {
        console.error('Error fetching article content:', error);
        return 'Failed to fetch content';
    }
};