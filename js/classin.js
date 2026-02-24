const groupsData = {
  categories: [
    { id: 1, name: "组别1", icon: "fa-mobile-alt" },
    { id: 2, name: "组别2", icon: "fa-laptop-code" },
    { id: 3, name: "组别3", icon: "fa-gamepad" },
    { id: 4, name: "组别4", icon: "fa-film" }
  ],
  groups: [
    {
      name: "官方项目:永久聊天群",
      id: "281864003",
      description: "官方项目永久聊天群",
      link: "https://www.eeo.cn/s/a/?cid=281864003",
      category: 1
    },
    {
      name: "我不是来救你的，我是来爱你的——《全球高考》",
      id: "295799049",
      description: "聊天群",
      link: "https://www.eeo.cn/s/a/?cid=295799049",
      category: 1
    },
    {
      name: "皇宫",
      id: "279289745",
      description: "近似于古代制度的群聊",
      link: "https://www.eeo.cn/s/a/?cid=210079055",
      category: 1
    },
    {
      name: "开始学",
      id: "295170341",
      description: "欢迎各位同学加入 本群分享学习资料以及学习心得+方法",
      link: "https://www.classin.com/s/a/?cid=295170341",
      category: 1
    },
    {
      name: "有人陪我熬夜吗",
      id: "294679959",
      description: "聊天群",
      link: "https://www.eeo.cn/s/a/?cid=294679959",
      category: 1
    },
    {
      name: "₍˄·͈༝·͈˄*₎◞ ̑",
      id: "292245095",
      description: "₍˄·͈༝·͈˄*₎◞ ̑̑",
      link: "https://www.eeo.cn/s/a/?cid=292245095",
      category: 1
    },
    {
      name: "2026活人群",
      id: "295622951",
      description: "聊天群",
      link: "https://www.eeo.cn/s/a/?cid=295622951",
      category: 2
    },
    {
      name: "2026",
      id: "295768447",
      description: "聊天群",
      link: "https://www.eeo.cn/s/a/?cid=295768447",
      category: 2
    },
    {
      name: "聆听风的细语",
      id: "295799037",
      description: "聊天群",
      link: "https://www.eeo.cn/s/a/?cid=295799037",
      category: 2
    },
    {
      name: "除夕特别版 洋葱新闻 Onion News",
      id: "295769095",
      description: "聊天群",
      link: "https://www.classin.com/s/a/?cid=295769095",
      category: 2
    },
    {
      name: "如",
      id: "296900141",
      description: "聊天群",
      link: "https://www.eeo.cn/s/a/?cid=296900141",
      category: 2
    },
    {
      name: "😋",
      id: "295631125",
      description: "聊天群",
      link: "https://www.eeo.cn/s/a/?cid=295631125",
      category: 2
    }
  ]
};

let activeCategory = 'all';

function renderGroups(category) {
  const grid = document.getElementById('groupsGrid');
  const filterHint = document.getElementById('filterHint');
  
  if (!grid) return;
  
  let filteredGroups = groupsData.groups;
  
  if (category !== 'all') {
    filteredGroups = groupsData.groups.filter(g => g.category === parseInt(category));
    const catName = groupsData.categories.find(c => c.id === parseInt(category))?.name;
    if (filterHint) {
      filterHint.textContent = `- ${catName}`;
      filterHint.style.display = 'inline';
    }
  } else {
    if (filterHint) {
      filterHint.style.display = 'none';
    }
  }
  
  grid.innerHTML = filteredGroups.map((group, index) => `
    <div class="group-card anim-entry anim-${(index % 3) + 5}" onclick="openGroup('${group.link}')">
      <div class="group-header">
        <div class="group-icon">
          <i class="fas fa-users"></i>
        </div>
        <span class="group-id">群号: ${group.id}</span>
      </div>
      <h3 class="group-name">${group.name}</h3>
      <p class="group-desc">${group.description}</p>
      <span class="group-link">
        加入群聊 <i class="fas fa-arrow-right"></i>
      </span>
    </div>
  `).join('');
}

function openGroup(link) {
  window.open(link, '_blank', 'noopener,noreferrer');
}

function initCategoryFilters() {
  const filters = document.getElementById('categoryFilters');
  if (!filters) return;
  
  filters.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      
      filters.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      activeCategory = category;
      renderGroups(category);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderGroups('all');
  initCategoryFilters();
});
