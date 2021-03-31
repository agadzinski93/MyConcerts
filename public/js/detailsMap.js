mapboxgl.accessToken = mapBoxToken;
    
let map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/streets-v11',
center: concertObj.geometry.coordinates,
zoom: 10
});

new mapboxgl.Marker()
    .setLngLat(concertObj.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset:25})
        .setHTML(`<p>${concertObj.title}</p><p>${concertObj.price}</p>`)
    )
    .addTo(map);