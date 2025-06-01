class DropDown {  constructor() {
    logger.info('DropDown: Initializing...');
    this.loadMainSwitchState = () => {
      const switchEl = document.getElementById('rtw-main-switch');
      if (switchEl) {
        const state = localStorage.getItem('rtw-main-switch');
        switchEl.checked = state === 'true';
      }
    };

    this.saveMainSwitchState = (value) => {
      localStorage.setItem('rtw-main-switch', value);
    };

    this.supportRTW = [
      { keys: "1", value: "11339620", text: "即時測站波形圖1" },
      { keys: "2", value: "11336952", text: "即時測站波形圖2" },
      { keys: "3", value: "11334880", text: "即時測站波形圖3" },
      { keys: "4", value: "11370676", text: "即時測站波形圖4" },
      { keys: "5", value: "6126556", text: "即時測站波形圖5" },
      { keys: "6", value: "6732340", text: "即時測站波形圖6" },
    ];

    this.defaultColor = '#6750A4';
  }

  init(TREM, logger) {
    this.logger = logger;
    const settingButtons = document.querySelector(".setting-buttons");
    const settingContent = document.querySelector(".setting-content");
    if (settingContent) {
      const button = document.createElement("div");
      button.className = "button rtw";
      button.setAttribute("for", "rtw-page");
      settingButtons.appendChild(button);
      button.textContent = "rtw";
      const options = this.supportRTW
        .map(
          (source) => `
        <div class="setting-item-content">
          <span class="setting-item-title">${source.text}</span>
        </div>
        <div
          id="realtime-station-${source.keys}"
          class="setting-option realtime-station"
        >
          <div class="location">
            <span class="current">${source.value}</span>
            <svg
              class="selected-btn"
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 0 24 24"
              width="24"
            >
              <path
                d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <div class="select-wrapper">
            <div class="select-items city"></div>
            <div class="select-items town"></div>
          </div>
        </div>
      `,
        )
        .join("");

      const element = document.createElement("div");
      element.classList.add("setting-options-page", "rtw-page");
      element.innerHTML = `
        <div class="setting-page-header-title">rtw</div>
        <div class="setting-item-wrapper">
          <div class="setting-item-content">
            <span class="setting-item-title">rtw setting</span>
            <label class="switch-wrapper">
              <span class="switch-btn"></span>
              <span class="description">即時測站波形圖設定</span>
            </label>
            <div>
              <span>即時測站波形圖總開關</span>
              <label class="switch">
                <input id="rtw-main-switch" type="checkbox">
                <div class="slider round"></div>
              </label>
            </div>
            <!-- 添加顏色選擇器 -->
            <div class="color-picker-wrapper">
              <span>即時測站波形圖主題色</span>
              <input type="color" 
                     id="rtw-color-picker" 
                     value="${localStorage.getItem('rtw-color') || this.defaultColor}">
            </div>
            ${options}
          </div>
        </div>`;
      settingContent.appendChild(element);

      const style = document.createElement('style');
      style.textContent = `
        .color-picker-wrapper input[type="color"] {
          border: none;
          padding: 0;
          width: 32px;
          height: 32px;
          border-radius: 5px;
          background: none;
          box-shadow: none;
          outline: none;
          cursor: pointer;
        }
        .color-picker-wrapper input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 0;
          border-radius: 0;
        }
        .color-picker-wrapper input[type="color"]::-webkit-color-swatch {
          border: none;
          border-radius: 0;
        }
        .color-picker-wrapper {
          display: flex;
          align-items: center;
          gap: 4px;
          justify-content: space-between;
        }
      `;
      document.head.appendChild(style);

      const colorPicker = document.getElementById('rtw-color-picker');
      if (colorPicker) {
        colorPicker.addEventListener('change', (e) => {
          const color = e.target.value;
          localStorage.setItem('rtw-color', color);
          
          const r = parseInt(color.substr(1,2), 16);
          const g = parseInt(color.substr(3,2), 16);
          const b = parseInt(color.substr(5,2), 16);
          
          document.documentElement.style.setProperty('--user-primary-color', `${r}, ${g}, ${b}`);
          
          if (window.electron) {
            window.electron.ipcRenderer.send('update-rtw-color', color);
          }
        });
      }

      const mainSwitch = document.getElementById('rtw-main-switch');
      if (mainSwitch) {
        mainSwitch.addEventListener('change', (e) => {
          this.saveMainSwitchState(e.target.checked);
        });
      }

      this.loadMainSwitchState();
    }

    this.initDropDown(TREM);
  }

  initDropDown(TREM) {
    // 取得測站資料
    const stationCache = localStorage.getItem('cache.station');
    const stations = stationCache ? JSON.parse(stationCache) : {};
    TREM.variable = TREM.variable || {};
    TREM.variable.city = [];
    TREM.variable.station = [];

    if (!TREM.variable.region) {
      try {
        TREM.variable.region = require('./region.json');
        this.logger.debug('Loaded region.json:', TREM.variable.region);
      } catch (error) {
        this.logger.error('Error loading region.json:', error);
        TREM.variable.region = {};
      }
    }

    // 處理測站資料
    Object.entries(stations).forEach(([stationId, stationInfo]) => {
      const { info = [], net = 'unknown' } = stationInfo;
      const latestInfo = info[info.length - 1];
      if (!latestInfo || latestInfo.code === 0) return;

      const loc = this.codeToString(TREM.variable.region, latestInfo.code);
      if (loc?.city && !TREM.variable.city.some((city) => city.city === loc.city)) {
        TREM.variable.city.push({
          code: loc.code,
          city: loc.city,
        });
      }

      TREM.variable.station.push({
        name: stationId,
        net,
        loc: loc?.city ? `${loc.city}${loc.town}` : loc,
        code: latestInfo.code,
        lat: latestInfo.lat,
        lon: latestInfo.lon,
      });
    });

    // 為每個即時測站波形圖添加功能
    this.supportRTW.forEach(source => {
      const container = document.querySelector(`#realtime-station-${source.keys}`);

      if (!container) return;

      const locationWrapper = container.querySelector('.location');
      const selectWrapper = container.querySelector('.select-wrapper');
      const citySelect = container.querySelector('.select-items.city');
      const townSelect = container.querySelector('.select-items.town');

      // 初始化顯示值
      const savedStationId = localStorage.getItem(`rtw-station-${source.keys}`) ?? source.value;
      if (savedStationId) {
        const station = TREM.variable.station.find(s => s.name === savedStationId);
        if (station) {
          const current = locationWrapper.querySelector('.current');
          if (current) {
            source.value = savedStationId;
            current.textContent = `${station.loc}-${station.name}`;
          }
        }
      }

      // 渲染城市列表
      if (citySelect) {
        const uniqueCities = [...new Set(
          TREM.variable.city
            .sort((a, b) => a.code - b.code)
            .map((item) => item.city)
            .filter(Boolean)
        )];
        citySelect.innerHTML = uniqueCities.map(city =>
          `<div class="select-item">${city || 'unknown'}</div>`
        ).join('');
      }

      // 切換下拉選單的顯示狀態
      if (locationWrapper && selectWrapper) {
        locationWrapper.addEventListener('click', () => {
          const selectedBtn = locationWrapper.querySelector('.selected-btn');
          if (selectedBtn) {
            selectedBtn.classList.toggle('on');
            selectWrapper.classList.toggle('select-show-big');
          }
        });
      }

      // 處理城市選擇事件
      if (citySelect) {
        citySelect.addEventListener('click', (e) => {
          const target = e.target.closest('.select-item');
          if (!target) return;

          // 移除其他選項的選中狀態
          citySelect.querySelectorAll('.select-option-selected')
            .forEach(el => el.classList.remove('select-option-selected'));

          // 添加當前選項的選中狀態
          target.classList.add('select-option-selected');

          // 渲染對應的測站列表
          const selectedCity = target.textContent;
          const cityStations = TREM.variable.station.filter(station =>
            station.loc && station.loc.startsWith(selectedCity)
          );

          if (townSelect) {
            townSelect.innerHTML = cityStations.map(station => `
              <div class="select-item"
                data-name="${station.name}"
                data-code="${station.code}"
                data-net="${station.net}"
                data-loc="${station.loc}"
                data-lat="${station.lat}"
                data-lon="${station.lon}">
                <span class="${station.net}">${station.net}</span>
                <span>${station.code}-${station.name} ${station.loc}</span>
              </div>
            `).join('');
          }
        });
      }

      // 處理測站選擇事件
      if (townSelect) {
        townSelect.addEventListener('click', (e) => {
          const target = e.target.closest('.select-item');
          if (!target) return;

          // 移除其他選項的選中狀態
          townSelect.querySelectorAll('.select-option-selected')
            .forEach(el => el.classList.remove('select-option-selected'));

          // 添加當前選項的選中狀態
          target.classList.add('select-option-selected');

          // 更新顯示文字和保存設定
          const current = locationWrapper.querySelector('.current');
          if (current) {
            current.textContent = `${target.dataset.loc}-${target.dataset.name}`;
            localStorage.setItem(`rtw-station-${source.keys}`, target.dataset.name);
          }

          // 關閉下拉選單
          const selectedBtn = locationWrapper.querySelector('.selected-btn');
          if (selectedBtn) {
            selectedBtn.classList.remove('on');
            selectWrapper.classList.remove('select-show-big');
          }
        });
      }
    });
  }
  codeToString(region, code) {
    try {
      if (!region || typeof region !== 'object') {
        this.logger.error('Invalid region data:', region);
        return null;
      }

      for (const [city, towns] of Object.entries(region)) {
        if (!towns || typeof towns !== 'object') continue;

        for (const [town, details] of Object.entries(towns)) {
          if (details && details.code === code) {
            return { city, town, ...details };
          }
        }
      }
      return null;
    }
    catch (error) {
      this.logger.error('[codeToString error]:', error);
      return null;
    }
  }

  addClickEvent() {
    const page = document.querySelector(".rtw-page");
    const button = document.querySelector(".rtw");

    if (button)
      button.addEventListener("click", () => {
        const settingOptionsPage = document.querySelectorAll(
          ".setting-options-page",
        );
        const settingButtons = document.querySelectorAll(
          ".setting-buttons .button",
        );
        settingOptionsPage.forEach((item) => {
          item.classList.remove("active");
        });
        page.classList.add("active");

        settingButtons.forEach((item) => {
          item.classList.remove("on");
        });
        button.classList.add("on");
      });
  }
}

module.exports = DropDown;
