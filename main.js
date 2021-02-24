const mapContainer = document.getElementById("mapContainer");
const dateTimeSpan = document.getElementById("dateTime");
const passesDiv = document.getElementById("passes");
const listItems = document.querySelectorAll("li > span");

// API Key & Data URL
const platform = new H.service.Platform({
  apikey: "IhtkIaClMw1piLoY1dYC6btfraCYRbphRZQLo9zSf68",
});

const dataUrl = "https://api.wheretheiss.at/v1/satellites/25544";
const passUrl = `http://api.open-notify.org/iss-pass.json`;
///////

let map, defaultLayers, ui, icon, marker;

let userCoords = {
  lat: 0,
  lng: 0,
};

let issCoords = {
  lat: 0,
  lng: 0,
};

function updateMap() {
  // Create icon
  const coords = { lat: issCoords.lat, lng: issCoords.lng };
  marker = new H.map.Marker(coords, { icon: icon });

  // Add Icon to map
  map.addObject(marker);
  map.setCenter(coords);
}

// Initalise data on page load
async function initialLoad() {
  const result = await fetch(dataUrl);
  const data = await result.json();

  dateTimeSpan.innerText = new Date(data.timestamp * 1000).toUTCString();
  issCoords.lat = data.latitude;
  issCoords.lng = data.longitude;
  setUserCoords();
  createMap();
  populateStats(data);
}

function populateStats(data) {
  listItems.forEach((item) => {
    if (item.id === "list-1-name") item.innerText = data.name.toUpperCase();
    if (item.id === "list-1-norad-id") item.innerText = data.id;
    if (item.id === "list-1-latitude")
      item.innerText = data.latitude.toFixed(6);
    if (item.id === "list-1-longitude")
      item.innerText = data.longitude.toFixed(6);
    if (item.id === "list-2-altitude")
      item.innerText = `${Math.round(data.altitude)} km`;
    if (item.id === "list-2-velocity")
      item.innerText = `${Math.round(data.velocity)} km/h`;
    if (item.id === "list-2-visibility")
      item.innerText = data.visibility.toUpperCase();
  });
}

function setUserCoords() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      userCoords.lat = position.coords.latitude;
      userCoords.lng = position.coords.longitude;
      console.log("User coords set fom navigator");

      // User location Icon
      const icon2 = new H.map.Icon("./images/placeholder.png");
      const coords2 = { lat: userCoords.lat, lng: userCoords.lng };
      const marker2 = new H.map.Marker(coords2, { icon: icon2 });

      // Append icon2 to map
      map.addObject(marker2);
    });
  } else {
    console.log("Cannot get user coords from navigator");
  }
}

function createMap() {
  // Map Layers
  defaultLayers = platform.createDefaultLayers();

  // Creates map and appends to the mapContainer div
  map = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
    zoom: 3,
    //center: { lat: 20.0709, lng: -8.4452 },
  });

  // Map UI controls
  ui = H.ui.UI.createDefault(map, defaultLayers);

  // ISS Icon
  icon = new H.map.Icon("./images/satellite.png");
  const coords = { lat: issCoords.lat, lng: issCoords.lng };
  marker = new H.map.Marker(coords, { icon: icon });

  map.addObject(marker);
  map.setCenter(coords);
}

// Get fresh data every 5 seconds & update
setInterval(async () => {
  // Get data
  const result = await fetch(dataUrl);
  const data = await result.json();

  // Update stats
  populateStats(data);

  // Update stored co-ordinates
  issCoords.lat = data.latitude;
  issCoords.lng = data.longitude;

  // Update the dateTime string
  dateTimeSpan.innerText = new Date(data.timestamp * 1000).toUTCString();

  // Remove previous ISS icon
  map.removeObject(marker);

  // Update the map with new data
  updateMap();
}, 5000);

initialLoad();
