/* ============================================================
   Lavaux Vineyard Walk — script
   Leaflet map + inline SVG scenes + detail panel + toggles.
   No API keys, no build step.
   ============================================================ */

const STOPS = [
  {
    order: 0, cat: "walk", kind: "station", hour: "Hour 0", name: "Grandvaux Station",
    summary: "The start. A tiny station nestled in the vineyards, ~15 min by train from Lausanne and served on Sundays. Walk up into the terraces on the yellow-signed path heading east toward Cully.",
    appellation: "Villette AOC", tastingNote: "Fresh, floral Chasselas with a light mineral edge.",
    coords: [46.4969874, 6.7226439],
  },
  {
    order: 1, cat: "walk", kind: "harbor", hour: "Hour 1", name: "Cully",
    summary: "A pretty lakeside village with a small harbour, a natural place to pause. Le Major Davel here is open Sundays from 7am for coffee or a snack.",
    appellation: "Villette / Épesses Chasselas", tastingNote: "Lakefront cellars pour cru wines from the terraces just above town.",
    coords: [46.4879194, 6.7314251],
  },
  {
    order: null, cat: "wine", kind: "village", hour: "Hour 2 · Lunch", name: "Café de Riex",
    summary: "Lunch in the hilltop hamlet of Riex, just off the main path. Superb terroir cooking, one of the best-rated tables on the route (4.8★). Open Sundays 10am–4pm — book ahead, it's small and popular.",
    appellation: "Calamin Grand Cru", tastingNote: "One of only two grand crus in Lavaux — rich and structured Chasselas.",
    coords: [46.493309, 6.7361503],
  },
  {
    order: 2, cat: "walk", kind: "village", hour: "Hour 3.5", name: "Épesses",
    summary: "Widely called the prettiest village in Lavaux — narrow, vine-wrapped lanes and sweeping lake views. Worth a 15–20 min wander before Chexbres.",
    appellation: "Épesses AOC", tastingNote: "Aromatic, well-balanced Chasselas — generous and rounded.",
    coords: [46.491837, 6.746473],
  },
  {
    order: 3, cat: "walk", kind: "train", hour: "Hour 4", name: "Lavaux Panoramic",
    summary: "From Épesses, continue toward Chexbres (uphill walk, or a short taxi) for the little tourist train. A 1hr15 loop through the upper terraces with a wine tasting stop included. Call +41 21 946 23 50 to confirm July Sunday departures.",
    appellation: "Dézaley Grand Cru", tastingNote: "Lavaux's most celebrated grand cru — powerful and age-worthy, poured on the tasting stop.",
    coords: [46.4816847, 6.7791157],
  },
  {
    order: 4, cat: "walk", kind: "church", hour: "Hour 5.5", name: "St-Saphorin",
    summary: "A short walk down from Chexbres into one of the prettiest villages in Switzerland — tiny stone streets, a Romanesque church, its own appellation. The train station here is your way back to Lausanne.",
    appellation: "St-Saphorin AOC", tastingNote: "Elegant, mineral-driven whites from steep slopes.",
    coords: [46.4732766, 6.7961822],
  },
  {
    order: null, cat: "wine", kind: "harbor", hour: "Hour 6 · Final glass", name: "Café du Raisin",
    summary: "The closing stop — a lake-view terrace in St-Saphorin for a final glass of local Chasselas. Open Sundays 10:30am–3pm and 6–11pm (mind the afternoon gap). St-Saphorin station is a 2-min walk away.",
    appellation: "St-Saphorin AOC", tastingNote: "The village's mineral Chasselas, ideally with Lake Geneva perch fillets.",
    coords: [46.4729661, 6.7967479],
  },
];

/* ------------------------------------------------------------
   SVG scenes: shared terraced-vineyard + lake + sky backdrop,
   varied by `kind`. Flat, no gradients, theme via CSS vars.
   To swap real photos in later: replace sceneSVG(kind) with an
   <img src="..." alt="..."> per stop.
   ------------------------------------------------------------ */
function sceneSVG(kind) {
  const backdrop = `
    <rect x="0" y="0" width="400" height="210" fill="var(--sky)"/>
    <!-- lake -->
    <rect x="0" y="150" width="400" height="60" fill="var(--lake)"/>
    <!-- far ridge -->
    <path d="M0 150 L70 118 L150 138 L240 108 L330 132 L400 116 L400 150 Z" fill="var(--terrace-c)"/>
    <!-- vineyard terraces -->
    <path d="M0 150 L400 150 L400 138 L0 150 Z" fill="var(--terrace-a)"/>
    <path d="M0 138 L400 128 L400 118 L0 130 Z" fill="var(--terrace-b)"/>
    <path d="M0 130 L400 118 L400 110 L0 122 Z" fill="var(--terrace-c)"/>
    <!-- terrace row lines -->
    <g stroke="var(--scene-line)" stroke-width="0.6" opacity="0.28">
      <line x1="0" y1="144" x2="400" y2="140"/>
      <line x1="0" y1="134" x2="400" y2="123"/>
      <line x1="0" y1="126" x2="400" y2="114"/>
    </g>
  `;

  const scenes = {
    station: `
      <!-- rail platform -->
      <rect x="60" y="150" width="280" height="8" fill="var(--stone)"/>
      <rect x="70" y="158" width="260" height="4" fill="var(--scene-line)" opacity="0.4"/>
      <!-- platform shelter -->
      <rect x="150" y="112" width="100" height="6" fill="var(--roof)"/>
      <line x1="160" y1="118" x2="160" y2="150" stroke="var(--scene-line)" stroke-width="2"/>
      <line x1="240" y1="118" x2="240" y2="150" stroke="var(--scene-line)" stroke-width="2"/>
      <!-- sign -->
      <rect x="120" y="126" width="4" height="24" fill="var(--scene-line)"/>
      <rect x="106" y="124" width="34" height="10" rx="2" fill="var(--vine)"/>
    `,
    harbor: `
      <!-- jetty -->
      <rect x="150" y="160" width="120" height="5" fill="var(--stone)"/>
      <line x1="160" y1="165" x2="160" y2="180" stroke="var(--scene-line)" stroke-width="2"/>
      <line x1="255" y1="165" x2="255" y2="180" stroke="var(--scene-line)" stroke-width="2"/>
      <!-- boats -->
      <g>
        <path d="M70 172 q20 14 42 0 Z" fill="var(--roof)"/>
        <line x1="91" y1="150" x2="91" y2="172" stroke="var(--scene-line)" stroke-width="1.6"/>
        <path d="M91 152 L108 168 L91 168 Z" fill="var(--card)" stroke="var(--scene-line)" stroke-width="0.6"/>
      </g>
      <g>
        <path d="M300 176 q16 11 34 0 Z" fill="var(--vine)"/>
        <line x1="317" y1="158" x2="317" y2="176" stroke="var(--scene-line)" stroke-width="1.4"/>
        <path d="M317 160 L331 173 L317 173 Z" fill="var(--card)" stroke="var(--scene-line)" stroke-width="0.6"/>
      </g>
    `,
    village: `
      <!-- rooftops -->
      <g stroke="var(--scene-line)" stroke-width="0.7">
        <rect x="70" y="122" width="42" height="30" fill="var(--stone)"/>
        <path d="M66 122 L91 104 L116 122 Z" fill="var(--roof)"/>
        <rect x="120" y="128" width="50" height="24" fill="var(--stone)"/>
        <path d="M116 128 L145 108 L174 128 Z" fill="var(--roof)"/>
        <rect x="182" y="120" width="44" height="32" fill="var(--stone)"/>
        <path d="M178 120 L204 100 L230 120 Z" fill="var(--roof)"/>
        <rect x="236" y="128" width="52" height="24" fill="var(--stone)"/>
        <path d="M232 128 L262 108 L292 128 Z" fill="var(--roof)"/>
      </g>
      <g fill="var(--vine)" opacity="0.7">
        <rect x="82" y="132" width="6" height="8"/><rect x="140" y="136" width="6" height="8"/>
        <rect x="200" y="130" width="6" height="8"/><rect x="256" y="136" width="6" height="8"/>
      </g>
    `,
    train: `
      <!-- little tourist train -->
      <g stroke="var(--scene-line)" stroke-width="0.8">
        <rect x="96" y="120" width="46" height="26" rx="4" fill="var(--burgundy)"/>
        <rect x="104" y="108" width="20" height="14" rx="2" fill="var(--burgundy)"/>
        <rect x="150" y="124" width="40" height="22" rx="3" fill="var(--card)"/>
        <rect x="196" y="124" width="40" height="22" rx="3" fill="var(--card)"/>
        <rect x="242" y="124" width="40" height="22" rx="3" fill="var(--card)"/>
      </g>
      <g fill="var(--sky)" stroke="var(--scene-line)" stroke-width="0.5">
        <rect x="156" y="128" width="12" height="10"/><rect x="172" y="128" width="12" height="10"/>
        <rect x="202" y="128" width="12" height="10"/><rect x="218" y="128" width="12" height="10"/>
        <rect x="248" y="128" width="12" height="10"/><rect x="264" y="128" width="12" height="10"/>
      </g>
      <g fill="var(--scene-line)">
        <circle cx="108" cy="150" r="5"/><circle cx="132" cy="150" r="5"/>
        <circle cx="162" cy="150" r="4"/><circle cx="182" cy="150" r="4"/>
        <circle cx="208" cy="150" r="4"/><circle cx="228" cy="150" r="4"/>
        <circle cx="254" cy="150" r="4"/><circle cx="274" cy="150" r="4"/>
      </g>
    `,
    church: `
      <!-- church + Romanesque tower -->
      <g stroke="var(--scene-line)" stroke-width="0.8">
        <rect x="150" y="118" width="70" height="34" fill="var(--stone)"/>
        <path d="M146 118 L185 96 L224 118 Z" fill="var(--roof)"/>
        <rect x="188" y="86" width="26" height="66" fill="var(--stone)"/>
        <path d="M184 86 L201 66 L218 86 Z" fill="var(--roof)"/>
      </g>
      <rect x="197" y="72" width="8" height="10" fill="var(--vine)"/>
      <line x1="201" y1="60" x2="201" y2="66" stroke="var(--scene-line)" stroke-width="1.4"/>
      <line x1="197" y1="63" x2="205" y2="63" stroke="var(--scene-line)" stroke-width="1.4"/>
      <rect x="178" y="132" width="12" height="20" rx="6" fill="var(--vine)" opacity="0.8"/>
    `,
  };

  return `<svg class="detail__scene" viewBox="0 0 400 210" xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid slice" role="img"
              aria-label="Illustrated ${kind} scene over Lavaux vineyard terraces and Lake Geneva">
    ${backdrop}
    ${scenes[kind] || ""}
  </svg>`;
}

const WINE_GLASS = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 2h8l-.6 7.5A4 4 0 0 1 12 13a4 4 0 0 1-3.4-3.5L8 2Zm4 11v7m-3 0h6" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>`;

/* ------------------------------------------------------------
   Build detail panel HTML for a stop
   ------------------------------------------------------------ */
function renderDetail(stop) {
  const isWine = stop.cat === "wine";
  return `
    ${sceneSVG(stop.kind)}
    <div class="detail__body">
      <span class="detail__chip ${isWine ? "detail__chip--wine" : ""}">${stop.hour}</span>
      <h2 class="detail__name">${stop.name}</h2>
      <p class="detail__summary">${stop.summary}</p>
      <div class="wine">
        <p class="wine__label">Local wine</p>
        <p class="wine__name">${stop.appellation}</p>
        <p class="wine__note">${stop.tastingNote}</p>
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------
   Map setup
   ------------------------------------------------------------ */
const map = L.map("map", { scrollWheelZoom: false, zoomControl: true });

L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  maxZoom: 19,
}).addTo(map);

const detailEl = document.getElementById("detail");

function showStop(stop) {
  detailEl.innerHTML = renderDetail(stop);
  detailEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* Custom pin icons */
function walkIcon(order) {
  return L.divIcon({
    className: "",
    html: `<div class="pin pin--walk"><span>${order}</span></div>`,
    iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28],
  });
}
function wineIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="pin pin--wine">${WINE_GLASS}</div>`,
    iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28],
  });
}

/* Layer groups so toggles can add/remove cleanly */
const walkLayer = L.layerGroup();
const wineLayer = L.layerGroup();

const walkStops = STOPS.filter((s) => s.cat === "walk");
const wineStops = STOPS.filter((s) => s.cat === "wine");

/* Route polyline (walk stops in order) */
const routeCoords = walkStops.map((s) => s.coords);
const routeLine = L.polyline(routeCoords, {
  color: getComputedStyle(document.documentElement).getPropertyValue("--vine").trim() || "#2f5233",
  weight: 3, dashArray: "7 8", opacity: 0.85,
});
walkLayer.addLayer(routeLine);

/* Markers */
walkStops.forEach((s) => {
  const m = L.marker(s.coords, {
    icon: walkIcon(s.order),
    keyboard: true,
    title: `${s.name} — ${s.hour}`,
    alt: `Walk stop ${s.order}: ${s.name}`,
  });
  m.bindPopup(`<strong>${s.order}. ${s.name}</strong><br>${s.hour}`);
  m.on("click", () => showStop(s));
  m.on("keypress", () => showStop(s));
  walkLayer.addLayer(m);
});

wineStops.forEach((s) => {
  const m = L.marker(s.coords, {
    icon: wineIcon(),
    keyboard: true,
    title: `${s.name} — ${s.hour}`,
    alt: `Wine & tasting stop: ${s.name}`,
  });
  m.bindPopup(`<strong>${s.name}</strong><br>${s.hour}`);
  m.on("click", () => showStop(s));
  m.on("keypress", () => showStop(s));
  wineLayer.addLayer(m);
});

walkLayer.addTo(map);
wineLayer.addTo(map);

/* Fit bounds to full route + wine stops */
const allBounds = L.latLngBounds(STOPS.map((s) => s.coords));
map.fitBounds(allBounds, { padding: [40, 40] });

/* ------------------------------------------------------------
   Toggles
   ------------------------------------------------------------ */
document.querySelectorAll(".toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const layer = btn.dataset.layer;
    const on = btn.classList.toggle("is-on");
    btn.setAttribute("aria-pressed", String(on));
    const group = layer === "walk" ? walkLayer : wineLayer;
    if (on) group.addTo(map);
    else map.removeLayer(group);
  });
});

/* ------------------------------------------------------------
   Itinerary list (fallback / SEO / accessible stop list)
   ------------------------------------------------------------ */
const listEl = document.getElementById("itinerary-list");
STOPS.forEach((s) => {
  const li = document.createElement("li");
  li.className = "itin-item" + (s.cat === "wine" ? " itin-item--wine" : "");
  const label = s.cat === "walk" ? `${s.order}. ${s.name}` : s.name;
  li.innerHTML = `
    <span class="itin-item__hour">${s.hour}</span>
    <div>
      <button class="itin-item__name" type="button">${label}</button>
      <p class="itin-item__summary">${s.summary}</p>
      <p class="itin-item__wine">${s.appellation} — ${s.tastingNote}</p>
    </div>
  `;
  li.querySelector(".itin-item__name").addEventListener("click", () => {
    showStop(s);
    map.setView(s.coords, 15, { animate: true });
  });
  listEl.appendChild(li);
});

/* Show the first stop by default so the panel isn't empty */
showStop(STOPS[0]);
