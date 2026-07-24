// ═══ 数据层：所有数据只存在浏览器 localStorage ═══
const KEY = 'other-side-wuxi-v1';

const blank = () => ({
  user: null,          // { name, createdAt }
  visits: {},          // { spotId: count }
  footprints: [],      // [{ id, spot, place, pos:[x,y,z], mood:1-5, score:1-10, text, ts }]
  covers: {},          // { spotId: dataURL } 游览截图做封面
  fortunes: {},        // { 'YYYY-MM-DD': index }
  lastTheme: 'auto',
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    return Object.assign(blank(), JSON.parse(raw));
  } catch (e) {
    return blank();
  }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(store.data)); } catch (e) { /* 存储满了就静默 */ }
}

export const store = {
  data: load(),

  setUser(name) {
    this.data.user = { name, createdAt: Date.now() };
    save();
  },
  clearUser() {
    this.data.user = null;
    save();
  },

  visitSpot(spotId) {
    this.data.visits[spotId] = (this.data.visits[spotId] || 0) + 1;
    save();
  },
  visitCount(spotId) {
    return this.data.visits[spotId] || 0;
  },

  addFootprint(fp) {
    fp.id = 'fp' + Date.now().toString(36) + Math.floor(Math.random() * 999);
    fp.ts = Date.now();
    this.data.footprints.push(fp);
    save();
    return fp;
  },
  removeFootprint(id) {
    this.data.footprints = this.data.footprints.filter(f => f.id !== id);
    save();
  },
  footprintsOf(spotId) {
    return this.data.footprints.filter(f => f.spot === spotId);
  },
  todayFootprints() {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    return this.data.footprints.filter(f => f.ts >= d.getTime());
  },

  setCover(spotId, dataUrl) {
    this.data.covers[spotId] = dataUrl;
    save();
  },
  getCover(spotId) {
    return this.data.covers[spotId] || null;
  },

  setFortune(dateStr, idx) {
    this.data.fortunes[dateStr] = idx;
    save();
  },
  getFortune(dateStr) {
    return this.data.fortunes[dateStr];
  },

  setTheme(t) { this.data.lastTheme = t; save(); },
  getTheme() { return this.data.lastTheme || 'auto'; },
};

// ═══ 成就称号：按足迹总数解锁 ═══
export const TITLES = [
  { need: 0,  title: '初次踏入夜色' },
  { need: 3,  title: '开始有了秘密基地' },
  { need: 6,  title: '山河间的常客' },
  { need: 10, title: '四景巡游者' },
  { need: 16, title: '夜行地缚灵' },
  { need: 25, title: '夜游神的常住人口' },
];

export function titleFor(count) {
  let t = TITLES[0].title;
  for (const it of TITLES) if (count >= it.need) t = it.title;
  return t;
}
