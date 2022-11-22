const SVGNS = 'http://www.w3.org/2000/svg';
const DEGREE_TO_RADIAN = Math.PI / 180;

const colorScale = d3.scaleSequential([0, -500000], d3.interpolateSpectral);

const map = new mapboxgl.Map({
    accessToken: 'pk.eyJ1IjoibmFnaXgiLCJhIjoiY2xhcDc4MXYyMGZxOTN5bWt4NHU4azJlbCJ9.BvJ83DIBKKtMgTsDHTZekw',
    container: 'map',
    style: 'data/style.json',
    center: [139.7670, 35.6814],
    zoom: 7,
    pitch: 60
});

const svg = document.createElementNS(SVGNS, 'svg');
svg.setAttributeNS(null, 'class', 'svg');
document.getElementById('map').appendChild(svg);

const defs = document.createElementNS(SVGNS, 'defs');
defs.innerHTML =
    '<filter id="hypocenter-filter" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>' +
    '<filter id="epicenter-filter" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20" /></filter>';
svg.appendChild(defs);

const hypocenterCircle = document.createElementNS(SVGNS, 'circle');
hypocenterCircle.setAttributeNS(null, 'class', 'hypocenter');
hypocenterCircle.setAttributeNS(null, 'r', 15);
hypocenterCircle.setAttributeNS(null, 'filter', 'url(#hypocenter-filter)');
hypocenterCircle.setAttributeNS(null, 'visibility', 'hidden');
svg.appendChild(hypocenterCircle);

const leader = document.createElementNS(SVGNS, 'line');
leader.setAttributeNS(null, 'class', 'leader');
leader.setAttributeNS(null, 'visibility', 'hidden');
svg.appendChild(leader);

const epicenterGroup = document.createElementNS(SVGNS, 'g');
svg.appendChild(epicenterGroup);

const epicenterCircle = document.createElementNS(SVGNS, 'circle');
epicenterCircle.setAttributeNS(null, 'class', 'epicenter');
epicenterCircle.setAttributeNS(null, 'r', 30);
epicenterCircle.setAttributeNS(null, 'filter', 'url(#epicenter-filter)');
epicenterCircle.setAttributeNS(null, 'visibility', 'hidden');
epicenterGroup.appendChild(epicenterCircle);

const tooltip = document.createElement('div');
Object.assign(tooltip, {
    className: 'tooltip hidden'
});
document.getElementById('map').appendChild(tooltip);

Promise.all([
    fetch('data/hypocenters.json').then(res => res.json()),
    new Promise(resolve => {
        map.once('styledata', resolve);
    })
]).then(([data]) => {
    map.addLayer(new deck.MapboxLayer({
        id: 'hypocenters',
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
            if (info.layer && info.layer.id === 'hypocenters') {
                if (info.object) {
                    const [x, y] = info.viewport.project(info.object.position.slice(0, 2));

                    hypocenterCircle.setAttributeNS(null, 'cx', info.x);
                    hypocenterCircle.setAttributeNS(null, 'cy', info.y);
                    hypocenterCircle.setAttributeNS(null, 'fill', colorScale(info.object.position[2]));
                    hypocenterCircle.setAttributeNS(null, 'visibility', 'visible');

                    leader.setAttributeNS(null, 'x1', info.x);
                    leader.setAttributeNS(null, 'y1', info.y);
                    leader.setAttributeNS(null, 'x2', x);
                    leader.setAttributeNS(null, 'y2', y);
                    leader.setAttributeNS(null, 'visibility', 'visible');

                    epicenterGroup.style.transform = `translate(${x}px, ${y}px)`;
                    epicenterCircle.style.transform = `scale(1, ${Math.cos(map.getPitch() * DEGREE_TO_RADIAN)})`;
                    epicenterCircle.setAttributeNS(null, 'visibility', 'visible');

                    tooltip.style.left = info.x + 4 + 'px';
                    tooltip.style.top = info.y + 4 + 'px';
                    tooltip.innerHTML = (-info.object.position[2] / 1000).toFixed(2) + 'km'
                    tooltip.classList.remove('hidden');
                } else {
                    hypocenterCircle.setAttributeNS(null, 'visibility', 'hidden');
                    leader.setAttributeNS(null, 'visibility', 'hidden');
                    epicenterCircle.setAttributeNS(null, 'visibility', 'hidden');
                    tooltip.classList.add('hidden');
                }
                return true;
            }
        }
    }), 'waterway');
    map.on('move', () => {
        hypocenterCircle.setAttributeNS(null, 'visibility', 'hidden');
        leader.setAttributeNS(null, 'visibility', 'hidden');
        epicenterCircle.setAttributeNS(null, 'visibility', 'hidden');
        tooltip.classList.add('hidden');
    });
    // Workaround for deck.gl #3522
    map.__deck.props.getCursor = () => map.getCanvas().style.cursor;
});
