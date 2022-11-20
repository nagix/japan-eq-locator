const colorScale = d3.scaleSequential([0, -500000], d3.interpolateSpectral);

const map = new mapboxgl.Map({
    accessToken: 'pk.eyJ1IjoibmFnaXgiLCJhIjoiY2xhcDc4MXYyMGZxOTN5bWt4NHU4azJlbCJ9.BvJ83DIBKKtMgTsDHTZekw',
    container: 'map',
    style: deck.carto.BASEMAP.DARK_MATTER_NOLABELS,
    center: [139.7670, 35.6814],
    zoom: 7,
    pitch: 60
});

const focusedPoint = document.createElement('div');
Object.assign(focusedPoint, {
    className: 'focused-point hidden'
});
document.getElementById('map').appendChild(focusedPoint);

const tooltip = document.createElement('div');
Object.assign(tooltip, {
    className: 'tooltip hidden'
});
document.getElementById('map').appendChild(tooltip);

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
        getRadius: 500,
        onHover: (info, e) => {
            if (info.layer && info.layer.id === 'epicenters') {
                if (info.object) {
                    focusedPoint.style.left = info.x + 'px';
                    focusedPoint.style.top = info.y + 'px';
                    focusedPoint.style.backgroundColor = colorScale(info.object.position[2]);
                    focusedPoint.classList.remove('hidden');

                    tooltip.style.left = info.x + 4 + 'px';
                    tooltip.style.top = info.y + 4 + 'px';
                    tooltip.innerHTML = -info.object.position[2] / 1000 + 'km'
                    tooltip.classList.remove('hidden');
                } else {
                    focusedPoint.classList.add('hidden');
                    tooltip.classList.add('hidden');
                }
                return true;
            }
        }
    }));
    map.on('move', () => {
        focusedPoint.classList.add('hidden');
        tooltip.classList.add('hidden');
    });
    // Workaround for deck.gl #3522
    map.__deck.props.getCursor = () => map.getCanvas().style.cursor;
});
