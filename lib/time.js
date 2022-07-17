export function prettifyMs(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const hours = Math.floor(ms / 1000 / 60 / 60);

  // format
  const formatted = [];
  [hours, minutes, seconds].forEach((t) => {
    if (t < 1) formatted.push(`00`);
    else if (t < 10 && t > 0) formatted.push(`0${t}`);
    else formatted.push(t);
  });

  return `${formatted[0]} : ${formatted[1]} : ${formatted[2]}`;
}
