const colorScale = d3.scaleSequential([0, -500000], d3.interpolateSpectral);

const map = new mapboxgl.Map({
    accessToken: 'pk.eyJ1IjoibmFnaXgiLCJhIjoiY2xhcDc4MXYyMGZxOTN5bWt4NHU4azJlbCJ9.BvJ83DIBKKtMgTsDHTZekw',
    container: 'map',
    style: deck.carto.BASEMAP.DARK_MATTER_NOLABELS,
    center: [139.7670, 35.6814],
    zoom: 7,
    pitch: 60
});

Promise.all([
    fetch('data/epicenters.json').then(res => res.json()),
    new Promise(resolve => {
        map.once('styledata', resolve);
    })
]).then(([data]) => {
    map.addLayer(new deck.MapboxLayer({
        id: 'epicenters',
        type: deck.ScatterplotLayer,
        data,
        pickable: true,
        opacity: 0.2,
        radiusMinPixels: 1,
//            radiusMaxPixels: 1,
        billboard: true,
        antialiasing: false,
        getFillColor: d => {
            const [rgb, r, g, b] = colorScale(d.position[2]).match(/(\d+), (\d+), (\d+)/);
            return [+r, +g, +b];
        },
        getRadius: 500
    }));
});
