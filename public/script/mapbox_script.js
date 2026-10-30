let map = new mapboxgl.Map({
    accessToken: mapBoxApi,
    container: 'map',
    center: consPreData.geocode.coordinates,
    zoom: 9
})

let marker = new mapboxgl.Marker({color: 'Red'})
    .setLngLat(consPreData.geocode.coordinates)
    .setPopup(new mapboxgl.Popup({offset: 25}).setHTML('<h5>Location</h5><br><p>Coordinates according to Satellites</p>'))
    .addTo(map);