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
        a: {
          color: "inherit" /* blue colors for links too */,
          textDecoration: "inherit" /* no underline */,
          fontWeight: "bold",
        },
      },
    },
  },

  // https://material.io/resources/color/#!/?view.left=1&view.right=1&primary.color=026078&secondary.color=f2f2f2
  palette: {
    primary: {
      light: "#478da7",
      main: "#026078",
      dark: "#00364c",
      contrastText: "#ffffff",
    },
    secondary: {
      light: "#ffffff",
      main: "#f2f2f2",
      dark: "#bfbfbf",
      contrastText: "#000000",
    },
    background: {
      default: "#ffffff",
      dark: "#f2f2f2",
    },
  },
  navBar: {
    height: 70,
  },
  player: {
    height: 80,
  },
});

export default ultraCastTheme;
