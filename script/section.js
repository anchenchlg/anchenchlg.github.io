// ==================== 全局状态 ====================
const state = {
  allArticles: [],       // 所有文章（原始数据，不变）
  visibleArticles: [],   // 当前规则下可显示的文章
  pageIndex: 0,          // 当前页码
  pageSize: 10,          // 每页显示数量
  sortKey: 'publishDate',// 当前排序规则（默认最新文章）
  category: null         // 当前分类（null 表示全部）
};

// ==================== DOM 容器 ====================
const articleListContainer = document.getElementById('article-list');
const categoryListContainer = document.getElementById('category');
const loadMoreBtn = document.getElementById('load-more');

// ==================== 渲染文章 ====================
const renderArticles = (articles, append = true) => {
  let html = '';

  articles.forEach(a => {
    html += `
       <div class="article-item">
         <div class="article-thumbnail-box">
           <img src="#" alt="thumbnail">
         </div>
         <div class="article-content-box">
          <a href="#"><span class="article-title">${a.title}</span></a>
          <p class="article-summary">${a.content}</p>
           <div class="article-meta">
             <span>👤${a.author.name}/📅${a.publishDate}/👁️${a.views}/💬${a.comments}/❤️${a.likes}</span>
             <span class="article-category">${a.category}</span>
          </div>
         </div>
       </div>
    `;
  });

  // 是否覆盖现有内容
  if (!append) articleListContainer.innerHTML = '';
  articleListContainer.insertAdjacentHTML('beforeend', html);
};

// ==================== 分页 ====================
const loadNextPage = () => {
  const start = state.pageIndex * state.pageSize;
  const end = start + state.pageSize;
  const page = state.visibleArticles.slice(start, end);

  if (page.length === 0) {
    loadMoreBtn.style.display = 'none';
    return;
  }

  renderArticles(page, true);
  state.pageIndex++;

  // 如果没有下一页，隐藏按钮
  if (end >= state.visibleArticles.length) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'block';
  }
};

// 重置分页：页码归零，清空文章容器，显示按钮
const resetPagination = () => {
  state.pageIndex = 0;
  articleListContainer.innerHTML = '';
  loadMoreBtn.style.display = 'block';
};

// ==================== 排序 + 分类过滤 ====================
const applySortAndFilter = () => {
  let list = [...state.allArticles]; // 拷贝原数据，避免破坏 allArticles

  // 分类过滤
  if (state.category) {
    list = list.filter(a => a.category === state.category);
  }

  // 排序规则
  if (state.sortKey) {
    list.sort((a, b) => {
      switch (state.sortKey) {
        case 'publishDate':  // 最新文章
          return new Date(b.publishDate) - new Date(a.publishDate);
        case 'views':        // 热门文章
        case 'comments':     // 评论最多
        case 'likes':        // 喜欢最多
          return b[state.sortKey] - a[state.sortKey];
        default:
          return 0;
      }
    });
  }

  state.visibleArticles = list;
};

// ==================== 动态生成分类列表 ====================
const updateCategoryList = () => {
  const categoryCount = {};

  state.allArticles.forEach(a => {
    categoryCount[a.category] = (categoryCount[a.category] || 0) + 1;
  });

  // 拼接分类按钮 HTML，包含“全部”分类
  const html = `<span><a href="#" class="category-btn" data-category="">全部</a></span>` +
               Object.entries(categoryCount)
                 .map(([name, count]) => `<span><a href="#" class="category-btn" data-category="${name}">${name}</a>(${count})</span>`)
                 .join('');

  categoryListContainer.innerHTML = html;
};

// ==================== 分类事件绑定（事件委托） ====================
categoryListContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('.category-btn');
  if (!btn) return;
  e.preventDefault();

  const category = btn.dataset.category || null; // 空表示全部
  state.category = category;

  applySortAndFilter();
  resetPagination();
  loadNextPage();

  // 高亮当前分类按钮
  document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
});

// ==================== 排序事件绑定 ====================
document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.sortKey = btn.dataset.key;   // 改变排序状态
    applySortAndFilter();              // 重新计算可显示文章
    resetPagination();                 // 重置页码
    loadNextPage();                     // 显示第一页

    // 高亮当前排序按钮
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ==================== 加载更多按钮 ====================
loadMoreBtn.addEventListener('click', loadNextPage);

// ==================== 异步加载文章 ====================
const fetchArticles = async () => {
  const res = await fetch('./data/section.json');
  if (!res.ok) throw new Error('fetch failed');
  return await res.json();
};

// ==================== 初始化 ====================
const init = async () => {
  try {
    state.allArticles = await fetchArticles();
    updateCategoryList();     // 动态生成分类按钮
    applySortAndFilter();     // 初始排序和过滤
    resetPagination();        // 初始化分页
    loadNextPage();           // 显示第一页
  } catch (err) {
    articleListContainer.innerHTML = '加载失败，请刷新重试';
    categoryListContainer.style.display = 'none';
  }
};

// 页面加载完成后启动
document.addEventListener('DOMContentLoaded', init);
