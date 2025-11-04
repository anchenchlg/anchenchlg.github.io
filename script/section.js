const articleListContainer = document.getElementById('article-list');
const categoryListContainer = document.getElementById('category');
let allArticles = [];
let currentPageIndex = 0;
const ARTICLES_PER_PAGE = 10;
let currentSortKey = null;
const sortButtons = document.querySelectorAll('.sort-btn');

//请求并加载数据，渲染文章列表
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
    document.getElementById("banner").style.display = "flex";
    document.getElementById("article-sort").style.display = "flex";
  } catch (err) {
    articleListContainer.innerHTML = '<p id="article-err">加载失败，请刷新重试</p>';
    categoryListContainer.style.display = 'none';
  }
};

//转义html
const escapeHtml = (html) => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

//文章渲染
const renderArticleList = (articles) => {
  let articleListHtml = '';
  articles.forEach(article => {
    articleListHtml += `
      <div class="article-item">
        <div class="article-thumbnail-box">
          <img src="#" alt="thumbnail">
        </div>
        <div class="article-content-box">
          <a href="#"><span class="article-title">${article.title}</span></a>
          <p class="article-summary">${article.content}</p>
          <div class="article-meta">
            <span>👤${article.author.name}/📅${article.publishDate}/👁️${article.views}/💬${article.comments}/❤️${article.likes}</span>
            <span class="article-category">${article.category}</span>
          </div>
        </div>
      </div>
    `;
  });
  articleListContainer.innerHTML = "";
  articleListContainer.insertAdjacentHTML('beforeend', articleListHtml);
};

//数据分页处理
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

//排序功能
const sortArticles = (key) => {
  const sortedArticles = [...allArticles].sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];

    if (key === 'publishDate') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

  if (aVal > bVal) return -1;
  if (aVal < bVal) return 1;
  return 0; 
  })
  renderArticleList(sortedArticles);
}

sortButtons.forEach(button => {
  button.addEventListener('click', () => {
    const key = button.dataset.key;
    sortArticles(key);
    sortButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    console.log(key);
  })
})

//动态添加分类
const updateCategoryList = () => {
  const categoryCountMap = {};
  let categoryLinksHtml = '';

  for (let i = 0; i < allArticles.length; i++) {
    const categoryName = allArticles[i].category;
    categoryCountMap[categoryName] = (categoryCountMap[categoryName] || 0) + 1;
  }

  for (const [category, count] of Object.entries(categoryCountMap)) {
    categoryLinksHtml += `<span><a href="#" class="category-btn" data-category="${category}">${category}</a>(${count})</span>`;
  }
  categoryListContainer.innerHTML = "";
  categoryListContainer.insertAdjacentHTML('beforeend', categoryLinksHtml);

  document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', e => {
      e.preventDefault();
      const category = button.dataset.category;
      filterArticlesByCategory(category);
    })
  })
};

const filterArticlesByCategory  = (category) => {
  document.getElementById("banner").style.display = "none";
  document.getElementById("article-sort").style.display = "none";
  const filtered = allArticles.filter(article => article.category === category);
  renderArticleList(filtered)
}

document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderArticles();
  sortArticles('publishDate')
  document.getElementById("home").addEventListener("click", fetchAndRenderArticles)
});




