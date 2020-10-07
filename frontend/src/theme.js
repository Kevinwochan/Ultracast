import { red } from "@material-ui/core/colors";
import { createMuiTheme } from "@material-ui/core/styles";

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#102B32",
    },
    secondary: {
      main: "#026078",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#fff",
    },
  },
});

// third colour: FFDE59

export default theme;
