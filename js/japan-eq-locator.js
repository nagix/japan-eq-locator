const SVGNS = 'http://www.w3.org/2000/svg';
const DEGREE_TO_RADIAN = Math.PI / 180;
const DATE_FORMAT = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
};
const TIME_FORMAT = {
    hour: 'numeric',
    minute: 'numeric'
};

const colorScale = d3.scaleSequential([0, -500000], d3.interpolateSpectral);

const options = {};
for (const key of ['lng', 'lat', 'd', 't', 'l', 's', 'm']) {
    const regex = new RegExp(`(?:\\?|&)${key}=(.*?)(?:&|$)`);
    const match = location.search.match(regex);
    options[key] = match ? decodeURIComponent(match[1]) : undefined;
}
const auto = options.lng && options.lat && options.t;

const map = new mapboxgl.Map({
    accessToken: 'pk.eyJ1IjoibmFnaXgiLCJhIjoiY2xhcDc4MXYyMGZxOTN5bWt4NHU4azJlbCJ9.BvJ83DIBKKtMgTsDHTZekw',
    container: 'map',
    style: 'data/style.json',
    center: auto ? [137.25, 36.5] : [139.7670, 35.6814],
    zoom: auto ? 4 : 7,
    pitch: auto ? 0 : 60
});

const svg = document.createElementNS(SVGNS, 'svg');
svg.setAttributeNS(null, 'class', 'svg');
document.getElementById('map').appendChild(svg);

const defs = document.createElementNS(SVGNS, 'defs');
defs.innerHTML =
    '<filter id="hypocenter-filter" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5" /></filter>' +
    '<filter id="epicenter-filter" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="20" /></filter>';
svg.appendChild(defs);

const wave1 = document.createElementNS(SVGNS, 'circle');
wave1.setAttributeNS(null, 'class', 'wave');
wave1.setAttributeNS(null, 'visibility', 'hidden');
svg.appendChild(wave1);

const wave2 = document.createElementNS(SVGNS, 'circle');
wave2.setAttributeNS(null, 'class', 'wave');
wave2.setAttributeNS(null, 'visibility', 'hidden');
svg.appendChild(wave2);

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

const panel = document.createElement('div');
Object.assign(panel, {
    className: 'panel hidden'
});
document.getElementById('map').appendChild(panel);

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
        onHover: (info) => {
            if (!auto && info.layer && info.layer.id === 'hypocenters') {
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

    // Workaround for deck.gl #3522
    map.__deck.props.getCursor = () => map.getCanvas().style.cursor;

    map.on('move', () => {
        if (!auto) {
            hypocenterCircle.setAttributeNS(null, 'visibility', 'hidden');
            leader.setAttributeNS(null, 'visibility', 'hidden');
            epicenterCircle.setAttributeNS(null, 'visibility', 'hidden');
            tooltip.classList.add('hidden');
        }
    });

    if (auto) {
        const dateString = new Date(options.t).toLocaleDateString('ja-JP', DATE_FORMAT);
        const timeString = new Date(options.t).toLocaleTimeString('ja-JP', TIME_FORMAT);
        const depth = isNaN(options.d) ? '不明' : `${options.d}km`
        panel.innerHTML =
            '<div class="panel-body">' +
            '<div class="panel-column">' +
            '<div class="panel-section">' +
            '<div class="panel-section-title">発生日時</div>' +
            '<div class="panel-section-body">' +
            `<div class="panel-date-text">${dateString}</div>` +
            `<div class="panel-time-text">${timeString}</div>` +
            '</div>' +
            '</div>' +
            '<div class="panel-section">' +
            '<div class="panel-section-title">震央地名</div>' +
            '<div class="panel-section-body">' +
            `<div class="panel-location-text">${options.l}</div>` +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="panel-column">' +
            '<div class="panel-section">' +
            '<div class="panel-section-title">震源の深さ</div>' +
            `<div class="panel-section-body">${depth}</div>` +
            '</div>' +
            '<div class="panel-section">' +
            '<div class="panel-section-title">最大震度</div>' +
            `<div class="panel-section-body">${options.s}</div>` +
            '</div>' +
            '<div class="panel-section">' +
            '<div class="panel-section-title">マグニチュード</div>' +
            `<div class="panel-section-body">${options.m}</div>` +
            '</div>' +
            '</div>' +
            '</div>'

        map.on('load', () => {
            const width = document.getElementById('map').clientWidth;
            map.flyTo({
                center: [+options.lng, +options.lat],
                padding: width < 640 ?
                    {top: 200, bottom: 0, left: 0, right: 0} :
                    {top: 0, bottom: 0, left: 210, right: 0},
                pitch: 0,
                zoom: 7,
                speed: 0.3
            });
            map.once('moveend', () => {
                map.on('move', () => {
                    const viewport = map.__deck.getViewports()[0];
                    const [ex, ey] = viewport.project([+options.lng, +options.lat]);
                    const [hx, hy] = viewport.project([+options.lng, +options.lat, -(options.d || 0) * 1000]);

                    wave1.setAttributeNS(null, 'cx', hx);
                    wave1.setAttributeNS(null, 'cy', hy);
                    wave1.setAttributeNS(null, 'visibility', 'visible');

                    wave2.setAttributeNS(null, 'cx', hx);
                    wave2.setAttributeNS(null, 'cy', hy);
                    wave2.setAttributeNS(null, 'visibility', 'visible');

                    hypocenterCircle.setAttributeNS(null, 'cx', hx);
                    hypocenterCircle.setAttributeNS(null, 'cy', hy);
                    hypocenterCircle.setAttributeNS(null, 'fill', colorScale(-(options.d || 0) * 1000));
                    hypocenterCircle.setAttributeNS(null, 'visibility', 'visible');

                    leader.setAttributeNS(null, 'x1', hx);
                    leader.setAttributeNS(null, 'y1', hy);
                    leader.setAttributeNS(null, 'x2', ex);
                    leader.setAttributeNS(null, 'y2', ey);
                    leader.setAttributeNS(null, 'visibility', 'visible');

                    epicenterGroup.style.transform = `translate(${ex}px, ${ey}px)`;
                    epicenterCircle.style.transform = `scale(1, ${Math.cos(map.getPitch() * DEGREE_TO_RADIAN)})`;
                    epicenterCircle.setAttributeNS(null, 'visibility', 'visible');
                });
                const width = document.getElementById('map').clientWidth;
                const height = document.getElementById('map').clientHeight;
                const [lng, lat] = turf.getCoord(turf.destination([+options.lng, +options.lat], (options.d || 0) * Math.sin(60 * DEGREE_TO_RADIAN), 180));
                map.fitBounds([+options.lng, lat, +options.lng, +options.lat], {
                    pitch: 60,
                    maxZoom: 9,
                    duration: 2000,
                    padding: width < 640 ?
                        {top: 0, bottom: height / 6, left: 0, right: 0} :
                        {top: 0, bottom: height / 3, left: 210, right: 0}
                });
                panel.classList.remove('hidden');
                const repeat = now => {
                    wave1.setAttributeNS(null, 'r', now / 10 % 300);
                    wave1.setAttributeNS(null, 'opacity', 1 - now / 3000 % 1);
                    wave2.setAttributeNS(null, 'r', (now / 10 + 150) % 300);
                    wave2.setAttributeNS(null, 'opacity', 1 - (now / 3000 + 0.5) % 1);
                    requestAnimationFrame(repeat);
                };
                requestAnimationFrame(repeat);
            });
        });
    }
});
