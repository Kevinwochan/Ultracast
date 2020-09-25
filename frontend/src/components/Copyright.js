import React from 'react';
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";

export default function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://www.facebook.com/Cap-Squad-109732227200609/?ref=py_c">
        CAPS-SQAUD
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
