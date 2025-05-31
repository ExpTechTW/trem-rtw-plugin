const { ipcRenderer } = require("electron");
const echarts = require("../resource/js/echarts");
const regionv2 = require("../resource/region_v2.json");

document.onreadystatechange = () => {
	if (document.readyState == "complete")
		handleWindowControls();
};

function handleWindowControls() {
	document.getElementById("min-button").addEventListener("click", () => {
		// win.minimize();
	});

	document.getElementById("max-button").addEventListener("click", () => {
		// win.maximize();
	});

	document.getElementById("restore-button").addEventListener("click", () => {
		// win.unmaximize();
	});

	document.getElementById("close-button").addEventListener("click", () => {
		ipcRenderer.send("close-plugin-window", "rtw");
	});
}

const supportRTW = [
    { keys: "1", value: "11339620", text: "即時測站波形圖1" },
    { keys: "2", value: "11336952", text: "即時測站波形圖2" },
    { keys: "3", value: "11334880", text: "即時測站波形圖3" },
    { keys: "4", value: "11370676", text: "即時測站波形圖4" },
    { keys: "5", value: "6126556", text: "即時測站波形圖5" },
    { keys: "6", value: "6732340", text: "即時測站波形圖6" },
];

const data = {
	stations: {},
};
const timer = {};

const initializeStation = (keys) => {
    const stationKey = `rtw-station-${keys}`;
    const defaultValue = supportRTW.find(s => s.keys === keys)?.value;
    const storedValue = localStorage.getItem(stationKey);
    const stationId = storedValue || defaultValue;

    if (!data.stations[stationId]) {
        return stationId;
    }

    return data.stations[stationId].uuid;
};

// 初始化每個測站的值
let Realtimestation = initializeStation('6');
let Realtimestation1 = initializeStation('1');
let Realtimestation2 = initializeStation('2');
let Realtimestation3 = initializeStation('3');
let Realtimestation4 = initializeStation('4');
let Realtimestation5 = initializeStation('5');

let chartuuids = [
	Realtimestation1,
	Realtimestation2,
	Realtimestation3,
	Realtimestation4,
	Realtimestation5,
	Realtimestation,
	Realtimestation,
	Realtimestation,
];

const chartColor = localStorage.getItem('rtw-chart-color') || '#6750A4';

const charts = [
	echarts.init(document.getElementById("wave-1"), null, { height: 560 / 6, width: 400, renderer: "svg" }),
	echarts.init(document.getElementById("wave-2"), null, { height: 560 / 6, width: 400, renderer: "svg" }),
	echarts.init(document.getElementById("wave-3"), null, { height: 560 / 6, width: 400, renderer: "svg" }),
	echarts.init(document.getElementById("wave-4"), null, { height: 560 / 6, width: 400, renderer: "svg" }),
	echarts.init(document.getElementById("wave-5"), null, { height: 560 / 6, width: 400, renderer: "svg" }),
	echarts.init(document.getElementById("wave-6"), null, { height: 560 / 6, width: 400, renderer: "svg" }),
	echarts.init(document.getElementById("wave-7"), null, { height: 560 / 6, width: 400, renderer: "svg" }),
	echarts.init(document.getElementById("wave-8"), null, { height: 560 / 6, width: 400, renderer: "svg" }),
];

// 監聽顏色變更事件
window.addEventListener('rtw-color-change', (event) => {
    const newColor = event.detail.color;
    // 更新所有圖表的顏色
    charts.forEach(chart => {
        chart.setOption({
            series: [{
                color: newColor
            }]
        });
    });
});
const chartdata = [
	[],
	[],
	[],
	[],
	[],
	[],
	[],
	[],
];

const wave_count = 12;

for (let i = 0; i < wave_count; i++) {
	const dom = document.createElement("div");
	document.getElementById("wave-container").append(dom);
	charts.push(echarts.init(dom, null, { height: 560 / wave_count, width: 400 }));
	chartdata.push([]);
}

const fetch_files = async () => {
	try {
		// let res;
		// const s = {};

		const station_data = await (await fetch("https://raw.githubusercontent.com/ExpTechTW/API/master/resource/station.json")).json();
        station_v2_run(station_data);

		if (!data.stations) {
			const station_data = await (await fetch("https://cdn.jsdelivr.net/gh/ExpTechTW/API@master/resource/station.json")).json();
			station_v2_run(station_data);
		}

		if (!data.stations) {
			const station_data = await (await fetch(route.tremStation(1))).json();
			station_v2_run(station_data);
		}

		// if (app.Configuration.data["Real-time.local"]) res = require(path.resolve(__dirname, "../station.json"));
		// else res = await (await fetch("https://raw.githubusercontent.com/ExpTechTW/API/master/Json/earthquake/station.json")).json();

		// if (!res) res = await (await fetch("https://cdn.jsdelivr.net/gh/ExpTechTW/API@master/Json/earthquake/station.json")).json();

		// if (!res) res = await (await fetch("https://exptech.com.tw/api/v1/file?path=/resource/station.json")).json();

		// if (res) {
		// 	for (let i = 0, k = Object.keys(res), n = k.length; i < n; i++) {
		// 		const id = k[i];

		// 		if (res[id].Long > 118)
		// 			s[id.split("-")[2]] = { uuid: id, ...res[id] };
		// 	}

		// 	data.stations = s;
		// }
        chartuuids = [
            initializeStation('1'),
            initializeStation('2'),
            initializeStation('3'),
            initializeStation('4'),
            initializeStation('5'),
            initializeStation('6'),
            initializeStation('6'),
            initializeStation('6'),
        ];
        setCharts([
            Realtimestation1,
            Realtimestation2,
            Realtimestation3,
            Realtimestation4,
            Realtimestation5,
            Realtimestation,
            Realtimestation,
            Realtimestation,
        ]);
	} catch (error) {
		console.warn("Failed to load station data!", error);
	}
};

function station_v2_run(station_data) {
	for (let k = 0, k_ks = Object.keys(station_data), n = k_ks.length; k < n; k++) {
		const station_id = k_ks[k];
		const station_ = station_data[station_id];

		//	if (!station_.work) continue;

		const station_net = station_.net === "MS-Net" ? "H" : "L";

		let station_new_id = "";
		let station_code = "000";
		let Loc = "";
		let area = "";
		let Lat = 0;
		let Long = 0;

		let latest = station_.info[0];

		if (station_.info.length > 1)
			for (let i = 1; i < station_.info.length; i++) {
				const currentTime = new Date(station_.info[i].time);
				const latestTime = new Date(latest.time);

				if (currentTime > latestTime)
					latest = station_.info[i];
			}

		for (let i = 0, ks = Object.keys(regionv2), j = ks.length; i < j; i++) {
			const reg_id = ks[i];
			const reg = regionv2[reg_id];

			for (let r = 0, r_ks = Object.keys(reg), l = r_ks.length; r < l; r++) {
				const ion_id = r_ks[r];
				const ion = reg[ion_id];

				if (ion.code === latest.code) {
					station_code = latest.code.toString();
					Loc = `${reg_id} ${ion_id}`;
					area = ion.area;
					Lat = latest.lat;
					Long = latest.lon;
				}
			}
		}

		station_new_id = `${station_net}-${station_code}-${station_id}`;

		if (station_code === "000") {
			Lat = latest.lat;
			Long = latest.lon;

			if (station_id === "13379360") {
				Loc = "重庆市 北碚区";
				area = "重庆市中部";
			} else if (station_id === "7363648") {
				Loc = "南楊州市 和道邑";
				area = "南楊州市中部";
			}
		}

		data.stations[station_id] = { uuid: station_new_id, Lat, Long, Loc, area };
	}
}

const setCharts = (ids) => {
	for (let i = 0; i < 8; i++)
		if (data.stations?.[ids[i]]?.uuid) {
			if (chartuuids[i] != data.stations[ids[i]].uuid) {
				chartuuids[i] = data.stations[ids[i]].uuid;
				chartdata[i] = [];
			}

			if (i >= 5)
				charts[i].setOption({
					title: {
						text: `${data.stations[ids[i]].Loc} | ${chartuuids[i]} | ${(i == 5) ? "X" : (i == 6) ? "Y" : (i == 7) ? "Z" : ""}`,
					},
				});
			else
				charts[i].setOption({
					title: {
						text: `${data.stations[ids[i]].Loc} | ${chartuuids[i]}`,
					},
				});
		} else {
			chartuuids.splice(i, 1);
			charts[i].clear();
			charts[i].setOption({
				title: {
					textStyle: {
						fontSize : 10,
						color    : "rgb(230, 225, 229)",
					},
				},
				xAxis: {
					type      : "time",
					splitLine : {
						show: false,
					},
					show: false,
				},
				yAxis: {
					type      : "value",
					animation : false,
					splitLine : {
						show: false,
					},
					axisLabel: {
						interval : 1,
						fontSize : 10,
					},
				},
				grid: {
					top    : 16,
					right  : 0,
					bottom : 0,
				},
				series: [
					{
						type       : "line",
						showSymbol : false,
						data       : [],
						color      : chartColor,
					},
				],
			});
		}
};

async function init() {
    for (const chart of charts)
        chart.setOption({
            title: {
                textStyle: {
                    fontSize : 10,
                    color    : "rgb(230, 225, 229)",
                },
            },
            xAxis: {
                type      : "time",
                splitLine : {
                    show: false,
                },
                show: false,
            },
            yAxis: {
                type      : "value",
                animation : false,
                splitLine : {
                    show: false,
                },
                axisLabel: {
                    interval : 1,
                    fontSize : 10,
                },
            },
            grid: {
                top    : 16,
                right  : 0,
                bottom : 0,
            },
            series: [
                {
                    type       : "line",
                    showSymbol : false,
                    data       : [],
                    color      : chartColor,
                },
            ],
        });
    await (async () => {
		await fetch_files();

		if (!timer.stations)
			timer.stations = setInterval(fetch_files, 300_000);
	})().catch(e => {
		log(e, 3, "rts", "init");
		dump({ level: 2, message: e });
	});
}

init();

const wave = (wave_data) => {
	// console.log(wave_data);

	// const time = wave_data.time;
	const wave_data_id = wave_data.id;
	const n = wave_data.Z.length;
	const timeOffset = 500 / n;
	const now = new Date(Date.now());
	const time = Date.now();

	// const arr = [];

	let id;

	for (const i in chartuuids)
		if (parseInt(chartuuids[i].split("-")[2]) === wave_data_id)
			id = i;
        else if (parseInt(chartuuids[i]) === wave_data_id)
			id = i;

	if (parseInt(Realtimestation.split("-")[2]) === wave_data_id)
		id = 10;
    else if (parseInt(Realtimestation) === wave_data_id)
        id = 10;

	if (id == 10) {
		for (let i = 0; i < n; i++) {
			const calculatedTime = time + (i * timeOffset);
			chartdata[5].push({
				name  : now.getTime(),
				value : [new Date(calculatedTime).getTime(), Math.round(+wave_data.X[i] * 1000)],
			});
			chartdata[6].push({
				name  : now.getTime(),
				value : [new Date(calculatedTime).getTime(), Math.round(+wave_data.Y[i] * 1000)],
			});
			chartdata[7].push({
				name  : now.getTime(),
				value : [new Date(calculatedTime).getTime(), Math.round(+wave_data.Z[i] * 1000)],
			});
		}
		for (let j = 5; j < 8; j++) {
			const isHighFreq = chartuuids[j]?.startsWith("H") ?? false;
			const maxPoints = isHighFreq ? 5950 : 2380;

			while (true)
				if (chartdata[j].length > maxPoints) {
					chartdata[j].shift();
				} else if (chartdata[j].length === maxPoints) {
					break;
				} else if (chartdata[j].length !== maxPoints) {
					chartdata[j].shift();
					chartdata[j].unshift({
						name  : new Date(time - 120_000).getTime(),
						value : [new Date(time - 120_000).getTime(), null],
					});
					break;
				}

			const values = chartdata[j].map(v => v.value[1]);
			const maxmin = Math.max(Math.abs(Math.max(...values)), Math.abs(Math.min(...values)));
            charts[j].setOption({
				animation : false,
				yAxis     : {
					max : maxmin < (isHighFreq ? 1 : 1000) ? (isHighFreq ? 1 : 1000) : maxmin,
					min : -(maxmin < (isHighFreq ? 1 : 1000) ? (isHighFreq ? 1 : 1000) : maxmin),
				},
				series: [
					{
						type : "line",
						data : chartdata[j],
					},
				],
			});
		}
    } else if (chartdata[id]) {
		for (let i = 0; i < n; i++) {
			const calculatedTime = time + (i * timeOffset);
			chartdata[id].push({
				name  : now.getTime(),
				value : [new Date(calculatedTime).getTime(), Math.round(+wave_data.Z[i] * 1000)],
			});
		}

		const isHighFreq = chartuuids[id]?.startsWith("H") ?? false;
		const maxPoints = isHighFreq ? 5950 : 2380;

		while (true)
			if (chartdata[id].length > maxPoints) {
				chartdata[id].shift();
			} else if (chartdata[id].length === maxPoints) {
				break;
			} else if (chartdata[id].length !== maxPoints) {
				chartdata[id].shift();
				chartdata[id].unshift({
					name  : new Date(time - 120_000).getTime(),
					value : [new Date(time - 120_000).getTime(), null],
				});
				break;
			}

		const values = chartdata[id].map(v => v.value[1]);
		const maxmin = Math.max(Math.abs(Math.max(...values)), Math.abs(Math.min(...values)));

		charts[id].setOption({
			animation : false,
			yAxis     : {
				max : maxmin < (isHighFreq ? 1 : 1000) ? (isHighFreq ? 1 : 1000) : maxmin,
				min : -(maxmin < (isHighFreq ? 1 : 1000) ? (isHighFreq ? 1 : 1000) : maxmin),
			},
			series: [
				{
					type : "line",
					data : chartdata[id],
				},
			],
		});
	}
};

ipcRenderer.on("rtw", (event, ans) => {
    wave(ans);
    // console.log("Received rtw:", ans);
});