# Weather Widget for Gentofte, Denmark

A modern, responsive weather widget that displays current weather and 5-day forecast for Gentofte, Denmark. The widget fetches data from Open-Meteo API (no API key required) and caches it locally for offline use.

## Features

- 🌤️ Current weather conditions with animated icons
- 📅 5-day weather forecast
- 💾 Local storage caching (updates twice daily)
- 📱 Fully responsive design
- 🎨 Modern UI with weather-based themes
- 🔄 Automatic background updates
- 🌐 No API key required
- ⚡ Fast loading with cached data

## Files

- `weather-widget.html` - Standalone widget page
- `embed.html` - Embeddable version for iframes
- `weather-widget.css` - Styling and responsive design
- `weather-widget.js` - Core functionality and API integration

## Usage

### Option 1: Direct Embed (Recommended for Smartboards)

Use the embed.html file in an iframe:

```html
<iframe 
    src="https://your-wordpress-site.com/path-to-widget/embed.html" 
    width="100%" 
    height="500" 
    frameborder="0"
    style="border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
</iframe>
```

### Option 2: Direct Integration

Include the CSS and JS files in your page:

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="weather-widget.css">
</head>
<body>
    <div class="weather-widget" id="weatherWidget">
        <!-- Widget HTML structure -->
    </div>
    <script src="weather-widget.js"></script>
</body>
</html>
```

### Option 3: WordPress Integration

1. Upload all files to your WordPress media library or a custom directory
2. Create a new page or post
3. Add an HTML block with the iframe code pointing to your embed.html file

## Customization

### Changing Location

To change the location from Gentofte to another city:

1. Open `weather-widget.js`
2. Update the coordinates in the constructor:
```javascript
this.latitude = YOUR_LATITUDE;
this.longitude = YOUR_LONGITUDE;
this.location = 'Your City, Country';
```

### Styling

The widget uses CSS custom properties and is fully customizable. Key classes:

- `.weather-widget` - Main container
- `.current-weather` - Current conditions section
- `.forecast` - Forecast section
- `.weather-widget.sunny/cloudy/rainy/snowy/night` - Theme variants

### Cache Settings

Modify cache duration in `weather-widget.js`:

```javascript
this.cacheValidHours = 12; // Update twice per day
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers
- Smartboard browsers

## Data Source

Weather data provided by [Open-Meteo](https://open-meteo.com/) - a free, open-source weather API that doesn't require registration or API keys.

## Technical Details

- **API**: Open-Meteo Weather API
- **Update Frequency**: Twice daily (configurable)
- **Cache Storage**: Browser localStorage
- **Icons**: Weather Icons font
- **Responsive**: CSS Grid and Flexbox
- **Performance**: Cached data for fast loading

## Troubleshooting

### Widget shows "Loading..." indefinitely
- Check browser console for errors
- Ensure internet connection is available
- Verify the Open-Meteo API is accessible

### Old data showing
- Clear browser localStorage
- Check if cache duration needs adjustment

### Icons not displaying
- Ensure Weather Icons CDN is accessible
- Check for ad blockers blocking font resources

## License

This widget is free to use for personal and commercial projects.