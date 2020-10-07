# Frontend

## Installation
```
npm install
npm start
```

## Development
```
npm install --dev
npm start
```
or run with any of the other react scripts
  ```
"scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "dev:build-server": "NODE_ENV=development webpack --config webpack.server.js --mode=development -w",
    "dev:start": "nodemon ./server-build/index.js",
    "dev": "npm-run-all --parallel build dev:*"
  },
```
## Architecture
### Dependencies
**Core**
    -"react": "^16.13.1",
    - "react-dom": "^16.13.1",
  -  "react-scripts": "3.4.3", 
    
**Utilities**
   - "react-router-dom": "^5.2.0", - allows http paths
   - "axios": "^0.20.0", - used for retrieving data from backend (HTTP requests)
  -  "react-uid": "^2.3.0", - provides unique keys for react components
    
**Styling**
  -  "@material-ui/core": "^4.11.0",  - material ui dependency
   - "@material-ui/icons": "^4.9.1",  - material ui dependency
  -  "@popperjs/core": "^2.4.4",  - material ui dependency?
   - "jquery": "^3.5.1",  - material ui dependency?
  -  "material-ui-audio-player": "^1.2.0",
   - "react-bootstrap": "^1.3.0", - deprecated, needs to be removed

   - "styled-components": "^5.2.0", - deprecated, needs to be removed, replaced by material-ui's styled
   - "typescript": "^4.0.2" - material ui dependency
       
**DevOps**
-   "husky": "^4.3.0" - pre-commit hooks
-   "prettier": "^2.1.2", - code formatter/linter
   
**Continuous integration**
-  "@testing-library/jest-dom": "^4.2.4",
-  "@testing-library/react": "^9.5.0",
-  "@testing-library/user-event": "^7.2.1",
