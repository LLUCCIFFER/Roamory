export const destinations = [
  {
    city: "厦门",
    region: "Sea breeze",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80"
  },
  {
    city: "杭州",
    region: "Slow lake",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80"
  },
  {
    city: "成都",
    region: "Casual day",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1400&q=80"
  },
  {
    city: "大理",
    region: "Cloud diary",
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=80"
  }
];

export const mockTrip = {
  id: "mock-hangzhou",
  title: "杭州 3 日慢游计划",
  destination: "杭州",
  startDate: "2026-10-02",
  budget: 2000,
  travelMinutes: 185,
  score: 86,
  summary: "适合喜欢拍照、美食、寺庙和咖啡的轻松慢游路线。默认以公共交通和步行为主，路线时间待高德正式接入后校准。",
  warnings: ["节假日西湖周边人流较大，建议早出发。", "龙井村山路较多，雨天请替换为室内备选。"],
  days: [
    {
      day: 1,
      title: "西湖与湖滨夜景",
      budget: 380,
      travelMinutes: 75,
      stops: [
        {
          time: "09:30",
          name: "西湖",
          duration: "150 分钟",
          transportToNext: "公交/步行 25 分钟",
          tags: ["拍照", "自然风光"],
          note: "经典湖景和轻松步行，适合第一天进入节奏。"
        },
        {
          time: "14:00",
          name: "浙江省博物馆",
          duration: "120 分钟",
          transportToNext: "地铁/步行 28 分钟",
          tags: ["博物馆", "雨天备选"],
          note: "雨天也可执行，补充文化体验。"
        },
        {
          time: "18:30",
          name: "湖滨步行街",
          duration: "110 分钟",
          transportToNext: "今日结束",
          tags: ["夜景", "美食"],
          note: "晚餐、夜景和轻量购物集中完成。"
        }
      ]
    },
    {
      day: 2,
      title: "寺庙、茶园与咖啡",
      budget: 460,
      travelMinutes: 88,
      stops: [
        {
          time: "10:00",
          name: "灵隐寺",
          duration: "150 分钟",
          transportToNext: "公交/打车 35 分钟",
          tags: ["寺庙", "文化"],
          note: "上午人流相对可控，适合慢游。"
        },
        {
          time: "13:30",
          name: "龙井村",
          duration: "120 分钟",
          transportToNext: "步行/打车 18 分钟",
          tags: ["茶园", "慢游"],
          note: "茶园和山路轻徒步，通勤待高德确认。"
        },
        {
          time: "16:30",
          name: "满觉陇咖啡",
          duration: "90 分钟",
          transportToNext: "今日结束",
          tags: ["咖啡", "拍照"],
          note: "安排松弛的下午收尾。"
        }
      ]
    },
    {
      day: 3,
      title: "城市漫步与返程",
      budget: 260,
      travelMinutes: 22,
      stops: [
        {
          time: "10:00",
          name: "小河直街",
          duration: "120 分钟",
          transportToNext: "步行 12 分钟",
          tags: ["街区", "慢游"],
          note: "低强度街区漫步，适合返程前半天。"
        },
        {
          time: "13:00",
          name: "运河边午餐",
          duration: "80 分钟",
          transportToNext: "打车 10 分钟",
          tags: ["美食", "运河"],
          note: "预算友好，离返程交通更稳。"
        },
        {
          time: "15:00",
          name: "返程缓冲",
          duration: "60 分钟",
          transportToNext: "今日结束",
          tags: ["返程", "低强度"],
          note: "预留行李和交通弹性时间。"
        }
      ]
    }
  ]
};

export const recentMemories = [
  { city: "杭州", count: 2 },
  { city: "成都", count: 1 },
  { city: "厦门", count: 1 }
];
