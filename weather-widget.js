class WeatherWidget {
    constructor() {
        // Gentofte, Denmark coordinates
        this.latitude = 55.7704;
        this.longitude = 12.5328;
        this.location = 'Gentofte, Denmark';
        
        // Cache settings
        this.cacheKey = 'gentofte_weather_data';
        this.cacheTimeKey = 'gentofte_weather_timestamp';
        this.cacheValidHours = 12; // Update twice per day
        
        // DOM elements
        this.widget = document.getElementById('weatherWidget');
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        this.currentTemp = document.getElementById('currentTemp');
        this.currentIcon = document.getElementById('currentIcon');
        this.currentDescription = document.getElementById('currentDescription');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.pressure = document.getElementById('pressure');
        this.lastUpdated = document.getElementById('lastUpdated');
        this.forecastContainer = document.getElementById('forecastContainer');
        
        this.init();
    }
    
    async init() {
        try {
            // Check if we have valid cached data
            const cachedData = this.getCachedData();
            
            if (cachedData) {
                this.displayWeatherData(cachedData);
                this.hideLoading();
                
                // Still try to fetch fresh data in background if cache is getting old
                if (this.shouldUpdateCache()) {
                    this.fetchWeatherData(true); // Silent update
                }
            } else {
                // No cached data, fetch fresh data
                await this.fetchWeatherData();
            }
        } catch (error) {
            console.error('Error initializing weather widget:', error);
            this.showError();
        }
    }
    
    getCachedData() {
        try {
            const cachedData = localStorage.getItem(this.cacheKey);
            const cacheTime = localStorage.getItem(this.cacheTimeKey);
            
            if (cachedData && cacheTime) {
                const cacheAge = Date.now() - parseInt(cacheTime);
                const maxAge = this.cacheValidHours * 60 * 60 * 1000; // Convert to milliseconds
                
                if (cacheAge < maxAge) {
                    return JSON.parse(cachedData);
                }
            }
        } catch (error) {
            console.error('Error reading cached data:', error);
        }
        return null;
    }
    
    shouldUpdateCache() {
        try {
            const cacheTime = localStorage.getItem(this.cacheTimeKey);
            if (cacheTime) {
                const cacheAge = Date.now() - parseInt(cacheTime);
                const halfMaxAge = (this.cacheValidHours * 60 * 60 * 1000) / 2;
                return cacheAge > halfMaxAge;
            }
        } catch (error) {
            console.error('Error checking cache age:', error);
        }
        return true;
    }
    
    setCachedData(data) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(data));
            localStorage.setItem(this.cacheTimeKey, Date.now().toString());
        } catch (error) {
            console.error('Error caching data:', error);
        }
    }
    
    async fetchWeatherData(silent = false) {
        if (!silent) {
            this.showLoading();
        }
        
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.latitude}&longitude=${this.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum&timezone=Europe%2FCopenhagen&forecast_days=5`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Cache the data
            this.setCachedData(data);
            
            // Display the data
            this.displayWeatherData(data);
            
            if (!silent) {
                this.hideLoading();
            }
            
            this.hideError();
            
        } catch (error) {
            console.error('Error fetching weather data:', error);
            
            if (!silent) {
                // Try to show cached data if available
                const cachedData = this.getCachedData();
                if (cachedData) {
                    this.displayWeatherData(cachedData);
                    this.hideLoading();
                } else {
                    this.showError();
                }
            }
        }
    }
    
    displayWeatherData(data) {
        try {
            // Current weather
            const current = data.current;
            const daily = data.daily;
            
            // Temperature
            this.currentTemp.textContent = `${Math.round(current.temperature_2m)}°C`;
            
            // Weather description and icon
            const weatherCode = current.weather_code;
            const isDay = current.is_day;
            const weatherInfo = this.getWeatherInfo(weatherCode, isDay);
            
            this.currentDescription.textContent = weatherInfo.description;
            this.currentIcon.innerHTML = `<i class="${weatherInfo.icon}"></i>`;
            
            // Additional stats
            this.humidity.textContent = `${current.relative_humidity_2m}%`;
            this.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
            this.pressure.textContent = `${Math.round(current.pressure_msl)} hPa`;
            
            // Update widget background based on weather
            this.updateWidgetTheme(weatherCode, isDay);
            
            // Forecast
            this.displayForecast(daily);
            
            // Last updated
            this.lastUpdated.textContent = `Updated: ${new Date().toLocaleTimeString('en-DK', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })}`;
            
        } catch (error) {
            console.error('Error displaying weather data:', error);
            this.showError();
        }
    }
    
    displayForecast(daily) {
        this.forecastContainer.innerHTML = '';
        
        // Skip today (index 0) and show next 5 days
        for (let i = 1; i < Math.min(daily.time.length, 6); i++) {
            const date = new Date(daily.time[i]);
            const weatherCode = daily.weather_code[i];
            const maxTemp = Math.round(daily.temperature_2m_max[i]);
            const minTemp = Math.round(daily.temperature_2m_min[i]);
            
            const weatherInfo = this.getWeatherInfo(weatherCode, true); // Use day icons for forecast
            
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            forecastItem.innerHTML = `
                <div class="forecast-day">${this.getDayName(date)}</div>
                <div class="forecast-icon">
                    <i class="${weatherInfo.icon}"></i>
                </div>
                <div class="forecast-temps">
                    <span class="forecast-high">${maxTemp}°</span>
                    <span class="forecast-low">${minTemp}°</span>
                </div>
                <div class="forecast-desc">${weatherInfo.description}</div>
            `;
            
            this.forecastContainer.appendChild(forecastItem);
        }
    }
    
    getWeatherInfo(weatherCode, isDay) {
        // WMO Weather interpretation codes
        const weatherCodes = {
            0: { description: 'Clear sky', dayIcon: 'wi wi-day-sunny', nightIcon: 'wi wi-night-clear' },
            1: { description: 'Mainly clear', dayIcon: 'wi wi-day-sunny-overcast', nightIcon: 'wi wi-night-alt-partly-cloudy' },
            2: { description: 'Partly cloudy', dayIcon: 'wi wi-day-cloudy', nightIcon: 'wi wi-night-alt-cloudy' },
            3: { description: 'Overcast', dayIcon: 'wi wi-cloudy', nightIcon: 'wi wi-cloudy' },
            45: { description: 'Fog', dayIcon: 'wi wi-day-fog', nightIcon: 'wi wi-night-fog' },
            48: { description: 'Depositing rime fog', dayIcon: 'wi wi-fog', nightIcon: 'wi wi-fog' },
            51: { description: 'Light drizzle', dayIcon: 'wi wi-day-sprinkle', nightIcon: 'wi wi-night-alt-sprinkle' },
            53: { description: 'Moderate drizzle', dayIcon: 'wi wi-sprinkle', nightIcon: 'wi wi-sprinkle' },
            55: { description: 'Dense drizzle', dayIcon: 'wi wi-sprinkle', nightIcon: 'wi wi-sprinkle' },
            56: { description: 'Light freezing drizzle', dayIcon: 'wi wi-day-sleet', nightIcon: 'wi wi-night-alt-sleet' },
            57: { description: 'Dense freezing drizzle', dayIcon: 'wi wi-sleet', nightIcon: 'wi wi-sleet' },
            61: { description: 'Slight rain', dayIcon: 'wi wi-day-rain', nightIcon: 'wi wi-night-alt-rain' },
            63: { description: 'Moderate rain', dayIcon: 'wi wi-rain', nightIcon: 'wi wi-rain' },
            65: { description: 'Heavy rain', dayIcon: 'wi wi-rain', nightIcon: 'wi wi-rain' },
            66: { description: 'Light freezing rain', dayIcon: 'wi wi-day-rain-mix', nightIcon: 'wi wi-night-alt-rain-mix' },
            67: { description: 'Heavy freezing rain', dayIcon: 'wi wi-rain-mix', nightIcon: 'wi wi-rain-mix' },
            71: { description: 'Slight snow fall', dayIcon: 'wi wi-day-snow', nightIcon: 'wi wi-night-alt-snow' },
            73: { description: 'Moderate snow fall', dayIcon: 'wi wi-snow', nightIcon: 'wi wi-snow' },
            75: { description: 'Heavy snow fall', dayIcon: 'wi wi-snow', nightIcon: 'wi wi-snow' },
            77: { description: 'Snow grains', dayIcon: 'wi wi-snow', nightIcon: 'wi wi-snow' },
            80: { description: 'Slight rain showers', dayIcon: 'wi wi-day-showers', nightIcon: 'wi wi-night-alt-showers' },
            81: { description: 'Moderate rain showers', dayIcon: 'wi wi-showers', nightIcon: 'wi wi-showers' },
            82: { description: 'Violent rain showers', dayIcon: 'wi wi-showers', nightIcon: 'wi wi-showers' },
            85: { description: 'Slight snow showers', dayIcon: 'wi wi-day-snow', nightIcon: 'wi wi-night-alt-snow' },
            86: { description: 'Heavy snow showers', dayIcon: 'wi wi-snow', nightIcon: 'wi wi-snow' },
            95: { description: 'Thunderstorm', dayIcon: 'wi wi-day-thunderstorm', nightIcon: 'wi wi-night-alt-thunderstorm' },
            96: { description: 'Thunderstorm with slight hail', dayIcon: 'wi wi-day-storm-showers', nightIcon: 'wi wi-night-alt-storm-showers' },
            99: { description: 'Thunderstorm with heavy hail', dayIcon: 'wi wi-thunderstorm', nightIcon: 'wi wi-thunderstorm' }
        };
        
        const weather = weatherCodes[weatherCode] || weatherCodes[0];
        const icon = isDay ? weather.dayIcon : weather.nightIcon;
        
        return {
            description: weather.description,
            icon: icon
        };
    }
    
    updateWidgetTheme(weatherCode, isDay) {
        // Remove existing theme classes
        this.widget.classList.remove('sunny', 'cloudy', 'rainy', 'snowy', 'night');
        
        if (!isDay) {
            this.widget.classList.add('night');
        } else if ([0, 1].includes(weatherCode)) {
            this.widget.classList.add('sunny');
        } else if ([2, 3, 45, 48].includes(weatherCode)) {
            this.widget.classList.add('cloudy');
        } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weatherCode)) {
            this.widget.classList.add('rainy');
        } else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
            this.widget.classList.add('snowy');
        }
    }
    
    getDayName(date) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    }
    
    showLoading() {
        this.loading.style.display = 'flex';
        this.error.style.display = 'none';
    }
    
    hideLoading() {
        this.loading.style.display = 'none';
    }
    
    showError() {
        this.loading.style.display = 'none';
        this.error.style.display = 'block';
    }
    
    hideError() {
        this.error.style.display = 'none';
    }
}

// Initialize the weather widget when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherWidget();
});

// Auto-refresh every 6 hours
setInterval(() => {
    const widget = new WeatherWidget();
    widget.fetchWeatherData(true); // Silent refresh
}, 6 * 60 * 60 * 1000);