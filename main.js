const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const statusText = document.getElementById("status-text");
const weatherInfo = document.getElementById("weather-info");

const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition-text");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind-speed");
const feelsLike = document.getElementById("feels-like");
const rainChance = document.getElementById("rain-chance");

const weatherNames = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Fog", 51: "Drizzle", 53: "Drizzle", 55: "Drizzle",
  61: "Rain", 63: "Rain", 65: "Heavy rain", 71: "Snow", 73: "Snow",
  75: "Heavy snow", 80: "Rain showers", 81: "Rain showers", 82: "Heavy showers", 95: "Thunderstorm"
};

function setStatus(text) {
  statusText.textContent = text;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}

async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const data = await fetchJson(url);
  if (!data.results?.length) throw new Error("City not found");

  const place = data.results[0];
  return {
    name: `${place.name}, ${place.country}`,
    lat: place.latitude,
    lon: place.longitude
  };
}

async function getWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    daily: "precipitation_probability_max",
    timezone: "auto",
    forecast_days: "1"
  });

  return fetchJson(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
}

function renderWeather(placeName, data) {
  cityName.textContent = placeName;
  temperature.textContent = `${Math.round(data.current.temperature_2m)} C`;
  condition.textContent = weatherNames[data.current.weather_code] || "Unknown";
  humidity.textContent = `${Math.round(data.current.relative_humidity_2m)} %`;
  wind.textContent = `${Math.round(data.current.wind_speed_10m)} km/h`;
  feelsLike.textContent = `${Math.round(data.current.apparent_temperature)} C`;
  rainChance.textContent = `${Math.round(data.daily?.precipitation_probability_max?.[0] ?? 0)} %`;
  weatherInfo.classList.remove("hidden");
}

async function searchWeather() {
  const city = cityInput.value.trim();
  if (!city) return setStatus("Please enter a city name.");

  try {
    searchBtn.disabled = true;
    setStatus("Loading...");

    const place = await getCoordinates(city);
    const weather = await getWeather(place.lat, place.lon);

    renderWeather(place.name, weather);
    setStatus(`Showing weather for ${place.name}`);
  } catch (error) {
    setStatus(error.message === "City not found" ? "City not found." : "Could not load weather.");
  } finally {
    searchBtn.disabled = false;
  }
}

searchBtn.addEventListener("click", searchWeather);
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchWeather();
});
