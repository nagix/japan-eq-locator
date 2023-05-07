const SVGNS = 'http://www.w3.org/2000/svg';
const DEGREE_TO_RADIAN = Math.PI / 180;
const DATE_FORMAT = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Tokyo'
};
const TIME_FORMAT = {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'Asia/Tokyo'
};
const INTENSITY_LOOKUP = {
    '震度１': '1',
    '震度２': '2',
    '震度３': '3',
    '震度４': '4',
    '震度５弱': '5-',
    '震度５': '5',
    '震度５強': '5+',
    '震度６弱': '6-',
    '震度６': '6',
    '震度６強': '6+',
    '震度７': '7'
};
const HISTORICAL_EARTHQUAKES = [
    {lng: '142.007', lat: '42.69', d: '37', t: '2018-09-06T03:07:59+09:00', l: '胆振地方中東部', s: '7', m: '6.7', id: '20180906030759', n: '北海道胆振東部地震'},
    {lng: '130.762', lat: '32.7533', d: '12', t: '2016-04-16T01:25:05+09:00', l: '熊本県熊本地方', s: '7', m: '7.3', id: '20160416012505', n: '熊本地震'},
    {lng: '130.808', lat: '32.7417', d: '11', t: '2016-04-14T21:26:34+09:00', l: '熊本県熊本地方', s: '7', m: '6.5', id: '20160414212634', n: '熊本地震'},
    {lng: '142.86', lat: '38.1033', d: '24', t: '2011-03-11T14:46:18+09:00', l: '三陸沖', s: '7', m: '9.0', id: '20110311144618', n: '東北地方太平洋沖地震 (東日本大震災)'},
    {lng: '140.88', lat: '39.0283', d: '8', t: '2008-06-14T08:43:45+09:00', l: '岩手県内陸南部', s: '6+', m: '7.2', id: '20080614084345', n: '岩手・宮城内陸地震'},
    {lng: '138.608', lat: '37.5567', d: '17', t: '2007-07-16T10:13:22+09:00', l: '新潟県上中越沖', s: '6+', m: '6.8', id: '20070716101322', n: '新潟県中越沖地震'},
    {lng: '136.685', lat: '37.22', d: '11', t: '2007-03-25T09:41:57+09:00', l: '能登半島沖', s: '6+', m: '6.9', id: '20070325094157', n: '能登半島地震'},
    {lng: '138.867', lat: '37.2917', d: '13', t: '2004-10-23T17:56:00+09:00', l: '新潟県中越地方', s: '7', m: '6.8', id: '20041023175600', n: '新潟県中越地震'},
    {lng: '144.078', lat: '41.7783', d: '45', t: '2003-09-26T04:50:07+09:00', l: '十勝沖', s: '6-', m: '8.0', id: '20030926045007', n: '十勝沖地震'},
    {lng: '132.693', lat: '34.1317', d: '46', t: '2001-03-24T15:27:54+09:00', l: '安芸灘', s: '6-', m: '6.7', id: '20010324152754', n: '芸予地震'},
    {lng: '133.348', lat: '35.2733', d: '9', t: '2000-10-06T13:30:17+09:00', l: '鳥取県西部', s: '6+', m: '7.3', id: '20001006133017', n: '鳥取県西部地震'},
    {lng: '135.035', lat: '34.5983', d: '16', t: '1995-01-17T05:46:51+09:00', l: '大阪湾', s: '7', m: '7.3', id: '19950117054651', n: '兵庫県南部地震 (阪神・淡路大震災)'},
    {lng: '143.745', lat: '40.43', d: '0', t: '1994-12-28T21:19:20+09:00', l: '三陸沖', s: '6', m: '7.6', id: '19941228211920', n: '三陸はるか沖地震'},
    {lng: '147.673', lat: '43.375', d: '28', t: '1994-10-04T22:22:56+09:00', l: '北海道東方沖', s: '6', m: '8.2', id: '19941004222256', n: '北海道東方沖地震'},
    {lng: '139.18', lat: '42.7817', d: '35', t: '1993-07-12T22:17:11+09:00', l: '北海道南西沖', s: '5', m: '7.8', id: '19930712221711', n: '北海道南西沖地震'},
    {lng: '144.353', lat: '42.92', d: '101', t: '1993-01-15T20:06:07+09:00', l: '釧路沖', s: '6', m: '7.5', id: '19930115200607', n: '釧路沖地震'},
    {lng: '137.557', lat: '35.825', d: '2', t: '1984-09-14T08:48:49+09:00', l: '長野県南部', s: '4', m: '6.8', id: '19840914084849', n: '長野県西部地震'},
    {lng: '139.073', lat: '40.36', d: '14', t: '1983-05-26T11:59:57+09:00', l: '秋田県沖', s: '5', m: '7.7', id: '19830526115957', n: '日本海中部地震'},
    {lng: '142.6', lat: '42.0667', d: '40', t: '1982-03-21T11:32:05+09:00', l: '浦河沖', s: '6', m: '7.1', id: '19820321113205', n: '浦河沖地震'},
    {lng: '142.167', lat: '38.15', d: '40', t: '1978-06-12T17:14:25+09:00', l: '宮城県沖', s: '5', m: '7.4', id: '19780612171425', n: '宮城県沖地震'},
    {lng: '139.25', lat: '34.7667', d: '0', t: '1978-01-14T12:24:38+09:00', l: '伊豆大島近海', s: '5', m: '7.0', id: '19780114122438', n: '伊豆大島近海の地震'},
    {lng: '138.78', lat: '34.63', d: '9', t: '1974-05-09T08:33:27+09:00', l: '駿河湾', s: '5', m: '6.9', id: '19740509083327', n: '伊豆半島沖地震'},
    {lng: '145.97', lat: '43.0583', d: '44', t: '1973-06-17T12:55:02+09:00', l: '根室半島南東沖', s: '5', m: '7.4', id: '19730617125502', n: '根室半島沖地震'},
    {lng: '140.938', lat: '33.3367', d: '54', t: '1972-12-04T19:16:10+09:00', l: '八丈島東方沖', s: '6', m: '7.2', id: '19721204191610', n: '八丈島東方沖地震'},
    {lng: '143.595', lat: '40.6983', d: '0', t: '1968-05-16T09:48:54+09:00', l: '青森県東方沖', s: '5', m: '7.9', id: '19680516094854', n: '十勝沖地震'},
    {lng: '132.437', lat: '32.4483', d: '22', t: '1968-04-01T09:42:04+09:00', l: '日向灘', s: '5', m: '7.5', id: '19680401094204', n: '日向灘地震'},
    {lng: '130.755', lat: '32.0333', d: '0', t: '1968-02-21T10:44:52+09:00', l: '宮崎県南部山沿い', s: '5', m: '6.1', id: '19680221104452', n: 'えびの地震'},
    {lng: '139.212', lat: '38.37', d: '34', t: '1964-06-16T13:01:40+09:00', l: '新潟県下越沖', s: '5', m: '7.5', id: '19640616130140', n: '新潟地震'},
    {lng: '135.792', lat: '35.815', d: '14', t: '1963-03-27T06:34:39+09:00', l: '若狭湾', s: '5', m: '6.9', id: '19630327063439', n: '越前岬沖地震'},
    {lng: '141.138', lat: '38.74', d: '19', t: '1962-04-30T11:26:24+09:00', l: '宮城県北部', s: '4', m: '6.5', id: '19620430112624', n: '宮城県北部地震'},
    {lng: '136.7', lat: '36.1117', d: '10', t: '1961-08-19T14:33:33+09:00', l: '石川県加賀地方', s: '4', m: '7.0', id: '19610819143333', n: '北美濃地震'}
];

class MapboxGLButtonControl {

    constructor(optionArray) {
        this._options = optionArray.map(options => ({
            className: options.className || '',
            title: options.title || '',
            eventHandler: options.eventHandler
        }));
    }

    onAdd(map) {
        const me = this;

        me._map = map;

        me._container = document.createElement('div');
        me._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

        me._buttons = me._options.map(options => {
            const button = document.createElement('button'),
                icon = document.createElement('span'),
                {className, title, eventHandler} = options;

            button.className = className;
            button.type = 'button';
            button.title = title;
            button.setAttribute('aria-label', title);
            button.onclick = eventHandler;

            icon.className = 'mapboxgl-ctrl-icon';
            icon.setAttribute('aria-hidden', true);
            button.appendChild(icon);

            me._container.appendChild(button);

            return button;
        });

        return me._container;
    }

    onRemove() {
        const me = this;

        me._container.parentNode.removeChild(me._container);
        me._map = undefined;
    }

}

const colorScale = d3.scaleSequential([0, -500000], d3.interpolateSpectral);

const options = {};
for (const key of ['e', 'lng', 'lat', 'd', 't', 'l', 's', 'm', 'id', 'static']) {
    const regex = new RegExp(`(?:\\?|&)${key}=(.*?)(?:&|$)`);
    const match = location.search.match(regex);
    options[key] = match ? decodeURIComponent(match[1]) : undefined;
}
let auto = !!(options.lng && options.lat && options.t || options.id);
const interactive = !(auto && options.static);
const getParams = options => ({
    eid: options.e,
    lng: +options.lng,
    lat: +options.lat,
    depth: isNaN(options.d) ? undefined : +options.d,
    time: options.t,
    location: options.l,
    intensity: options.s,
    magnitude: isNaN(options.m) ? undefined : +options.m,
    id: options.id
});
const initialParams = getParams(options);
const params = {};
const eids = {};
let flying = false;
let numIntensity = 0;
let maxDelay = 0;

const mapElement = document.getElementById('map');

const isMobile = () => mapElement.clientWidth < 640;
const calculateCameraOptions = (depth, maxZoom) => {
    const mobile = isMobile();
    const height = mapElement.clientHeight;
    const adjustedHeight = mobile ? height - 196 : height;
    const zoom = 5.73 - Math.log2(depth) + Math.log2(adjustedHeight);
    const padding = adjustedHeight * 0.4 * Math.min(depth / adjustedHeight * Math.pow(maxZoom - 5.09, 2), 1);

    return {
        zoom: Math.min(Math.max(zoom, 0), maxZoom),
        padding: mobile ?
            {top: 196, bottom: padding, left: 0, right: 0} :
            {top: 0, bottom: padding, left: 310, right: 0}
    };
};
const {zoom, padding} = calculateCameraOptions(initialParams.depth || 0, 7);

const map = new mapboxgl.Map({
    accessToken: 'pk.eyJ1IjoibmFnaXgiLCJhIjoiY2xhcDc4MXYyMGZxOTN5bWt4NHU4azJlbCJ9.BvJ83DIBKKtMgTsDHTZekw',
    container: 'map',
    style: 'data/style.json',
    center: interactive ? auto ? [137.25, 36.5] : [139.7670, 35.6814] : [initialParams.lng, initialParams.lat],
    zoom: interactive ? auto ? 4 : 7 : zoom,
    minZoom: 2,
    pitch: interactive && auto ? 0 : 60,
    interactive
});
if (!interactive) {
    map.setPadding(padding);
}
let loaded = false;

const canvasElement = document.querySelector('#map .mapboxgl-canvas');
const recentListElement = document.querySelector('#recent-list>div:last-child');
const recentListBGElement = document.getElementById('recent-list-bg');
const historicalListElement = document.querySelector('#historical-list>div:last-child');
const historicalListBGElement = document.getElementById('historical-list-bg');
const infoBGElement = document.getElementById('info-bg');

if (interactive) {
    map.addControl(new mapboxgl.NavigationControl({visualizePitch: true}));
    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(new MapboxGLButtonControl([{
        className: 'mapboxgl-ctrl-recent-list',
        title: 'Recent earthquakes',
        eventHandler() {
            recentListBGElement.style.display = 'block';
        }
    }, {
        className: 'mapboxgl-ctrl-historical-list',
        title: 'Historical earthquakes',
        eventHandler() {
            historicalListBGElement.style.display = 'block';
        }
    }, {
        className: 'mapboxgl-ctrl-twitter',
        title: 'Twitter',
        eventHandler() {
            open('https://twitter.com/EQLocator', '_blank');
        }
    }, {
        className: 'mapboxgl-ctrl-info',
        title: 'About Japan EQ Locator',
        eventHandler() {
            infoBGElement.style.display = 'block';
        }
    }]));

    recentListBGElement.addEventListener('click', () => {
        recentListBGElement.style.display = 'none';
        canvasElement.focus();
    });
    historicalListBGElement.addEventListener('click', () => {
        historicalListBGElement.style.display = 'none';
        canvasElement.focus();
    });
    infoBGElement.addEventListener('click', () => {
        infoBGElement.style.display = 'none';
        canvasElement.focus();
    });
}

const svg = document.createElementNS(SVGNS, 'svg');
svg.setAttributeNS(null, 'class', 'svg');
mapElement.appendChild(svg);

const defs = document.createElementNS(SVGNS, 'defs');
defs.innerHTML =
    '<filter id="hypocenter-filter" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5" /></filter>' +
    '<filter id="epicenter-filter" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="20" /></filter>';
svg.appendChild(defs);

const wave1 = document.createElementNS(SVGNS, 'circle');
wave1.setAttributeNS(null, 'class', interactive ? 'wave' : 'wave-bright');
wave1.setAttributeNS(null, 'visibility', 'hidden');
svg.appendChild(wave1);

const wave2 = document.createElementNS(SVGNS, 'circle');
wave2.setAttributeNS(null, 'class', interactive ? 'wave' : 'wave-bright');
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
mapElement.appendChild(tooltip);

const legend = document.createElement('div');
Object.assign(legend, {
    className: 'legend-depth'
});
mapElement.appendChild(legend);

const panel = document.createElement('div');
Object.assign(panel, {
    className: interactive ? 'panel hidden' : 'panel static'
});
mapElement.appendChild(panel);

map.once('load', () => {
    loaded = true;
});

Promise.all([
    fetch('https://www.jma.go.jp/bosai/quake/data/list.json' + (interactive ? '' : `?t=${Date.now()}`)).then(res => res.json()),
    fetch('data/hypocenters.json').then(res => res.json()).then(data =>
        new deck.MapboxLayer({
            id: 'hypocenters',
            type: deck.ScatterplotLayer,
            data,
            pickable: true,
            opacity: 0.2,
            radiusMinPixels: 1,
            billboard: true,
            antialiasing: false,
            getFillColor: d => {
                const [rgb, r, g, b] = colorScale(d.position[2]).match(/(\d+), (\d+), (\d+)/);
                return [+r, +g, +b];
            },
            getRadius: 500
        })
    ),
    initialParams.id ? fetch(`https://api.nagi-p.com/eqdb/earthquakes/${initialParams.id}`).then(res => res.json()).then(data => {
        const hyp = data.hyp[0];
        Object.assign(initialParams, {
            lng: +hyp.lon,
            lat: +hyp.lat,
            depth: +hyp.dep.replace(' km', ''),
            time: hyp.ot.replaceAll('/', '-').replace(' ', 'T') + '+09:00',
            location: hyp.name,
            intensity: INTENSITY_LOOKUP[hyp.maxI],
            magnitude: +hyp.mag
        });
    }).catch(err => {
        initialParams.id = undefined;
    }) : Promise.resolve(),
    new Promise(resolve => map.once('styledata', resolve))
]).then(([quakes, hypocenterLayer]) => {
    map.addLayer(hypocenterLayer, 'waterway');

    // Workaround for deck.gl #3522
    map.__deck.props.getCursor = () => map.getCanvas().style.cursor;

    if (recentListElement) {
        for (const quake of quakes) {
            if (quake.ttl !== '震源・震度情報' && quake.ttl !== '遠地地震に関する情報') {
                continue;
            }
            if (eids[quake.eid]) {
                continue;
            }
            const options = {};
            const matches = quake.cod.match(/([+-][\d\.]+)([+-][\d\.]+)([+-]\d+)?/);
            options.e = quake.eid;
            options.lng = +matches[2];
            options.lat = +matches[1];
            if (matches[3] !== '') {
                options.d = Math.abs(+matches[3] / 1000);
            }
            options.l = quake.anm;
            options.t = quake.at;
            if (quake.mag !== 'Ｍ不明') {
                options.m = quake.mag;
            }
            if (quake.maxi !== '') {
                options.s = quake.maxi;
            }
            eids[quake.eid] = quake;

            const dateString = new Date(options.t).toLocaleDateString('ja-JP', DATE_FORMAT);
            const timeString = new Date(options.t).toLocaleTimeString('ja-JP', TIME_FORMAT);
            const intensityString = options.s ? '震度' + options.s.replace('-', '弱').replace('+', '強') : '';
            const magnitudeString = isNaN(options.m) ? '不明' : options.m;

            const listItem = document.createElement('div');
            Object.assign(listItem, {
                id: quake.eid,
                className: quake.eid === initialParams.eid ? 'menu-item active' : 'menu-item',
                innerHTML: `<div class="menu-check"></div><div class="menu-text">${dateString} ${timeString}<br>${options.l} M${magnitudeString} <span class="intensity-label-${options.s}">${intensityString}</span></div>`
            });
            listItem.addEventListener('click', () => {
                const activeListItem = mapElement.querySelector('.menu-item.active');
                if (activeListItem) {
                    if (activeListItem === listItem) {
                        return;
                    }
                    activeListItem.classList.remove('active');
                }
                listItem.classList.add('active');
                history.pushState({}, '', location.href.replace(/\?.*/, '') + '?' +
                    Object.keys(options).map(key => `${key}=${options[key]}`).join('&')
                );
                setHypocenter(getParams(options));
                updateIntensity();
            });
            recentListElement.appendChild(listItem);
        }
    }

    for (const item of HISTORICAL_EARTHQUAKES) {
        const dateString = new Date(item.t).toLocaleDateString('ja-JP', DATE_FORMAT);
        const timeString = new Date(item.t).toLocaleTimeString('ja-JP', TIME_FORMAT);
        const intensityString = item.s ? '震度' + item.s.replace('-', '弱').replace('+', '強') : '';

        const listItem = document.createElement('div');
        Object.assign(listItem, {
            id: item.id,
            className: item.id === options.id ? 'menu-item active' : 'menu-item',
            innerHTML: `<div class="menu-check"></div><div class="menu-text">${dateString} ${timeString}<br>${item.l} M${item.m} <span class="intensity-label-${item.s}">${intensityString}</span><br><span class="earthquake-name">${item.n}</span></div>`
        });
        listItem.addEventListener('click', () => {
            const activeListItem = mapElement.querySelector('.menu-item.active');
            if (activeListItem) {
                if (activeListItem === listItem) {
                    return;
                }
                activeListItem.classList.remove('active');
            }
            listItem.classList.add('active');
            history.pushState({}, '', location.href.replace(/\?.*/, '') + `?id=${item.id}`);
            setHypocenter(getParams(item));
            updateIntensity();
        });
        historicalListElement.appendChild(listItem);
    }

    const updateMarker = info => {
        const viewport = map.__deck.getViewports()[0];
        const [ex, ey] = auto ?
            viewport.project([params.lng, params.lat]) :
            info.viewport.project(info.object.position.slice(0, 2));
        const [hx, hy] = auto ?
            viewport.project([params.lng, params.lat, -(params.depth || 0) * 1000]) :
            [info.x, info.y];
        const depth = auto ? -(params.depth || 0) * 1000 : info.object.position[2];

        wave1.setAttributeNS(null, 'cx', hx);
        wave1.setAttributeNS(null, 'cy', hy);
        wave1.setAttributeNS(null, 'visibility', 'visible');

        wave2.setAttributeNS(null, 'cx', hx);
        wave2.setAttributeNS(null, 'cy', hy);
        wave2.setAttributeNS(null, 'visibility', 'visible');

        hypocenterCircle.setAttributeNS(null, 'cx', hx);
        hypocenterCircle.setAttributeNS(null, 'cy', hy);
        hypocenterCircle.setAttributeNS(null, 'fill', colorScale(depth));
        hypocenterCircle.setAttributeNS(null, 'visibility', 'visible');

        leader.setAttributeNS(null, 'x1', hx);
        leader.setAttributeNS(null, 'y1', hy);
        leader.setAttributeNS(null, 'x2', ex);
        leader.setAttributeNS(null, 'y2', ey);
        leader.setAttributeNS(null, 'visibility', 'visible');

        epicenterGroup.style.transform = `translate(${ex}px, ${ey}px)`;
        epicenterCircle.style.transform = `scale(1, ${Math.cos(map.getPitch() * DEGREE_TO_RADIAN)})`;
        epicenterCircle.setAttributeNS(null, 'visibility', 'visible');

        if (!auto) {
            tooltip.style.left = info.x + 4 + 'px';
            tooltip.style.top = info.y + 4 + 'px';
            tooltip.innerHTML = (-depth / 1000).toFixed(2) + 'km';
            tooltip.classList.remove('hidden');
        }
    };

    const hideMarker = () => {
        wave1.setAttributeNS(null, 'visibility', 'hidden');
        wave2.setAttributeNS(null, 'visibility', 'hidden');
        hypocenterCircle.setAttributeNS(null, 'visibility', 'hidden');
        leader.setAttributeNS(null, 'visibility', 'hidden');
        epicenterCircle.setAttributeNS(null, 'visibility', 'hidden');
        tooltip.classList.add('hidden');
    };

    const updateWave = now => {
        wave1.setAttributeNS(null, 'r', now / 10 % 300);
        wave1.setAttributeNS(null, 'opacity', 1 - now / 3000 % 1);
        wave2.setAttributeNS(null, 'r', (now / 10 + 150) % 300);
        wave2.setAttributeNS(null, 'opacity', 1 - (now / 3000 + 0.5) % 1);
    };

    const updateIntensity = () => {
        const _updateIntensity = prop =>
            fetch(prop.url).then(res => res.json()).then(data => {
                let minDistance = Infinity;
                let maxDistance = 0;
                const features = prop.getList(data).map(x => {
                    const coord = prop.getCoord(x);
                    const distance = Math.sqrt(Math.pow(turf.distance(coord, [params.lng, params.lat]), 2) + Math.pow(params.depth || 0, 2));
                    minDistance = Math.min(minDistance, distance);
                    maxDistance = Math.max(maxDistance, distance);
                    return {
                        coord,
                        location: prop.getLocation(x),
                        intensity: prop.getIntensity(x),
                        distance
                    };
                }).map(({coord, location, intensity, distance}) => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: coord
                    },
                    properties: {
                        location,
                        intensity,
                        delay: (distance - minDistance) * 20
                    }
                }));
                map.getSource('intensity').setData({
                    type: 'FeatureCollection',
                    features
                });
                numIntensity = features.length;
                maxDelay = (maxDistance - minDistance) * 20 + 500;
                return new Promise(resolve => map.once('idle', resolve));
            });

        const quake = eids[params.eid];
        if (quake) {
            return _updateIntensity({
                url: `https://www.jma.go.jp/bosai/quake/data/${quake.json}`,
                getList: d => d.Body.Intensity ? [].concat(...d.Body.Intensity.Observation.Pref.map(x => [].concat(...x.Area.map(x => [].concat(...x.City.map(x => x.IntensityStation)))))) : [],
                getCoord: d => [d.latlon.lon, d.latlon.lat],
                getLocation: d => d.Name,
                getIntensity: d => d.Int
            });
        } else if (params.id) {
            return _updateIntensity({
                url: `https://api.nagi-p.com/eqdb/earthquakes/${params.id}`,
                getList: d => d.int,
                getCoord: d => [d.lon, d.lat],
                getLocation: d => d.name,
                getIntensity: d => INTENSITY_LOOKUP[d.int]
            });
        }
        return Promise.resolve();
    };

    const onHover = info => {
        if (info.layer && info.layer.id === 'hypocenters') {
            if (info.object) {
                updateMarker(info);
            } else {
                hideMarker();
            }
            return true;
        }
    };

    const setElapsedTime = t => {
        const feature = {source: 'intensity'};
        const state = {elapsed: t};
        for (let i = 0; i < numIntensity; i++) {
            feature.id = i;
            map.setFeatureState(feature, state);
        }
    }

    const setFinalView = () => {
        const dateString = new Date(params.time).toLocaleDateString('ja-JP', DATE_FORMAT);
        const timeString = new Date(params.time).toLocaleTimeString('ja-JP', TIME_FORMAT);
        const depthString = isNaN(params.depth) ? '不明' : params.depth === 0 ? 'ごく浅い' : `${params.depth}km`;
        const intensityString = params.intensity ? params.intensity.replace('-', '弱').replace('+', '強') : '-';
        const magnitudeString = isNaN(params.magnitude) ? '不明' : params.magnitude.toFixed(1);

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
            `<div class="panel-location-text">${params.location}</div>` +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="panel-column">' +
            '<div class="panel-section">' +
            '<div class="panel-section-title">震源の深さ</div>' +
            `<div class="panel-section-body">${depthString}</div>` +
            '</div>' +
            '<div class="panel-section">' +
            '<div class="panel-section-title">最大震度</div>' +
            `<div class="panel-section-body">${intensityString}</div>` +
            '</div>' +
            '<div class="panel-section">' +
            '<div class="panel-section-title">マグニチュード</div>' +
            `<div class="panel-section-body">${magnitudeString}</div>` +
            '</div>' +
            '</div>' +
            '</div>';

        if (interactive) {
            const closeButton = document.createElement('div');
            Object.assign(closeButton, {
                className: 'close-button'
            });
            closeButton.addEventListener('click', () => {
                const activeListItem = mapElement.querySelector('.menu-item.active');
                if (activeListItem) {
                    activeListItem.classList.remove('active');
                }
                setHypocenter();
                canvasElement.focus();
            });
            panel.appendChild(closeButton);
        }

        flying = false;
        panel.classList.remove('hidden');

        if (interactive) {
            setElapsedTime(0);
            map.setLayoutProperty('intensity', 'visibility', 'visible');

            let start;
            const repeat = now => {
                const elapsed = Math.min(now - (start = start || now), maxDelay);
                setElapsedTime(elapsed);
                if (elapsed < maxDelay && map.getLayoutProperty('intensity', 'visibility') === 'visible') {
                    requestAnimationFrame(repeat);
                }
            };
            requestAnimationFrame(repeat);

            const {zoom, padding} = calculateCameraOptions(params.depth || 0, 8);
            map.easeTo({pitch: 60, zoom, padding, duration: 2000});
        }
    };

    const setHypocenter = _params => {
        if (interactive) {
            hideMarker();
            panel.classList.add('hidden');
            map.setLayoutProperty('intensity', 'visibility', 'none');
            map.off('moveend', setFinalView);
        }
        auto = !!(_params && _params.lng && _params.lat && _params.time);
        if (!auto) {
            map.easeTo({
                padding: {top: 0, bottom: 0, left: 0, right: 0},
                duration: 1000
            });
            hypocenterLayer.setProps({onHover});
            return;
        }
        Object.assign(params, _params);

        if (interactive) {
            hypocenterLayer.setProps({onHover: null});
            map.flyTo({
                center: [params.lng, params.lat],
                pitch: 0,
                zoom: 7,
                padding: {top: 0, bottom: 0, left: 0, right: 0},
                speed: 0.3
            });
            flying = true;
            map.once('moveend', setFinalView);
        } else {
            setFinalView();
            updateMarker();
            updateWave(750);
        }
    };

    let mobile = isMobile();
    if (interactive) {
        const repeat = now => {
            updateWave(now);
            requestAnimationFrame(repeat);
        };
        requestAnimationFrame(repeat);

        map.on('move', () => {
            if (!auto) {
                hideMarker();
            } else if (!flying) {
                updateMarker();
            }
        });

        map.on('mousemove', 'intensity', e => {
            tooltip.style.left = e.point.x + 4 + 'px';
            tooltip.style.top = e.point.y + 4 + 'px';
            tooltip.innerHTML = e.features[0].properties.location.replace(/＊$/, '');
            tooltip.classList.remove('hidden');
        });

        map.on('mouseleave', 'intensity', () => {
            tooltip.classList.add('hidden');
        });

        map.on('resize', () => {
            if (!auto) {
                hideMarker();
            } else if (!flying && mobile !== isMobile()) {
                const {zoom, padding} = calculateCameraOptions(params.depth || 0, 9);
                map.easeTo({zoom, padding, duration: 1000});
                mobile = !mobile;
            }
        });
    } else {
        map.on('resize', () => {
            if (mobile !== isMobile()) {
                map.jumpTo(calculateCameraOptions(params.depth || 0, 7));
                mobile = !mobile;
            }
            updateMarker();
        });
    }

    if (!auto) {
        hypocenterLayer.setProps({onHover});
        map.once(loaded ? 'idle' : 'load', () => {
            document.getElementById('loader').style.display = 'none';
        });
    } else {
        map.once(loaded ? 'idle' : 'load', () => {
            document.getElementById('loader').style.display = 'none';
            setHypocenter(initialParams);
            updateIntensity().then(() => {
                if (!interactive) {
                    const completed = document.createElement('div');
                    completed.id = 'completed';
                    document.body.appendChild(completed);
                }
            });
        });
    }
});
