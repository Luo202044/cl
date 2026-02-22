const webLinks = [
  {
    name: "雨云",
    description: "本站计算服务提供商",
    url: "https://www.rainyun.com/luoqing_",
    icon: "fa-cloud",
    color: "#2196F3"
  },
  {
    name: "DeepSeek",
    description: "AI辅助开发工具",
    url: "https://chat.deepseek.com",
    icon: "fa-brain",
    color: "#9C27B0"
  },
  {
    name: "待添加",
    description: "等待添加更多网站",
    url: "#",
    icon: "fa-link",
    color: "#9E9E9E"
  },
  {
    name: "待添加",
    description: "等待添加更多网站",
    url: "#",
    icon: "fa-link",
    color: "#9E9E9E"
  }
];

function renderLinks() {
  const grid = document.getElementById('linksGrid');
  if (!grid) return;
  
  grid.innerHTML = webLinks.map((link, index) => `
    <div class="link-card anim-entry anim-${index + 2} ${link.url === '#' ? 'disabled' : ''}" 
         style="--card-color: ${link.color || 'var(--primary)'}"
         onclick="openLink('${link.url}')">
      <div class="link-icon">
        <i class="fas ${link.icon || 'fa-globe'}"></i>
      </div>
      <h3 class="link-name">${link.name}</h3>
      <p class="link-desc">${link.description}</p>
      ${link.url !== '#' ? `
        <span class="link-action">
          访问网站 <i class="fas fa-external-link-alt"></i>
        </span>
      ` : ''}
    </div>
  `).join('');
}

function openLink(url) {
  if (url === '#') return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

document.addEventListener('DOMContentLoaded', renderLinks);
