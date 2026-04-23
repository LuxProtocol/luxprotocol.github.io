const sponsors = [
  {
    name: "MSU Bagley College of Engineering",
    svg: `<img src="./assets/logos/MSU-BCE-white.svg" height="128" style="display:block;">` 
  },
  {
    name: "MSU Department of Electrical and Computer Engineering",
    svg: `<img src="./assets/logos/MSU-ECE-white.svg" height="128" style="display:block;">` 
  },
  {
    name: "Microsoft",
    svg: `<img src="./assets/logos/Microsoft-black.svg" height="128" style="display:block;">` 
  }, 
];

function makeCard(s) {
  return `<div class="sponsor-card" title="${s.name}">${s.svg}</div>`;
}

const track = document.getElementById("track");
const html = sponsors.map(makeCard).join("");
track.innerHTML = html + html;
