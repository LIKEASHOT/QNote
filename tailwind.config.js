/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        claude: {
          // 基底与面板
          bg: '#FAF7F2',
          cream: '#F3EBDD',
          card: '#FFFFFF',
          
          // 边框系统
          border: '#E8DFD1',
          borderLight: '#F0E9DF',
          
          // 文字层级
          text: '#38332B',
          textSecondary: '#58544E',
          textMuted: '#847D72',
          textFaint: '#A4A09A',
          placeholder: '#C4B8A5',
          
          // 品牌主色 (Clay)
          clay: '#C97B63',
          clayLight: '#FAF0ED',
          clayDark: '#B66B54',
          clayDeep: '#A45842',
          clayBorder: '#F0D5CD',

          // 自然辅助色
          sage: '#9EAD90',
          sageLight: '#F2F5F0',
          sageDark: '#526046',

          gold: '#D6B16C',
          goldLight: '#FAF5EB',
          goldDark: '#8C6C26',

          slate: '#889BA8',
          slateLight: '#F0F4F7',
          slateDark: '#435866',

          cinnamon: '#B58872',
          cinnamonLight: '#F8F2EF',
          cinnamonDark: '#7E533F',

          rose: '#C28490',
          roseLight: '#FBF0F2',
          roseDark: '#824854',

          charcoal: '#777A80',
          charcoalLight: '#F1F2F3',
          charcoalDark: '#484B50',
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif"
        ],
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "Menlo",
          "Monaco",
          "Consolas",
          "Courier New",
          "monospace"
        ]
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};
