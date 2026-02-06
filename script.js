class TimeTrackingDashboard {
    constructor() {
        this.currentTimeframe = 'weekly';
        this.data = [];
        this.activitiesGrid = document.querySelector('.activities-grid');
        this.timeframeButtons = document.querySelectorAll('.timeframe-btn');
        this.icons = {
            work: './images/icon-work.svg',
            play: './images/icon-play.svg',
            study: './images/icon-study.svg',
            exercise: './images/icon-exercise.svg',
            social: './images/icon-social.svg',
            'self-care': './images/icon-self-care.svg'
        };
        
        this.init();
    }
    
    async init() {
        await this.fetchData();
        this.renderActivities();
        this.setupEventListeners();
    }
    
  
async fetchData() {
    try {
        //local endpoint 
        const response = await fetch('http://localhost:3000/timestats');
        if (!response.ok) {
            // Fall back to local JSON file
            const fallbackResponse = await fetch('./data.json');
            this.data = await fallbackResponse.json();
        } else {
            this.data = await response.json();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        // Use mock data as last resort
        this.data = this.getMockData();
    }
}

getMockData() {
    return [
        { title: "Work", timeframes: { daily: { current: 5, previous: 7 }, weekly: { current: 32, previous: 36 }, monthly: { current: 103, previous: 128 } } },
        { title: "Play", timeframes: { daily: { current: 1, previous: 2 }, weekly: { current: 10, previous: 8 }, monthly: { current: 23, previous: 29 } } },
        { title: "Study", timeframes: { daily: { current: 0, previous: 1 }, weekly: { current: 4, previous: 7 }, monthly: { current: 13, previous: 19 } } },
        { title: "Exercise", timeframes: { daily: { current: 1, previous: 1 }, weekly: { current: 4, previous: 5 }, monthly: { current: 11, previous: 18 } } },
        { title: "Social", timeframes: { daily: { current: 1, previous: 3 }, weekly: { current: 5, previous: 10 }, monthly: { current: 21, previous: 23 } } },
        { title: "Self Care", timeframes: { daily: { current: 0, previous: 1 }, weekly: { current: 2, previous: 2 }, monthly: { current: 7, previous: 11 } } }
    ];
}
    
    showErrorState() {
        this.activitiesGrid.innerHTML = `
            <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <p>Unable to load data. Please try again later.</p>
            </div>
        `;
    }
    
    createActivityCard(activity) {
        const timeframeData = activity.timeframes[this.currentTimeframe];
        const previousLabel = this.getPreviousLabel(this.currentTimeframe);
        
        return `
            <div class="activity-card" data-type="${activity.title.toLowerCase()}">
                <div class="activity-header">
                    <img src="${this.icons[activity.title.toLowerCase()]}" 
                         alt="${activity.title}" 
                         class="activity-icon">
                </div>
                <div class="activity-content">
                    <div class="activity-title">
                        <h3 class="activity-name">${activity.title}</h3>
                        <button class="activity-menu" aria-label="More options">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                    </div>
                    <div class="activity-stats">
                        <div class="current-hours">
                            ${timeframeData.current}hrs
                        </div>
                        <div class="previous-hours">
                            ${previousLabel} - ${timeframeData.previous}hrs
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getPreviousLabel(timeframe) {
        const labels = {
            daily: 'Yesterday',
            weekly: 'Last Week',
            monthly: 'Last Month'
        };
        return labels[timeframe] || 'Previous';
    }
    
    renderActivities() {
        if (!this.data.length) {
            this.activitiesGrid.innerHTML = `
                <div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                    <p>Loading activities...</p>
                </div>
            `;
            return;
        }
        
        const cardsHTML = this.data.map(activity => 
            this.createActivityCard(activity)
        ).join('');
        
        this.activitiesGrid.innerHTML = cardsHTML;
        
        // Add staggered animation
        document.querySelectorAll('.activity-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }
    
    updateTimeframe(timeframe) {
        if (timeframe === this.currentTimeframe) return;
        
        this.currentTimeframe = timeframe;
        
        // Update active button
        this.timeframeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.timeframe === timeframe);
        });
        
        // Re-render activities with new timeframe data
        this.renderActivities();
        
        // Optional: Smooth transition effect
        this.activitiesGrid.classList.add('loading');
        setTimeout(() => {
            this.activitiesGrid.classList.remove('loading');
        }, 300);
    }
    
    setupEventListeners() {
        // Timeframe buttons
        this.timeframeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.updateTimeframe(btn.dataset.timeframe);
            });
            
            // Keyboard support
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.updateTimeframe(btn.dataset.timeframe);
                }
            });
        });
        
        // Activity menu buttons (future enhancement)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.activity-menu')) {
                const card = e.target.closest('.activity-card');
                // Add menu functionality here
                console.log('Menu clicked for:', card?.querySelector('.activity-name')?.textContent);
            }
        });
        
        // Auto-refresh data every 5 minutes
        setInterval(async () => {
            await this.fetchData();
            this.renderActivities();
        }, 5 * 60 * 1000);
        
        // Handle window resize for responsive adjustments
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Adjust layout if needed
            }, 250);
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TimeTrackingDashboard();
});

// Service worker for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}