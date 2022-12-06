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
for (const key of ['lng', 'lat', 'd', 't', 'l', 's', 'm', 'static']) {
    const regex = new RegExp(`(?:\\?|&)${key}=(.*?)(?:&|$)`);
    const match = location.search.match(regex);
    options[key] = match ? decodeURIComponent(match[1]) : undefined;
}
let auto = !!(options.lng && options.lat && options.t);
const interactive = !(auto && options.static);
const getParams = options => ({
    lng: +options.lng,
    lat: +options.lat,
    depth: isNaN(options.d) ? undefined : +options.d,
    time: options.t,
    location: options.l,
    scale: options.s,
    magnitude: isNaN(options.m) ? undefined : +options.m
});
const initialParams = getParams(options);
const params = {};
let flying = false;

const mapElement = document.getElementById('map');

const isMobile = () => {
    return mapElement.clientWidth < 640;
};
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
    pitch: interactive && auto ? 0 : 60,
    interactive
});
if (!interactive) {
    map.setPadding(padding);
}
let loaded = false;

const canvasElement = document.querySelector('#map .mapboxgl-canvas');
const listBGElement = document.getElementById('list-bg');
const infoBGElement = document.getElementById('info-bg');

if (interactive) {
    map.addControl(new mapboxgl.NavigationControl({visualizePitch: true}));
    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(new MapboxGLButtonControl([{
        className: 'mapboxgl-ctrl-list',
        title: 'Recent earthquakes',
        eventHandler() {
            listBGElement.style.display = 'block';
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

    listBGElement.addEventListener('click', () => {
        listBGElement.style.display = 'none';
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

Promise.all([
    fetch('https://www.jma.go.jp/bosai/quake/data/list.json').then(res => res.json()),
    fetch('data/hypocenters.json').then(res => res.json()).then(data =>
        new deck.MapboxLayer({
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
            getRadius: 500
        })
    ),
    new Promise(resolve => {
        map.once('styledata', resolve);
        map.once('load', () => {
            loaded = true;
        });
    })
]).then(([quakes, hypocenterLayer]) => {
    map.addLayer(hypocenterLayer, 'waterway');

    // Workaround for deck.gl #3522
    map.__deck.props.getCursor = () => map.getCanvas().style.cursor;

    const listElement = document.querySelector('#list>div:last-child');
    if (listElement) {
        const eids = {};
        for (const quake of quakes) {
            if (quake.ttl !== '震源・震度情報' && quake.ttl !== '遠地地震に関する情報') {
                continue;
            }
            if (eids[quake.eid]) {
                continue;
            }
            const options = {};
            const matches = quake.cod.match(/([+-][\d\.]+)([+-][\d\.]+)([+-]\d+)?/);
            options.lng = +matches[2];
            options.lat = +matches[1];
            if (matches[3] !== '') {
                options.d = Math.abs(+matches[3] / 1000)
            }
            options.l = quake.anm;
            options.t = quake.at;
            if (quake.mag !== 'Ｍ不明') {
                options.m = quake.mag;
            }
            if (quake.maxi !== '') {
                options.s = quake.maxi;
            }
            eids[quake.eid] = true;

            const dateString = new Date(options.t).toLocaleDateString('ja-JP', DATE_FORMAT);
            const timeString = new Date(options.t).toLocaleTimeString('ja-JP', TIME_FORMAT);
            const scaleString = options.s ? '震度' + options.s.replace('-', '弱').replace('+', '強') : '';
            const magnitudeString = isNaN(options.m) ? '不明' : options.m;

            const listItem = document.createElement('div');
            Object.assign(listItem, {
                id: quake.eid,
                className: 'menu-item',
                innerHTML: `<div class="menu-check"></div><div class="menu-text">${dateString} ${timeString}<br>${options.l} M${magnitudeString} ${scaleString}</div>`
            });
            listItem.addEventListener('click', () => {
                const activeListItem = listElement.querySelector('.active');
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
            });
            listElement.appendChild(listItem);
        }
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

    const setHypocenter = _params => {
        if (interactive) {
            hideMarker();
            panel.classList.add('hidden');
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

        const dateString = new Date(params.time).toLocaleDateString('ja-JP', DATE_FORMAT);
        const timeString = new Date(params.time).toLocaleTimeString('ja-JP', TIME_FORMAT);
        const depthString = isNaN(params.depth) ? '不明' : params.depth === 0 ? 'ごく浅い' : `${params.depth}km`;
        const scaleString = params.scale ? params.scale.replace('-', '弱').replace('+', '強') : '-';
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
            `<div class="panel-section-body">${scaleString}</div>` +
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
                const activeListItem = listElement.querySelector('.active');
                if (activeListItem) {
                    activeListItem.classList.remove('active');
                }
                setHypocenter();
                canvasElement.focus();
            });
            panel.appendChild(closeButton);

            hypocenterLayer.setProps({onHover: null});
            map.flyTo({
                center: [params.lng, params.lat],
                pitch: 0,
                zoom: 7,
                padding: {top: 0, bottom: 0, left: 0, right: 0},
                speed: 0.3
            });
            flying = true;
            map.once('moveend', () => {
                flying = false;
                panel.classList.remove('hidden');

                const {zoom, padding} = calculateCameraOptions(params.depth || 0, 9);
                map.easeTo({pitch: 60, zoom, padding, duration: 2000});
            });
        } else {
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
    } else {
        map.once(loaded ? 'idle' : 'load', () => {
            setHypocenter(initialParams);
            if (!interactive) {
                const completed = document.createElement('div');
                completed.id = 'completed';
                document.body.appendChild(completed);
            }
        });
    }
});
