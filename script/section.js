const articleListContainer = document.getElementById('article-list');
let articleListHtml = '';
const categoryListContainer = document.getElementById('category');
let allArticles = [];
let currentPageIndex = 0;
const ARTICLES_PER_PAGE = 10;

const fetchAndRenderArticles = async () => {
  try {
    const response = await fetch("./data/section.json");
    if (!response.ok) throw new Error("Network response was not ok");
    allArticles = await response.json();
    allArticles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    loadNextPageOfArticles();

    articleListContainer.insertAdjacentHTML('beforeend', `
      <button id="load-more" class="load-more-btn">加载更多……</button>
    `);
    
    document.getElementById('load-more').addEventListener('click', loadNextPageOfArticles);
  } catch (err) {
    articleListContainer.innerHTML = '<p id="article-err">加载失败，请刷新重试</p>';
    categoryListContainer.style.display = 'none';
  }
};

const escapeHtml = (html) => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const renderArticleList = (articles) => {
  articles.forEach(article => {
    articleListHtml += `
      <div class="article-item">
        <div class="article-thumbnail-box">
          <img src="#" alt="thumbnail">
        </div>
        <div class="article-content-box">
          <span class="article-title">${article.title}</span>
          <p class="article-summary">${article.content}</p>
          <div class="article-meta">
            <span>👤${article.author.name}/📅${article.publishDate}/👁️${article.views}/💬${article.comments}/❤️${article.likes}</span>
            <span class="article-category">${article.category}</span>
          </div>
        </div>
      </div>
    `;
  });
  articleListContainer.insertAdjacentHTML('beforeend', articleListHtml);
};

const loadNextPageOfArticles = () => {
  const startIndex = currentPageIndex * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const nextPageArticles = allArticles.slice(startIndex, endIndex);

  if (nextPageArticles.length === 0) {
    document.getElementById('load-more')?.remove();
    return;
  }

  renderArticleList(nextPageArticles);
  currentPageIndex++;
  updateCategoryList();

  if (endIndex >= allArticles.length) {
    document.getElementById('load-more')?.remove();
  }
};

const updateCategoryList = () => {
  const categoryCountMap = {};
  let categoryLinksHtml = '';

  for (let i = 0; i < allArticles.length; i++) {
    const categoryName = allArticles[i].category;
    categoryCountMap[categoryName] = (categoryCountMap[categoryName] || 0) + 1;
  }

  for (const [category, count] of Object.entries(categoryCountMap)) {
    categoryLinksHtml += `<a href="#">${category}(${count})</a>`;
  }
  categoryListContainer.insertAdjacentHTML('beforeend', categoryLinksHtml);
};

document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderArticles();
});