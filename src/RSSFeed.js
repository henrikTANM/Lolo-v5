import React, { useState, useEffect } from 'react';
import { fetchRSSFeed, fetchArticleContent } from './Fetcher';
import Modal from 'react-modal';


const RSSFeed = ({ feedUrl, removeFeed }) => {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [removedArticles, setRemovedArticles] = useState(JSON.parse(sessionStorage.getItem(`removedArticles_${feedUrl}`)) || []);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentArticleContent, setCurrentArticleContent] = useState('');
    const [feedTitle, setFeedTitle] = useState("Loading...");

    // fetch articles and set categories
    useEffect(() => {
        const getRSSFeed = async () => {
            console.log(feedUrl);
            const items = await fetchRSSFeed(feedUrl);
            if (items.length > 0) {
                setFeedTitle(items[0].feedTitle);
            } else {

            }
            setArticles(items);

            const uniqueCategories = Array.from(
                new Set(items.flatMap(item => item.categories))
            );
            setCategories(uniqueCategories);
        };

        getRSSFeed();
    }, [feedUrl]);

    // set removed articles item in session storage
    useEffect(() => {
        sessionStorage.setItem(`removedArticles_${feedUrl}`, JSON.stringify(removedArticles));
    }, [removedArticles, feedUrl]);

    // open modal to view articles
    const openModal = async (url) => {
        setModalIsOpen(true);
        const content = await fetchArticleContent(url);
        setCurrentArticleContent(content);
    };

    // close modal
    const closeModal = () => {
        setModalIsOpen(false);
        setCurrentArticleContent('');
    };

    // remove article
    const removeArticle = (link) => {
        setRemovedArticles([...removedArticles, link]);
    };

    // filter out removed articles and articles with different categories than selected category
    const filteredItems = selectedCategory
        ? articles.filter(item => item.categories.includes(selectedCategory) && !removedArticles.includes(item.link))
        : articles.filter(item => !removedArticles.includes(item.link));

    return (
        <div>
            <div className="feedHeader">
                <h1 style={{color: "#171238"}}>{feedTitle}</h1>
                <div className="filter">
                    <label style={{color: "#171238"}}>Filter by category:</label>
                    <select
                        id="categoryFilter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">All</option>
                        {categories.map((category, index) => (
                            <option key={index} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
                <button id="removeFeedButton" onClick={() => removeFeed(feedUrl)}>Remove Feed</button>
            </div>
            <ul>
                {filteredItems.map((item, index) => (
                    <li key={index}>
                        <div className="article">
                            {item.imageUrl && <img className="articleImage" src={item.imageUrl} alt={item.title}
                                                   onClick={() => openModal(item.link)}/>}
                            <div className="articleContent">
                                <div className="textContent">
                                    <h4 className="articleTitle" onClick={() => openModal(item.link)}>{item.title}</h4>
                                    <p onClick={() => openModal(item.link)} style={{cursor: 'pointer', color: "#171238"}}>{item.description}</p>
                                </div>
                                <div className="articleFooter">
                                    <p><small>{item.pubDate.toLocaleDateString()}</small></p>
                                    <button onClick={() => removeArticle(item.link)}>Remove</button>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Article Content"
                scalable='true'
                ariaHideApp={false}
            >
                <button onClick={closeModal}>Close</button>
                <div className="modalContent" dangerouslySetInnerHTML={{__html: currentArticleContent}}/>
            </Modal>
        </div>
    );
};

export default RSSFeed;