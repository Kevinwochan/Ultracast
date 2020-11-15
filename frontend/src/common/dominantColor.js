/* eslint-disable no-throw-literal */
export default function getDominantColour(img) {
  function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255) throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
  }

  // Create a canvas
  var canvas = document.createElement("canvas");
  var c = canvas.getContext("2d");
  c.width = canvas.width = img.width;
  c.height = canvas.height = img.height;
  c.clearRect(0, 0, c.width, c.height);
  c.drawImage(img, 0, 0, img.width, img.height);

  // Count the most dominant colours
  var col,
    colors = {};
  var pixels, r, g, b, a;
  r = g = b = a = 0;
  pixels = c.getImageData(0, 0, c.width, c.height);
  for (var i = 0, data = pixels.data; i < data.length; i += 4) {
    r = data[i];
    g = data[i + 1];
    b = data[i + 2];
    a = data[i + 3]; // alpha
    // skip pixels >50% transparent
    if (a < 255 / 2) continue;
    col = rgbToHex(r, g, b);
    if (!colors[col]) colors[col] = 0;
    colors[col]++;
  }

  // Find the colour with the largest value
  const colorArr = Object.values(colors);
  const maxValue = Math.max(...colorArr);
  return Object.keys(colors).find((key) => colors[key] === maxValue);
}
