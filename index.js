const { ipcRenderer } = require("electron");

class Plugin {
  #ctx;
  constructor(ctx) {
    this.#ctx = ctx;
    this.logger = null;
    this.DropDown = require("./drop_down");
    this.name = "rtw";
  }

  onLoad() {
    const { TREM, logger, info } = this.#ctx;

    this.logger = logger;
    this.logger.info("Loading rtw plugin...");

    // 初始化 DropDown 實例
    this.dropDown = new this.DropDown(this.logger);
    this.dropDown.init(TREM, ipcRenderer, this.name);
    this.dropDown.addClickEvent();

    if (TREM.variable && TREM.variable.events) {
      TREM.variable.events.on("rtwsend", (ans) => {
        ipcRenderer.send("send-to-plugin-window", {
          windowId: this.name,
          channel: "rtw",
          payload: ans,
        });
      });
    }

    this.init();
    this.addClickEvent(info);

    this.logger.info("rtw plugin Loaded");
  }

  init() {
    const focusButton = document.querySelector("#focus");
    if (focusButton) {
      const button = document.createElement("div");
      button.id = "rtw";
      button.className = "nav-bar-location";
      button.title = "rtw";
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e8eaed"><path d="M743-615q-25 25-58 38.5T617-563q-35 0-68-13.5T491-615l-74-74q-15-15-35-22.5t-41-7.5q-20 0-39 8t-34 22l-50 49q-11 11-25 10.5T168-641q-11-11-11-25t11-25l49-49q25-25 57-38.5t67-13.5q35 0 68 13.5t58 38.5l74 74q16 15 35 23.5t41 8.5q21 0 40.5-9t34.5-23l49-49q11-11 25.5-11t25.5 11q11 11 11 25.5T792-664l-49 49Zm0 197q-26 25-58.5 39T617-365q-35 0-67.5-14T491-418l-74-74q-15-16-35-23t-41-7q-20 0-39.5 8T268-492l-49 49q-11 11-25 11t-25-11q-11-11-11-25.5t11-25.5l48-48q25-25 57-39t67-14q35 0 68 14t58 39l74 74q16 15 35.5 23t40.5 8q21 0 40.5-8.5T692-468l50-49q11-11 25-11t25 11q11 11 11 25t-11 25l-49 49Zm1 198q-26 26-58.5 39T617-168q-35 0-68-13.5T491-220l-74-74q-15-16-35-23t-42-7q-20 0-39 8t-33 22l-49 49q-11 11-25 10.5T169-246q-11-11-11-25t11-25l48-49q25-25 57-38.5t67-13.5q35 0 68 13.5t58 38.5l74 74q16 15 35.5 23t41.5 8q21 0 40-8.5t34-22.5l50-49q11-11 25-10.5t25 11.5q11 11 11 25t-11 25l-48 49Z"/></svg>`;
      focusButton.insertAdjacentElement("afterend", button);
    }
  }

  addClickEvent(info) {
    const button = document.querySelector("#rtw");
    if (button) {
      button.addEventListener("click", () => {
        ipcRenderer.send("open-plugin-window", {
          pluginId: this.name,
          htmlPath: `${info.pluginDir}/${this.name}/web/index.html`,
          options: {
            width          : 400,
            minWidth       : 400,
            minHeight      : 774,
            height         : 774,
            title          : "rtw",
            frame          : false,
            transparent    : true,
            webPreferences : {
              nodeIntegration      : true,
              contextIsolation     : false,
              enableRemoteModule   : true,
              backgroundThrottling : false,
              nativeWindowOpen     : true,
            },
          },
        });
      });
    }
  }
}

module.exports = Plugin;
