class DropDown {
  constructor(logger) {
    this.logger = logger;
    this.logger.info('DropDown: Initializing...');
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
    this.defaultChartColor = '#6750A4';

    this.messageContent = document.querySelector('.message-content');
    this.messageBox = document.querySelector('.message-box');
  }

  init(TREM, ipcRenderer, name) {
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
          <span class="setting-item-title rts-station-title">${source.text}</span>
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
            <div class="setting-option">
              <div>
                <span>即時測站波形圖總開關</span>
                <label class="switch">
                  <input id="rtw-main-switch" type="checkbox">
                  <div class="slider round"></div>
                </label>
              </div>
              <div class="color-picker-wrapper">
                <span>即時測站波形圖主題色</span>
                <input type="color"
                      id="rtw-color-picker"
                      value="${localStorage.getItem('rtw-color') || this.defaultColor}">
              </div>
              <div class="color-picker-wrapper">
                <span>即時測站波形圖波形色</span>
                <input type="color"
                      id="rtw-chart-color-picker"
                      value="${localStorage.getItem('rtw-chart-color') || this.defaultColor}">
              </div>
              <div>
                <span class="rtw-reset-setting"></span>
                <label class="switch">
                  <div class="rtw-reset-button"></div>
                </label>
              </div>
            </div>
          </div>
          ${options}
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
        .rtw-reset-setting + .switch {
          width: auto;
        }
        .rtw-reset-button {
          border-radius: 5px;
          border: 1px solid #ffffff24;
          width: auto;
          height: 3px;
          cursor: pointer;
          color: var(--danger);
          justify-content: center;
        }
        .rtw-reset-button:hover {
          background: #48484d;
        }
        .rtw-reset-setting::before {
          content: "重設rtw設定";
        }
        .rtw-reset-button::before {
          content: "重設";
          white-space: nowrap;
        }
        .rtw-reset .confirm-title::before {
          content: "您確定要重設rtw設定嗎？";
        }
      `;
      document.head.appendChild(style);

      this.resetConfirmWrapper = document.querySelector('.confirm-wrapper');

      // 重置按鈕功能
      const resetBtn = element.querySelector('.rtw-reset-button');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.resetConfirmWrapper.classList.add('rtw-reset');
          this.resetConfirmWrapper.style.bottom = '0%';
          const confirmSureBtn = this.resetConfirmWrapper.querySelector('.confirm-sure');
          this.addCountDown(confirmSureBtn);
        });
      }

      this.resetConfirmWrapper.addEventListener('click', (event) => {
        if (!this.resetConfirmWrapper.classList.contains('rtw-reset')) {
          return;
        }
        const { classList } = event.target;
        if (classList[0] == 'confirm-sure') {
          this.resetConfirmWrapper.style.bottom = '-100%';
          // 重置顏色設定
          localStorage.setItem('rtw-color', this.defaultColor);
          localStorage.setItem('rtw-chart-color', this.defaultChartColor);

          // 更新色彩選擇器的值
          const colorPicker = document.getElementById('rtw-color-picker');
          const chartColorPicker = document.getElementById('rtw-chart-color-picker');
          if (colorPicker) colorPicker.value = this.defaultColor;
          if (chartColorPicker) chartColorPicker.value = this.defaultChartColor;

          // 重置測站設定
          this.supportRTW.forEach(source => {
            localStorage.removeItem(`rtw-station-${source.keys}`);
            const container = document.querySelector(`#realtime-station-${source.keys}`);
            const locationWrapper = container.querySelector('.location');
            if (locationWrapper) {
              const station = TREM.variable.station.find(s => s.name === source.value);
              if (station) {
                const current = locationWrapper.querySelector('.current');
                if (current) {
                  current.textContent = `${station.loc}-${station.name}`;
                }
              }
            }
          });

          // 重置主開關
          localStorage.setItem('rtw-main-switch', 'true');
          const mainSwitch = document.getElementById('rtw-main-switch');
          if (mainSwitch) {
            mainSwitch.checked = true;
          }

          // 更新主題色
          const r = parseInt(this.defaultColor.substr(1,2), 16);
          const g = parseInt(this.defaultColor.substr(3,2), 16);
          const b = parseInt(this.defaultColor.substr(5,2), 16);
          document.documentElement.style.setProperty('--user-primary-color', `${r}, ${g}, ${b}`);

          // 通知插件視窗更新顏色
          ipcRenderer.send("send-to-plugin-window", {
            windowId: name,
            channel: "update-rtw-color",
            payload: this.defaultColor,
          });
          ipcRenderer.send("send-to-plugin-window", {
            windowId: name,
            channel: "update-rtw-chart-color",
            payload: this.defaultChartColor,
          });

          this.logger.info('所有設定已重置為預設值');
          this.showBubble('success', 1500);
        }
        else if (classList[0] == 'confirm-cancel') {
          this.hideConfirmWrapper();
        }
      });

      const colorPicker = document.getElementById('rtw-color-picker');
      const chartColorPicker = document.getElementById('rtw-chart-color-picker');
      if (colorPicker) {
        colorPicker.addEventListener('change', (e) => {
          const color = e.target.value;
          localStorage.setItem('rtw-color', color);
          const Chartcolor = localStorage.getItem('rtw-chart-color') || '#6750A4';
	        if (color != Chartcolor) {
            localStorage.setItem('rtw-chart-color', color);
            chartColorPicker.value = color;
          }

          const r = parseInt(color.substr(1,2), 16);
          const g = parseInt(color.substr(3,2), 16);
          const b = parseInt(color.substr(5,2), 16);

          document.documentElement.style.setProperty('--user-primary-color', `${r}, ${g}, ${b}`);

          ipcRenderer.send("send-to-plugin-window", {
            windowId: name,
            channel: "update-rtw-color",
            payload: color,
          });
          this.logger.debug('updated color:', color);
        });
      }
      if (chartColorPicker) {
        chartColorPicker.addEventListener('change', (e) => {
          const color = e.target.value;
          localStorage.setItem('rtw-chart-color', color);

          const r = parseInt(color.substr(1,2), 16);
          const g = parseInt(color.substr(3,2), 16);
          const b = parseInt(color.substr(5,2), 16);

          document.documentElement.style.setProperty('--user-primary-color', `${r}, ${g}, ${b}`);

          ipcRenderer.send("send-to-plugin-window", {
            windowId: name,
            channel: "update-rtw-chart-color",
            payload: color,
          });
          this.logger.debug('updated chart color:', color);
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

  addCountDown(confirmSureBtn) {
    this.countdown = 5;
    clearInterval(this.interval);
    confirmSureBtn.classList.add('disabled');
    confirmSureBtn.textContent = this.countdown;
    this.interval = setInterval(() => {
      this.countdown--;
      if (this.countdown > 0) {
        confirmSureBtn.textContent = this.countdown;
      }
      else {
        confirmSureBtn.textContent = '';
        confirmSureBtn.classList.remove('disabled');
        clearInterval(this.interval);
      }
    }, 1000);
  }

  hideConfirmWrapper() {
    this.resetConfirmWrapper.classList.remove('rtw-reset');
    this.resetConfirmWrapper.style.bottom = '-100%';
    clearInterval(this.interval);
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

  showBubble(message, duration = 3000) {
    if (!this.messageContent || !this.messageBox || this.messageContent.classList.contains(message) || this.messageBox.classList.contains(message)) {
      return;
    }
    this.messageContent.classList.add(message);
    this.messageBox.classList.add(message);
    setTimeout(() => {
      this.messageContent.classList.remove(message);
      setTimeout(() => {
        this.messageBox.classList.remove(message);
      }, 200);
    }, duration);
  }
}

module.exports = DropDown;
