import { createMuiTheme } from "@material-ui/core/styles";

// A custom theme for this app
const ultraCastTheme = createMuiTheme({
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      "Oxygen",
      "Ubuntu",
      "Cantarell",
      "Fira Sans",
      "Droid Sans",
      "Helvetica Neue",
      "sans-serif",
    ].join(","),
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        body: {
          margin: 0,
          "-webkit-font-smoothing": "antialiased",
          "-moz-osx-font-smoothing": "grayscale",
        },
      },
    },
  },

  // https://material.io/resources/color/#!/?view.left=0&view.right=1&primary.color=102b33&secondary.color=FFDE59&secondary.text.color=000000&primary.text.color=ffffff
  palette: {
    primary: {
      light: "#3a545c",
      main: "#102b33",
      dark: "#00000c",
      contrastText: "#ffffff",
    },
    secondary: {
      light: "#ffff8b",
      main: "#ffde59",
      dark: "#c9ad24",
      contrastText: "#000000",
    },
    background: {
      default: "#f8f8f8",
    },
  },
  // TODO: figure out how to make custom variables
  // navBar: {
  //   height: 70,
  // },
});

// third colour: FFDE59

export default ultraCastTheme;
