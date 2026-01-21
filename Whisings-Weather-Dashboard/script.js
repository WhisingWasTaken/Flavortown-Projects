const apiKey = '6f02ad086d0a3c94676867840d19eca5';

let locButton, themeBtn, themeIcon, primaryColorPicker, secondaryColorPicker;
let resetColorsBtn, colorPickerBtn, colorModal, closeModal, modalOverlay;
let primaryPreview, secondaryPreview, locationNameElement;

const weatherIconMap = {
    '01d': 'sun',
    '01n': 'moon',
    '02d': 'sun',
    '02n': 'moon',
    '03d': 'cloud',
    '03n': 'cloud',
    '04d': 'cloud',
    '04n': 'cloud',
    '09d': 'cloud-rain',
    '09n': 'cloud-rain',
    '10d': 'cloud-rain',
    '10n': 'cloud-rain',
    '11d': 'cloud-lightning',
    '11n': 'cloud-lightning',
    '13d': 'cloud-snow',
    '13n': 'cloud-snow',
    '50d': 'water',
    '50n': 'water'
};

function initializeDOMElements() {
    console.log('Initializing DOM elements...');
    
    locButton = document.querySelector('.loc-button');
    themeBtn = document.getElementById('themeBtn');
    themeIcon = document.getElementById('themeIcon');
    primaryColorPicker = document.getElementById('primaryColor');
    secondaryColorPicker = document.getElementById('secondaryColor');
    resetColorsBtn = document.getElementById('resetColors');
    colorPickerBtn = document.getElementById('colorPickerBtn');
    colorModal = document.getElementById('colorModal');
    closeModal = document.getElementById('closeModal');
    modalOverlay = document.getElementById('modalOverlay');
    primaryPreview = document.getElementById('primaryPreview');
    secondaryPreview = document.getElementById('secondaryPreview');
    locationNameElement = document.getElementById('locationName');
    
    console.log('locButton found:', !!locButton);
    console.log('themeBtn found:', !!themeBtn);
    console.log('themeIcon found:', !!themeIcon);
    console.log('locationNameElement found:', !!locationNameElement);
    console.log('primaryColorPicker found:', !!primaryColorPicker);
    console.log('secondaryColorPicker found:', !!secondaryColorPicker);
    
    const criticalElements = [
        { name: 'locButton', element: locButton },
        { name: 'themeBtn', element: themeBtn },
        { name: 'themeIcon', element: themeIcon }
    ];
    
    let allCriticalFound = true;
    for (const critical of criticalElements) {
        if (!critical.element) {
            console.error(`Critical element not found: ${critical.name}`);
            allCriticalFound = false;
        }
    }
    
    return allCriticalFound;
}

function waitForDOMReady() {
    return new Promise((resolve) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
        } else {
            resolve();
        }
    });
}

const preferences = {
    save: function() {
        try {
            const prefs = {
                theme: document.body.classList.contains('light-mode') ? 'light' : 'dark',
                primaryColor: primaryColorPicker ? primaryColorPicker.value : '#303f9f',
                secondaryColor: secondaryColorPicker ? secondaryColorPicker.value : '#5c6bc0',
                lastLocation: localStorage.getItem('lastLocation') || 'Germany',
                lastLocationDisplay: localStorage.getItem('lastLocationDisplay') || 'Germany, DE'
            };
            
            localStorage.setItem('weatherAppPrefs', JSON.stringify(prefs));
            console.log('Preferences saved');
            return true;
        } catch (error) {
            console.error('Error saving preferences:', error);
            return false;
        }
    },
    
    load: function() {
        try {
            const saved = localStorage.getItem('weatherAppPrefs');
            if (!saved) {
                console.log('No saved preferences found');
                return null;
            }
            
            const prefs = JSON.parse(saved);
            console.log('Loading preferences:', prefs);
            
            // Load theme
            if (prefs.theme === 'light') {
                document.body.classList.add('light-mode');
                if (themeIcon) {
                    themeIcon.className = 'bx bx-sun';
                }
            }
            
            if (primaryColorPicker && prefs.primaryColor) {
                primaryColorPicker.value = prefs.primaryColor;
            }
            if (secondaryColorPicker && prefs.secondaryColor) {
                secondaryColorPicker.value = prefs.secondaryColor;
            }
            
            this.applyColors();
            return prefs;
            
        } catch (error) {
            console.error('Error loading preferences:', error);
            return null;
        }
    },
    
    applyColors: function() {
        if (!primaryColorPicker || !secondaryColorPicker) {
            console.warn('Color pickers not available for applying colors');
            return;
        }
        
        const primaryColor = primaryColorPicker.value;
        const secondaryColor = secondaryColorPicker.value;
        
        console.log('Applying colors:', { primaryColor, secondaryColor });
        
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--secondary-color', secondaryColor);
        document.documentElement.style.setProperty('--hover-color', this.darkenColor(primaryColor, 20));
        document.documentElement.style.setProperty('--gradient-start', secondaryColor);
        document.documentElement.style.setProperty('--gradient-end', this.darkenColor(secondaryColor, 40));
        
        if (primaryPreview) {
            primaryPreview.style.backgroundColor = primaryColor;
        }
        if (secondaryPreview) {
            secondaryPreview.style.backgroundColor = secondaryColor;
        }
    },
    
    // Helper function to darken colors
    darkenColor: function(color, percent) {
        try {
            const num = parseInt(color.replace("#", ""), 16);
            const amt = Math.round(2.55 * percent);
            const R = (num >> 16) - amt;
            const G = (num >> 8 & 0x00FF) - amt;
            const B = (num & 0x0000FF) - amt;
            
            return "#" + (
                0x1000000 +
                (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
                (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
                (B < 255 ? (B < 1 ? 0 : B) : 255)
            ).toString(16).slice(1);
        } catch (error) {
            console.warn('Error darkening color, returning original:', color);
            return color;
        }
    },
    
    reset: function() {
        const defaultPrimary = '#303f9f';
        const defaultSecondary = '#5c6bc0';
        
        if (primaryColorPicker) {
            primaryColorPicker.value = defaultPrimary;
        }
        if (secondaryColorPicker) {
            secondaryColorPicker.value = defaultSecondary;
        }
        
        this.applyColors();
        this.save();
        
        this.showToast('Colors reset to default!');
    },
    
    showToast: function(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary-color);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            box-shadow: 0 4px 15px var(--shadow-color);
            z-index: 3000;
            font-size: 14px;
            font-weight: 500;
            animation: toastSlideUp 0.3s ease;
        `;
        if (!document.querySelector('#toast-animation')) {
            const style = document.createElement('style');
            style.id = 'toast-animation';
            style.textContent = `
                @keyframes toastSlideUp {
                    from { transform: translateX(-50%) translateY(100%); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
                @keyframes toastFadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        

        setTimeout(() => {
            toast.style.animation = 'toastFadeOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
};

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLightMode = document.body.classList.contains('light-mode');
    
    if (themeIcon) {
        themeIcon.className = isLightMode ? 'bx bx-sun' : 'bx bx-moon';
    }
    
    preferences.save();
    
    if (themeBtn) {
        themeBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            themeBtn.style.transform = 'scale(1)';
        }, 150);
    }
}

function openColorModal() {
    if (colorModal) {
        colorModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeColorModal() {
    if (colorModal) {
        colorModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function fetchWeatherData(location) {
    if (!location || location.trim() === '') {
        preferences.showToast('Please enter a location');
        return;
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;

    const tempElement = document.querySelector('.weather-temp');
    if (tempElement) {
        tempElement.textContent = 'Loading...';
    }

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.list || !data.city) {
                throw new Error('Invalid data received from API');
            }

            const todayWeather = data.list[0].weather[0].description;
            const todayTemperature = `${Math.round(data.list[0].main.temp)}°C`;
            const todayWeatherIconCode = data.list[0].weather[0].icon;

            const todayInfo = document.querySelector('.today-info');
            if (todayInfo) {
                const h2Element = todayInfo.querySelector('h2');
                const dateElement = todayInfo.querySelector('.date');
                
                if (h2Element) {
                    h2Element.textContent = new Date().toLocaleDateString('en', { weekday: 'long' });
                }
                if (dateElement) {
                    dateElement.textContent = new Date().toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' });
                }
            }
            
            const todayWeatherIcon = document.querySelector('.weather-icon');
            if (todayWeatherIcon) {
                const iconClass = weatherIconMap[todayWeatherIconCode] || 'sun';
                todayWeatherIcon.className = `bx bx-${iconClass} weather-icon`;
            }
            
            if (tempElement) {
                tempElement.textContent = todayTemperature;
            }

            if (locationNameElement) {
                locationNameElement.textContent = `${data.city.name}, ${data.city.country}`;
            } else {
                console.warn('locationNameElement not found when trying to update location');
            }

            localStorage.setItem('lastLocation', location);
            localStorage.setItem('lastLocationDisplay', `${data.city.name}, ${data.city.country}`);

            const weatherDescriptionElement = document.querySelector('.weather-desc');
            if (weatherDescriptionElement) {
                weatherDescriptionElement.textContent = todayWeather;
            }
            

            const todayPrecipitation = `${Math.round(data.list[0].pop * 100)}%`;
            const todayHumidity = `${data.list[0].main.humidity}%`;
            const todayWindSpeed = `${Math.round(data.list[0].wind.speed * 3.6)} km/h`;

            const stats = document.querySelectorAll('.value');
            if (stats.length >= 3) {
                stats[0].textContent = todayPrecipitation;
                stats[1].textContent = todayHumidity;
                stats[2].textContent = todayWindSpeed;
            }


            updateForecast(data);

            preferences.save();
            
            preferences.showToast(`Weather updated for ${data.city.name}`);
            
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            
            if (tempElement) {
                tempElement.textContent = '--°C';
            }
            
            let errorMessage = 'Failed to fetch weather data';
            if (error.message.includes('404')) {
                errorMessage = 'Location not found. Please check the spelling.';
            } else if (error.message.includes('401')) {
                errorMessage = 'API key error. Please check your API key.';
            } else if (error.message.includes('NetworkError')) {
                errorMessage = 'Network error. Please check your internet connection.';
            }
            
            preferences.showToast(errorMessage);
        });
}

function updateForecast(data) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextDaysData = data.list.slice(1);
    const uniqueDays = new Set();
    let count = 0;
    const daysList = document.querySelector('.days-list');
    
    if (!daysList) {
        console.warn('daysList element not found');
        return;
    }
    
    daysList.innerHTML = '';
    
    for (const dayData of nextDaysData) {
        const forecastDate = new Date(dayData.dt_txt);
        const dayAbbreviation = forecastDate.toLocaleDateString('en', { weekday: 'short' });
        const dayTemp = `${Math.round(dayData.main.temp)}°C`;
        const iconCode = dayData.weather[0].icon;
        const iconClass = weatherIconMap[iconCode] || 'sun';
        
        if (!uniqueDays.has(dayAbbreviation) && forecastDate.getDate() !== today.getDate()) {
            uniqueDays.add(dayAbbreviation);
            daysList.innerHTML += `
                <li class="day-item">
                    <i class='bx bx-${iconClass}'></i>
                    <span class="day-name">${dayAbbreviation}</span>
                    <span class="day-temp">${dayTemp}</span>
                </li>
            `;
            count++;
        }
        
        if (count === 4) break;
    }
}

function initializeWeather() {
    const savedLocation = localStorage.getItem('lastLocation');
    const savedDisplay = localStorage.getItem('lastLocationDisplay');
    
    if (savedLocation && savedDisplay) {
        if (locationNameElement) {
            locationNameElement.textContent = savedDisplay;
        }
        fetchWeatherData(savedLocation);
    } else {
        if (locationNameElement) {
            locationNameElement.textContent = 'Germany, DE';
        }
        fetchWeatherData('Germany');
    }
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    if (locButton) {
        locButton.addEventListener('click', () => {
            const savedLocation = localStorage.getItem('lastLocation');
            const location = prompt('Enter a city or location:', savedLocation || 'Germany');
            if (location && location.trim()) {
                fetchWeatherData(location.trim());
            }
        });
        
        locButton.addEventListener('mousedown', () => {
            locButton.style.transform = 'scale(0.98)';
        });
        
        locButton.addEventListener('mouseup', () => {
            locButton.style.transform = 'scale(1)';
        });
        
        locButton.addEventListener('mouseleave', () => {
            locButton.style.transform = 'scale(1)';
        });
    } else {
        console.warn('locButton not found for event listener');
    }
    
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    } else {
        console.warn('themeBtn not found for event listener');
    }
    
    if (colorPickerBtn) {
        colorPickerBtn.addEventListener('click', openColorModal);
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeColorModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeColorModal);
    }
    
    if (primaryColorPicker) {
        primaryColorPicker.addEventListener('input', () => {
            preferences.applyColors();
            preferences.save();
        });
    }
    
    if (secondaryColorPicker) {
        secondaryColorPicker.addEventListener('input', () => {
            preferences.applyColors();
            preferences.save();
        });
    }
    
    if (resetColorsBtn) {
        resetColorsBtn.addEventListener('click', () => {
            preferences.reset();
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && colorModal && colorModal.classList.contains('active')) {
            closeColorModal();
        }
    });
}

async function initializeApp() {
    console.log('Starting app initialization...');
    
    await waitForDOMReady();
    console.log('DOM is ready');
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (!initializeDOMElements()) {
        console.error('Critical DOM elements not found. Retrying in 100ms...');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!initializeDOMElements()) {
            console.error('Failed to initialize DOM elements after retry');
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #ff4444;
                color: white;
                padding: 20px;
                border-radius: 10px;
                z-index: 10000;
                text-align: center;
                font-family: Arial, sans-serif;
            `;
            errorDiv.innerHTML = `
                <h3>App Initialization Error</h3>
                <p>Some elements failed to load. Please refresh the page.</p>
                <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer;">
                    Refresh Page
                </button>
            `;
            document.body.appendChild(errorDiv);
            return;
        }
    }
    
    console.log('DOM elements initialized successfully');
    
    const savedPrefs = preferences.load();
    console.log('Preferences loaded:', savedPrefs ? 'Yes' : 'No');
    
    setupEventListeners();
    
    initializeWeather();
    
    if (!savedPrefs) {
        setTimeout(() => {
            preferences.showToast('Welcome! Your preferences will be saved automatically.');
        }, 1500);
    }
    
    console.log('App initialized successfully');
}

initializeApp().catch(error => {
    console.error('App initialization failed:', error);
    
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ff4444;
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 10000;
        text-align: center;
    `;
    errorDiv.innerHTML = `
        <h3>Application Error</h3>
        <p>Failed to initialize the application. Please check the console for details.</p>
        <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer;">
            Refresh Page
        </button>
    `;
    document.body.appendChild(errorDiv);
});