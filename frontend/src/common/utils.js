// https://stackoverflow.com/questions/1322732/convert-seconds-to-hh-mm-ss-with-javascript
// probably a better way but ceebs
const toHHMMSS = (secs) => {
  if (secs < 0) {
    return "N/A";
  }
  var sec_num = parseInt(secs, 10);
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor(sec_num / 60) % 60;
  var seconds = sec_num % 60;

  return [hours, minutes, seconds]
    .map((v) => (v < 10 ? "0" + v : v))
    .filter((v, i) => v !== "00" || i > 0)
    .join(":");
};

export { toHHMMSS };
