/** @type {import('tailwindcss').Config} */

const color = {
  primary: {
    100: "#E5DEFF",
    200: "#DFE3FE",
    300: "#B39EF9",
    400: "#9C84F4",
    500: "#5F71FA",
    600: "#5B43CB",
  },
};

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "selector",
  theme: {
    container: {
      center: true,
    },
    fontFamily: {
      urbanist: ["Urbanist", "sans-serif"],
      spline_sans: ["Spline Sans", "sans-serif"],
      public_sans: ["Public Sans", "sans-serif"],
      remix: ["remixicon"],
    },
    extend: {
      screens: {
        "3xl": "1536px",
        "2xl": "1440px",
      },
      gridTemplateColumns: {
        13: "repeat(13, minmax(0, 1fr))",
      },
      colors: {
        "body-light": "#F4F6F9",
        heading: "#141C58",
        primary: {
          100: color.primary[100],
          200: color.primary[200],
          300: color.primary[300],
          400: color.primary[400],
          500: color.primary[500],
          600: color.primary[600],
        },
        secondary: {
          DEFAULT: "#76D466",
        },
        gray: {
          200: "#EEE",
          500: "#474747",
          700: "#4F566C",
          800: "#363D57",
          900: "#999",
        },
        danger: {
          DEFAULT: "#FF4626",
          200: "#ff462633",
        },
        warning: {
          DEFAULT: "#FFA305",
        },
        success: {
          DEFAULT: "#66CC33",
        },
        info: {
          DEFAULT: "#498CFF",
          200: "#EAF2FF",
        },
        disable: {
          DEFAULT: "#868686",
        },
        light: {
          DEFAULT: "#19213D",
        },
        pink: {
          DEFAULT: "#D777F9",
        },
        extra: {
          DEFAULT: "#18DAB5",
        },
        form: "#E7E7E7",
        blog: "#FAFAFA",
        orange: "#EC8B00",
        "student-course": "#F9F8FF",
        "input-border": "#C2C2C2",
        "black-200": "#1C1C1C",
        "star-mail": "#FDBF20",
        "form-inputs": "#D1D4E3",
        dark: {
          body: "#000011",
          card: {
            DEFAULT: "#04041D",
            two: "#090927",
            shade: "#151541",
          },
          text: {
            DEFAULT: "#D7D7D7",
            two: "#A0A0A0",
          },
          border: {
            DEFAULT: "#212146",
            two: "#111133",
            three: "#13133D",
            four: "#2B2B65",
            five: "#292559",
          },
          icon: {
            DEFAULT: "#23234D",
          },
          chart: {
            "layer-one": "#151541",
            "layer-two": "#493B94",
            "layer-three": "#5B43CB",
          },
          tooltip: {
            DEFAULT: "#1A1A3E",
          },
        },
      },
      borderRadius: {
        10: "10px",
        15: "15px",
        20: "20px",
        25: "25px",
        30: "30px",
        50: "50%",
      },
      backgroundImage: {
        "card-pattern": "url(../images/admin/card/pattern.png)",
        "card-pattern-dark": "url(../images/admin/card/pattern-dark.png)",
        calendar: "url(../images/icons/calendar-2-line.svg)",
        checked: "url(../images/icons/checked.svg)",
        "progress-bar-bg":
          "linear-gradient(to bottom, #BCABFF 0.01%, #DDFFD8 100%)",
        "progress-bar":
          "linear-gradient(160.44deg, #7D5DFE 0.01%, #76D466 100%)",
        "progress-bar-bg-dark":
          "linear-gradient(to bottom, #231E36 0.01%, #292559 100%)",
        "task-before": "linear-gradient(#5F71FA, #7D5DFE,#76D466)",
        "doc-hero": "url(../images/doc-hero-graphical-element.png)",
      },
      backgroundSize: {
        "100%": "100% 100%",
      },
      backgroundPosition: {
        "right-center": "right 10% center",
      },
      boxShadow: {
        header: "4px -2px 25px #11111129",
        "menu-dropdown": "5px 5px 8px -2px rgba(0, 0, 0,0.2)",
        "paginate-shadow": "0px 4px 12px 0px rgba(27,10,97,0.08)",
      },
      keyframes: {
        "hand-wave": {
          "0%": { transform: "rotate(0.0deg)" },
          "10%": { transform: "rotate(14.0deg)" },
          "20%": { transform: "rotate(-8.0deg)" },
          "30%": { transform: "rotate(14.0deg)" },
          "40%": { transform: "rotate(-4.0deg)" },
          "50%": { transform: "rotate(10.0deg)" },
          "60%": { transform: "rotate(0.0deg)" },
          "100%": { transform: "rotate(0.0deg)" },
        },
      },
      animation: {
        "spin-slow": "spin 3.5s linear infinite",
        "hand-wave": "hand-wave 2.5s linear infinite",
      },
      spacing: {
        header: "80px",
        "app-menu": "290px",
        "app-menu-sm": "70px",
        "ins-pro-img": "85px",
        13: "3.25rem",
        15: "3.75rem",
      },
      height: {
        screen: "100vh",
      },
      zIndex: {
        backdrop: 149,
        modal: 150,
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
