// 在DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化主题（检查本地存储中的主题设置）
    initTheme();
    
    // 初始化导航菜单
    initMobileNav();
    
    // 添加平滑滚动
    initSmoothScroll();
    
    // 添加元素进入视图时的动画
    initScrollAnimations();
});

// 初始化主题设置
function initTheme() {
    const themeToggle = document.getElementById('checkbox');
    const storedTheme = localStorage.getItem('theme');
    
    // 如果本地存储中有主题设置，则应用它
    if (storedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
        updateImagesForDarkMode(true); // 更新图片为深色模式
    } else {
        document.body.removeAttribute('data-theme');
        themeToggle.checked = false;
        updateImagesForDarkMode(false); // 更新图片为浅色模式
    }
    
    // 监听主题切换
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            updateImagesForDarkMode(true); // 更新图片为深色模式
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            updateImagesForDarkMode(false); // 更新图片为浅色模式
        }
    });
    
    // 检测系统主题偏好
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 如果用户没有手动设置主题，则遵循系统主题
    if (!storedTheme) {
        if (prefersDarkScheme.matches) {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.checked = true;
            updateImagesForDarkMode(true); // 更新图片为深色模式
        }
    }
    
    // 监听系统主题变化
    prefersDarkScheme.addEventListener('change', function(e) {
        // 仅在用户没有手动设置主题时响应系统主题变化
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.setAttribute('data-theme', 'dark');
                themeToggle.checked = true;
                updateImagesForDarkMode(true); // 更新图片为深色模式
            } else {
                document.body.removeAttribute('data-theme');
                themeToggle.checked = false;
                updateImagesForDarkMode(false); // 更新图片为浅色模式
            }
        }
    });
}

// 更新图片以适应深色模式
function updateImagesForDarkMode(isDarkMode) {
    // 获取页面上所有图片
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        const src = img.getAttribute('src');
        
        if (src) {
            if (isDarkMode) {
                // 检查是否已经是深色模式图片
                if (!src.toLowerCase().endsWith('_dark.jpg')) {
                    // 替换.png为_dark.jpg
                    img.setAttribute('src', src.replace(/\.png$/i, '_dark.jpg'));
                }
            } else {
                // 如果是深色模式图片，恢复为浅色模式
                if (src.toLowerCase().endsWith('_dark.jpg')) {
                    // 替换_dark.jpg为.png
                    img.setAttribute('src', src.replace(/_dark\.jpg$/i, '.png'));
                }
            }
        }
    });
}

// 初始化移动端导航菜单
function initMobileNav() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            
            // 切换菜单图标
            const menuIcon = this.querySelector('.material-icons');
            if (menuIcon.textContent === 'menu') {
                menuIcon.textContent = 'close';
            } else {
                menuIcon.textContent = 'menu';
            }
        });
        
        // 点击导航链接时关闭菜单
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    mainNav.classList.remove('active');
                    menuToggle.querySelector('.material-icons').textContent = 'menu';
                }
            });
        });
    }
    
    // 添加移动端导航的样式
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .main-nav.active {
                display: block;
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                background-color: var(--bg-color);
                box-shadow: var(--shadow-2);
                padding: 20px;
                z-index: 10;
            }
            
            .main-nav.active ul {
                flex-direction: column;
                align-items: center;
            }
            
            .main-nav.active a {
                padding: 10px 0;
                display: block;
            }
        }
    `;
    document.head.appendChild(style);
}

// 实现平滑滚动
function initSmoothScroll() {
    // 获取所有导航链接
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 阻止默认行为
            e.preventDefault();
            
            // 获取目标元素
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // 获取目标元素的位置
                const headerHeight = document.querySelector('.app-header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                // 平滑滚动到目标位置
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // 更新URL（不需要重载页面）
                history.pushState(null, null, targetId);
            }
        });
    });
    
    // 监听滚动事件，更新活动链接
    window.addEventListener('scroll', updateActiveNavLink);
}

// 更新导航菜单中的活动链接
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.main-nav a');
    
    // 获取当前滚动位置
    const scrollY = window.pageYOffset;
    const headerHeight = document.querySelector('.app-header').offsetHeight;
    
    // 找到当前滚动位置所在的部分
    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 100; // 添加偏移量以提前激活
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            // 移除所有导航链接的活动状态
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            // 给当前部分的导航链接添加活动状态
            document.querySelector(`.main-nav a[href="#${sectionId}"]`).classList.add('active');
        }
    });
}

// 添加元素进入视图时的动画
function initScrollAnimations() {
    // 要应用动画的元素
    const animationElements = [
        '.feature-card',
        '.step',
        '.feature-highlight',
        '.testimonial-card',
        '.contact-info',
        '.feedback-form'
    ];
    
    // 使元素在滚动到视图中时显示动画
    const animateOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target); // 不再观察已经显示动画的元素
            }
        });
    }, { threshold: 0.1 }); // 当元素至少有10%进入视图时触发
    
    // 对每个选择器查找元素并应用观察器
    animationElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            animateOnScroll.observe(element);
        });
    });
}

// 页面加载时应用动画
window.addEventListener('load', function() {
    // 添加初始动画
    document.querySelector('.hero-content').classList.add('fade-in');
    
    // 延迟添加手机模型的动画
    setTimeout(() => {
        document.querySelector('.hero-image').classList.add('fade-in');
    }, 300);
}); 