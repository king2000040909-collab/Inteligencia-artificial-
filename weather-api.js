/* ==========================================
   WEATHER API HANDLER
   ========================================== */

class WeatherAPI {
    constructor() {
        // Using Open-Meteo API (free, no key required)
        this.baseURL = 'https://api.open-meteo.com/v1/forecast';
        this.geoURL = 'https://geocoding-api.open-meteo.com/v1/search';
        this.cacheTime = 10 * 60 * 1000; // 10 minutes
        this.cache = {};
    }

    /**
     * Get coordinates for a city name
     */
    async getCoordinates(cityName) {
        try {
            const response = await fetch(
                `${this.geoURL}?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch coordinates');
            }

            const data = await response.json();

            if (!data.results || data.results.length === 0) {
                throw new Error(`City "${cityName}" not found`);
            }

            const result = data.results[0];
            return {
                latitude: result.latitude,
                longitude: result.longitude,
                name: result.name,
                country: result.country,
                admin1: result.admin1 || '',
                timezone: result.timezone || 'UTC'
            };
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            throw error;
        }
    }

    /**
     * Get weather data for coordinates
     */
    async getWeatherData(latitude, longitude, timezone) {
        try {
            const cacheKey = `${latitude},${longitude}`;
            
            // Check cache
            if (this.cache[cacheKey] && Date.now() - this.cache[cacheKey].timestamp < this.cacheTime) {
                console.log('Using cached weather data');
                return this.cache[cacheKey].data;
            }

            const params = new URLSearchParams({
                latitude: latitude,
                longitude: longitude,
                current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,visibility',
                hourly: 'temperature_2m,weather_code,wind_speed_10m',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
                timezone: timezone,
                temperature_unit: 'celsius',
                wind_speed_unit: 'kmh',
                precipitation_unit: 'mm'
            });

            const response = await fetch(`${this.baseURL}?${params}`);

            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }

            const data = await response.json();

            // Cache the data
            this.cache[cacheKey] = {
                data: data,
                timestamp: Date.now()
            };

            return data;
        } catch (error) {
            console.error('Error fetching weather data:', error);
            throw error;
        }
    }

    /**
     * Get air quality data (using Open-Meteo Air Quality API)
     */
    async getAirQualityData(latitude, longitude) {
        try {
            const airQualityURL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
            
            const params = new URLSearchParams({
                latitude: latitude,
                longitude: longitude,
                current: 'us_aqi,pm2_5,pm10,o3,nitrogen_dioxide'
            });

            const response = await fetch(`${airQualityURL}?${params}`);

            if (!response.ok) {
                throw new Error('Failed to fetch air quality data');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching air quality data:', error);
            return null;
        }
    }

    /**
     * Get user's location from browser geolocation
     */
    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    /**
     * Convert weather code to description and icon
     */
    getWeatherInfo(weatherCode, isDay = true) {
        const weatherMap = {
            0: { description: 'Clear sky', icon: '☀️' },
            1: { description: 'Mainly clear', icon: '🌤️' },
            2: { description: 'Partly cloudy', icon: '⛅' },
            3: { description: 'Overcast', icon: '☁️' },
            45: { description: 'Foggy', icon: '🌫️' },
            48: { description: 'Depositing rime fog', icon: '🌫️' },
            51: { description: 'Light drizzle', icon: '🌧️' },
            53: { description: 'Moderate drizzle', icon: '🌧️' },
            55: { description: 'Dense drizzle', icon: '🌧️' },
            61: { description: 'Slight rain', icon: '🌧️' },
            63: { description: 'Moderate rain', icon: '🌧️' },
            65: { description: 'Heavy rain', icon: '⛈️' },
            71: { description: 'Slight snow', icon: '🌨️' },
            73: { description: 'Moderate snow', icon: '🌨️' },
            75: { description: 'Heavy snow', icon: '❄️' },
            77: { description: 'Snow grains', icon: '❄️' },
            80: { description: 'Slight rain showers', icon: '🌧️' },
            81: { description: 'Moderate rain showers', icon: '⛈️' },
            82: { description: 'Violent rain showers', icon: '⛈️' },
            85: { description: 'Slight snow showers', icon: '🌨️' },
            86: { description: 'Heavy snow showers', icon: '❄️' },
            95: { description: 'Thunderstorm', icon: '⛈️' },
            96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
            99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' }
        };

        return weatherMap[weatherCode] || { description: 'Unknown', icon: '🌡️' };
    }

    /**
     * Get wind direction in compass format
     */
    getWindDirection(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                           'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    }

    /**
     * Format timestamp to readable date
     */
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Format timestamp to time only
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Get AQI status based on US AQI value
     */
    getAQIStatus(aqi) {
        if (aqi <= 50) return { status: 'Good', color: '#51cf66', description: 'Air quality is satisfactory' };
        if (aqi <= 100) return { status: 'Moderate', color: '#ffd43b', description: 'Members of vulnerable groups may experience health effects' };
        if (aqi <= 150) return { status: 'Unhealthy for Sensitive Groups', color: '#ff922b', description: 'Some members of the general public may experience health effects' };
        if (aqi <= 200) return { status: 'Unhealthy', color: '#ff6b6b', description: 'Some members of the general public may experience health effects' };
        if (aqi <= 300) return { status: 'Very Unhealthy', color: '#c92a2a', description: 'Health alert: The risk of health effects is increased for everyone' };
        return { status: 'Hazardous', color: '#7c0a02', description: 'Health warning of emergency conditions: everyone is more likely to be affected' };
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache = {};
    }
}

// Export for use
const weatherAPI = new WeatherAPI();
