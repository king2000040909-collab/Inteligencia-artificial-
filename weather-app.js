/* ==========================================
   WEATHER DASHBOARD - MAIN APPLICATION
   ========================================== */

class WeatherDashboard {
    constructor() {
        this.currentCity = null;
        this.currentWeather = null;
        this.savedCities = this.loadSavedCities();
        this.isDarkTheme = this.loadThemePreference();
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.showWelcomeState();
        console.log('🌦️ Weather Dashboard initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        if (searchBtn) searchBtn.addEventListener('click', () => this.searchCity());
        if (searchInput) searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchCity();
        });

        // Welcome search
        const welcomeSearchInput = document.getElementById('welcomeSearchInput');
        if (welcomeSearchInput) {
            welcomeSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const city = welcomeSearchInput.value.trim();
                    if (city) this.loadCity(city);
                }
            });
        }

        // Location button
        const locationBtn = document.getElementById('locationBtn');
        if (locationBtn) locationBtn.addEventListener('click', () => this.useLocation());

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    /**
     * Search for a city
     */
    async searchCity() {
        const searchInput = document.getElementById('searchInput');
        const city = searchInput.value.trim();
        
        if (!city) {
            this.showError('Please enter a city name');
            return;
        }

        await this.loadCity(city);
        searchInput.value = '';
    }

    /**
     * Load weather for a city
     */
    async loadCity(cityName) {
        try {
            this.showLoading();

            // Get coordinates
            const coords = await weatherAPI.getCoordinates(cityName);
            this.currentCity = coords;

            // Get weather data
            const weatherData = await weatherAPI.getWeatherData(
                coords.latitude,
                coords.longitude,
                coords.timezone
            );

            // Get air quality data
            const airQualityData = await weatherAPI.getAirQualityData(
                coords.latitude,
                coords.longitude
            );

            this.currentWeather = {
                ...weatherData,
                location: coords,
                airQuality: airQualityData
            };

            // Update UI
            this.displayWeather();
            this.showMainWeatherSection();
            this.addToSavedCities(coords.name, coords.country);

        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Use browser geolocation
     */
    async useLocation() {
        try {
            this.showLoading();
            const location = await weatherAPI.getUserLocation();
            
            // For now, we'll just use the coordinates directly
            // In a real app, we'd reverse geocode to get the city name
            const weatherData = await weatherAPI.getWeatherData(
                location.latitude,
                location.longitude,
                'auto'
            );

            const airQualityData = await weatherAPI.getAirQualityData(
                location.latitude,
                location.longitude
            );

            this.currentCity = {
                latitude: location.latitude,
                longitude: location.longitude,
                name: 'Your Location',
                country: ''
            };

            this.currentWeather = {
                ...weatherData,
                location: this.currentCity,
                airQuality: airQualityData
            };

            this.displayWeather();
            this.showMainWeatherSection();

        } catch (error) {
            this.showError('Unable to get your location: ' + error.message);
        }
    }

    /**
     * Display current weather information
     */
    displayWeather() {
        if (!this.currentWeather) return;

        const current = this.currentWeather.current;
        const hourly = this.currentWeather.hourly;
        const daily = this.currentWeather.daily;
        const location = this.currentCity;

        // City information
        document.getElementById('cityName').textContent = location.name;
        document.getElementById('cityCountry').textContent = location.country ? `${location.country}` : '';
        document.getElementById('currentDate').textContent = weatherAPI.formatDate(new Date());

        // Current weather
        const weatherInfo = weatherAPI.getWeatherInfo(current.weather_code);
        const weatherIcon = this.getWeatherIcon(current.weather_code);
        
        document.getElementById('temperature').textContent = Math.round(current.temperature_2m);
        document.getElementById('weatherIcon').src = `data:image/svg+xml,${encodeURIComponent(this.getSVGIcon(current.weather_code))}`;
        document.getElementById('weatherDescription').textContent = weatherInfo.description.charAt(0).toUpperCase() + weatherInfo.description.slice(1);
        document.getElementById('feelsLike').textContent = `Feels like: ${Math.round(current.apparent_temperature)}°C`;

        // Weather details
        document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
        document.getElementById('windSpeed').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
        document.getElementById('pressure').textContent = `${Math.round(current.pressure_msl)} mb`;
        document.getElementById('visibility').textContent = `${(current.visibility / 1000).toFixed(1)} km`;
        document.getElementById('windDirection').textContent = weatherAPI.getWindDirection(current.wind_direction_10m);
        document.getElementById('uvIndex').textContent = '-'; // Not available in Open-Meteo free tier

        // Hourly forecast
        this.displayHourlyForecast(hourly);

        // Daily forecast
        this.displayDailyForecast(daily);

        // Air quality
        this.displayAirQuality();
    }

    /**
     * Display hourly forecast
     */
    displayHourlyForecast(hourlyData) {
        const container = document.getElementById('hourlyForecast');
        if (!container) return;

        container.innerHTML = '';

        const now = new Date();
        const forecast = hourlyData.time.slice(0, 24).map((time, index) => ({
            time: new Date(time),
            temp: hourlyData.temperature_2m[index],
            weatherCode: hourlyData.weather_code[index]
        }));

        forecast.forEach(item => {
            const hourElement = document.createElement('div');
            hourElement.className = 'hourly-item';
            
            const isNow = Math.abs(item.time - now) < 1800000; // Within 30 minutes
            const timeStr = item.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            hourElement.innerHTML = `
                <div class="hourly-time">${isNow ? 'Now' : timeStr}</div>
                <div class="hourly-icon">${this.getEmoji(item.weatherCode)}</div>
                <div class="hourly-temp">${Math.round(item.temp)}°C</div>
            `;
            
            container.appendChild(hourElement);
        });
    }

    /**
     * Display 5-day forecast
     */
    displayDailyForecast(dailyData) {
        const container = document.getElementById('dailyForecast');
        if (!container) return;

        container.innerHTML = '';

        dailyData.time.forEach((date, index) => {
            const dayElement = document.createElement('div');
            dayElement.className = 'daily-item';
            
            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const weatherInfo = weatherAPI.getWeatherInfo(dailyData.weather_code[index]);

            dayElement.innerHTML = `
                <div class="daily-date">${dayName}, ${dayDate}</div>
                <div class="daily-icon">${this.getEmoji(dailyData.weather_code[index])}</div>
                <div class="daily-temp-range">
                    <span class="daily-temp-high">${Math.round(dailyData.temperature_2m_max[index])}°</span>
                    <span class="daily-temp-low">${Math.round(dailyData.temperature_2m_min[index])}°</span>
                </div>
                <div class="daily-description">${weatherInfo.description}</div>
            `;
            
            container.appendChild(dayElement);
        });
    }

    /**
     * Display air quality information
     */
    displayAirQuality() {
        if (!this.currentWeather.airQuality) {
            document.getElementById('pm25').textContent = '-';
            document.getElementById('pm10').textContent = '-';
            document.getElementById('o3').textContent = '-';
            document.getElementById('no2').textContent = '-';
            document.getElementById('aqiValue').textContent = '-';
            document.getElementById('aqiStatus').textContent = 'Data unavailable';
            return;
        }

        const aq = this.currentWeather.airQuality.current;
        const aqi = aq.us_aqi || 0;
        const aqiInfo = weatherAPI.getAQIStatus(aqi);

        // Update AQI circle color
        const aqiCircle = document.querySelector('.aqi-circle');
        if (aqiCircle) {
            aqiCircle.style.background = `linear-gradient(135deg, ${aqiInfo.color}, ${aqiInfo.color}cc)`;
        }

        document.getElementById('aqiValue').textContent = Math.round(aqi);
        document.getElementById('aqiStatus').textContent = aqiInfo.status;
        document.getElementById('aqiDescription').textContent = aqiInfo.description;

        // Pollutants
        document.getElementById('pm25').textContent = aq.pm2_5 ? `${aq.pm2_5.toFixed(1)} µg/m³` : '-';
        document.getElementById('pm10').textContent = aq.pm10 ? `${aq.pm10.toFixed(1)} µg/m³` : '-';
        document.getElementById('o3').textContent = aq.o3 ? `${aq.o3.toFixed(1)} µg/m³` : '-';
        document.getElementById('no2').textContent = aq.nitrogen_dioxide ? `${aq.nitrogen_dioxide.toFixed(1)} µg/m³` : '-';
    }

    /**
     * Get emoji for weather code
     */
    getEmoji(weatherCode) {
        const weatherInfo = weatherAPI.getWeatherInfo(weatherCode);
        return weatherInfo.icon;
    }

    /**
     * Get SVG icon for weather code
     */
    getSVGIcon(weatherCode) {
        // Simple colored circle with emoji inside
        const emoji = this.getEmoji(weatherCode);
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="95" fill="#e3f2fd" stroke="#90caf9" stroke-width="2"/>
            <text x="100" y="130" font-size="80" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
        </svg>`;
    }

    /**
     * Saved cities management
     */
    addToSavedCities(name, country) {
        const cityKey = `${name},${country}`;
        
        if (!this.savedCities.find(c => c.key === cityKey)) {
            this.savedCities.push({
                key: cityKey,
                name: name,
                country: country
            });
            
            if (this.savedCities.length > 10) {
                this.savedCities.shift();
            }
            
            this.saveSavedCities();
            this.displaySavedCities();
        }
    }

    /**
     * Display saved cities
     */
    displaySavedCities() {
        const container = document.getElementById('savedCities');
        if (!container) return;

        container.innerHTML = '';

        if (this.savedCities.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #7f8c8d;">No saved cities yet</p>';
            return;
        }

        this.savedCities.forEach(city => {
            const cityCard = document.createElement('div');
            cityCard.className = 'city-card';
            cityCard.innerHTML = `
                <div class="city-name">${city.name}</div>
                <div class="city-weather">${city.country}</div>
                <button class="city-remove" onclick="app.removeCity('${city.key}')">Remove</button>
            `;
            
            cityCard.addEventListener('click', (e) => {
                if (e.target.classList.contains('city-remove')) return;
                this.loadCity(city.name);
            });
            
            container.appendChild(cityCard);
        });
    }

    /**
     * Remove a saved city
     */
    removeCity(cityKey) {
        this.savedCities = this.savedCities.filter(c => c.key !== cityKey);
        this.saveSavedCities();
        this.displaySavedCities();
    }

    /**
     * Local storage management
     */
    loadSavedCities() {
        const stored = localStorage.getItem('weatherDashboard_savedCities');
        return stored ? JSON.parse(stored) : [];
    }

    saveSavedCities() {
        localStorage.setItem('weatherDashboard_savedCities', JSON.stringify(this.savedCities));
    }

    loadThemePreference() {
        const stored = localStorage.getItem('weatherDashboard_theme');
        return stored === 'dark';
    }

    saveThemePreference() {
        localStorage.setItem('weatherDashboard_theme', this.isDarkTheme ? 'dark' : 'light');
    }

    /**
     * Theme management
     */
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        this.saveThemePreference();
        this.applyTheme();
    }

    applyTheme() {
        const themeToggle = document.getElementById('themeToggle');
        if (this.isDarkTheme) {
            document.body.classList.add('dark-theme');
            if (themeToggle) themeToggle.textContent = '☀️';
        } else {
            document.body.classList.remove('dark-theme');
            if (themeToggle) themeToggle.textContent = '🌙';
        }
    }

    /**
     * UI State management
     */
    showLoading() {
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('errorState').classList.add('hidden');
        document.getElementById('mainWeatherSection').classList.add('hidden');
        document.getElementById('welcomeState').classList.add('hidden');
    }

    showMainWeatherSection() {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('errorState').classList.add('hidden');
        document.getElementById('mainWeatherSection').classList.remove('hidden');
        document.getElementById('welcomeState').classList.add('hidden');
        this.displaySavedCities();
    }

    showWelcomeState() {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('errorState').classList.add('hidden');
        document.getElementById('mainWeatherSection').classList.add('hidden');
        document.getElementById('welcomeState').classList.remove('hidden');
    }

    showError(message) {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('errorState').classList.remove('hidden');
        document.getElementById('mainWeatherSection').classList.add('hidden');
        document.getElementById('welcomeState').classList.add('hidden');
        document.getElementById('errorMessage').textContent = '❌ ' + message;
    }
}

// Utility function for event handlers
function resetError() {
    app.showWelcomeState();
}

function useLocation() {
    app.useLocation();
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new WeatherDashboard();
    console.log('✅ Weather Dashboard is ready');
});
