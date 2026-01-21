const apiKey = '6f02ad086d0a3c94676867840d19eca5';
const locButton = document.querySelector('.loc-button');
const todayInfo = document.querySelector('.today-info');
const todayWeatherIcon = document.querySelector('.today-weather i');
const todayTemp = document.querySelector('.weather-temp');
const daysList = document.querySelector('.days-list');
const formatHelpPopup = document.getElementById('formatHelp');
const showFormatHelpBtn = document.getElementById('showFormatHelp');
const closeHelpBtn = document.getElementById('closeHelp');
const gotItBtn = document.getElementById('gotItBtn');

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

function showFormatHelp() {
    formatHelpPopup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFormatHelp() {
    formatHelpPopup.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function fetchWeatherData(location) {
    if (!location || location.trim() === '') return;
    
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

    const tempElement = document.querySelector('.weather-temp');
    tempElement.textContent = 'Loading...';
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const todayWeather = data.list[0].weather[0].description;
            const todayTemperature = `${Math.round(data.list[0].main.temp)}°C`;

            const todayInfo = document.querySelector('.today-info');
            todayInfo.querySelector('h2').textContent = new Date().toLocaleDateString('en', { weekday: 'long' });
            todayInfo.querySelector('span').textContent = new Date().toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' });
            
            const todayWeatherIcon = document.querySelector('.today-weather i');
            
            tempElement.textContent = todayTemperature;

            const locationElement = document.querySelector('.today-info > div > span');
            locationElement.textContent = `${data.city.name}, ${data.city.country}`;

            const weatherDescriptionElement = document.querySelector('.today-weather > h3');
            weatherDescriptionElement.textContent = todayWeather;
            
            const todayPrecipitation = `${Math.round(data.list[0].pop * 100)}%`;
            const todayHumidity = `${data.list[0].main.humidity}%`;
            const todayWindSpeed = `${Math.round(data.list[0].wind.speed * 3.6)} km/h`;

            document.getElementById('precipitationValue').textContent = todayPrecipitation;
            document.getElementById('humidityValue').textContent = todayHumidity;
            document.getElementById('windSpeedValue').textContent = todayWindSpeed;

            const today = new Date();
            const nextDaysData = data.list.slice(1);
            const uniqueDays = new Set();
            let count = 0;
            const daysList = document.querySelector('.days-list');
            daysList.innerHTML = '';
            
            for (const dayData of nextDaysData) {
                const forecastDate = new Date(dayData.dt_txt);
                const dayAbbreviation = forecastDate.toLocaleDateString('en', { weekday: 'short' });
                const dayTemp = `${Math.round(dayData.main.temp)}°C`;
                const iconCode = dayData.weather[0].icon;

                if (!uniqueDays.has(dayAbbreviation) && forecastDate.getDate() !== today.getDate()) {
                    uniqueDays.add(dayAbbreviation);
                    daysList.innerHTML += `
                        <li>
                            <i class='bx bx-${weatherIconMap[iconCode]}'></i>
                            <span>${dayAbbreviation}</span>
                            <span class="day-temp">${dayTemp}</span>
                        </li>
                    `;
                    count++;
                }

                if (count === 4) break;
            }
            
            localStorage.setItem('lastLocation', location);
            localStorage.setItem('lastLocationDisplay', `${data.city.name}, ${data.city.country}`);
            
        }).catch(error => {
            alert(`Error: Location not found. Please use format: City, Country Code (e.g., London, GB)`);
            showFormatHelp();
            tempElement.textContent = '--°C';
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLocation = localStorage.getItem('lastLocation');
    const savedDisplay = localStorage.getItem('lastLocationDisplay');
    
    if (savedLocation && savedDisplay) {
        const locationElement = document.querySelector('.today-info > div > span');
        locationElement.textContent = savedDisplay;
        fetchWeatherData(savedLocation);
    } else {
        const defaultLocation = 'Germany';
        fetchWeatherData(defaultLocation);
    }
    
    if (!localStorage.getItem('formatHelpShown')) {
        setTimeout(() => {
            showFormatHelp();
            localStorage.setItem('formatHelpShown', 'true');
        }, 1000);
    }
});

locButton.addEventListener('click', () => {
    const savedLocation = localStorage.getItem('lastLocation');
    const location = prompt('Enter location (Format: City, Country Code e.g., London, GB):', savedLocation || '');
    if (!location) return;
    fetchWeatherData(location);
});

showFormatHelpBtn.addEventListener('click', showFormatHelp);
closeHelpBtn.addEventListener('click', closeFormatHelp);
gotItBtn.addEventListener('click', closeFormatHelp);

formatHelpPopup.addEventListener('click', (e) => {
    if (e.target === formatHelpPopup) {
        closeFormatHelp();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && formatHelpPopup.classList.contains('active')) {
        closeFormatHelp();
    }
});

const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const primaryColorPicker = document.getElementById('primaryColor');
const secondaryColorPicker = document.getElementById('secondaryColor');
const resetColorsBtn = document.getElementById('resetColors');
const colorPickerBtn = document.getElementById('colorPickerBtn');
const colorModal = document.getElementById('colorModal');
const closeModal = document.getElementById('closeModal');
const modalOverlay = document.getElementById('modalOverlay');
const primaryPreview = document.getElementById('primaryPreview');
const secondaryPreview = document.getElementById('secondaryPreview');

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLightMode = document.body.classList.contains('light-mode');
    themeIcon.className = isLightMode ? 'bx bx-sun' : 'bx bx-moon';
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
}

function updateColors() {
    const primaryColor = primaryColorPicker.value;
    const secondaryColor = secondaryColorPicker.value;

    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    document.documentElement.style.setProperty('--hover-color', darkenColor(primaryColor, 20));
    document.documentElement.style.setProperty('--gradient-start', secondaryColor);
    document.documentElement.style.setProperty('--gradient-end', darkenColor(secondaryColor, 40));
    
    if (primaryPreview) primaryPreview.style.backgroundColor = primaryColor;
    if (secondaryPreview) secondaryPreview.style.backgroundColor = secondaryColor;
    
    localStorage.setItem('primaryColor', primaryColor);
    localStorage.setItem('secondaryColor', secondaryColor);
}

function darkenColor(color, percent) {
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
}

function resetColors() {
    const defaultPrimary = '#303f9f';
    const defaultSecondary = '#5c6bc0';
    
    primaryColorPicker.value = defaultPrimary;
    secondaryColorPicker.value = defaultSecondary;
    
    updateColors();
    localStorage.removeItem('primaryColor');
    localStorage.removeItem('secondaryColor');
}

function loadPreferences() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.className = 'bx bx-sun';
    }
    
    const savedPrimary = localStorage.getItem('primaryColor');
    const savedSecondary = localStorage.getItem('secondaryColor');
    
    if (savedPrimary) primaryColorPicker.value = savedPrimary;
    if (savedSecondary) secondaryColorPicker.value = savedSecondary;
    
    updateColors();
}

function openColorModal() {
    colorModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeColorModal() {
    colorModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

themeBtn.addEventListener('click', toggleTheme);
primaryColorPicker.addEventListener('input', updateColors);
secondaryColorPicker.addEventListener('input', updateColors);
resetColorsBtn.addEventListener('click', resetColors);
colorPickerBtn.addEventListener('click', openColorModal);
closeModal.addEventListener('click', closeColorModal);
modalOverlay.addEventListener('click', closeColorModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && colorModal.classList.contains('active')) {
        closeColorModal();
    }
});

loadPreferences();

function createMobileControls() {
    if (window.innerWidth <= 768) {
        const desktopControls = document.querySelector('.desktop-controls');
        if (desktopControls) {
            desktopControls.style.display = 'none';
        }
        
        let mobileControls = document.querySelector('.mobile-controls');
        if (!mobileControls) {
            mobileControls = document.createElement('div');
            mobileControls.className = 'mobile-controls';
            
            const mobileThemeBtn = document.createElement('button');
            mobileThemeBtn.innerHTML = '<i class="bx bx-moon"></i>';
            mobileThemeBtn.title = 'Toggle Theme';
            mobileThemeBtn.addEventListener('click', toggleTheme);
            const mobileColorBtn = document.createElement('button');
            mobileColorBtn.innerHTML = '<i class="bx bx-palette"></i>';
            mobileColorBtn.title = 'Color Settings';
            mobileColorBtn.addEventListener('click', openColorModal);
            
            mobileControls.appendChild(mobileThemeBtn);
            mobileControls.appendChild(mobileColorBtn);
            document.body.appendChild(mobileControls);
        }
    } else {
        const mobileControls = document.querySelector('.mobile-controls');
        if (mobileControls) {
            mobileControls.remove();
        }
        
        const desktopControls = document.querySelector('.desktop-controls');
        if (desktopControls) {
            desktopControls.style.display = 'flex';
        }
    }
}

window.addEventListener('load', createMobileControls);
window.addEventListener('resize', createMobileControls);