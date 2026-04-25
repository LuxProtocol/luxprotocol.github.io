const sponsors = [
  {
    name: "MSU Bagley College of Engineering",
    svg: `<img src="./assets/logos/MSU-BCE-white.svg" height="96" style="display:block;">`,
    url: "https://www.bagley.msstate.edu/" 
  },
  {
    name: "MSU Department of Electrical and Computer Engineering",
    svg: `<img src="./assets/logos/MSU-ECE-white.svg" height="96" style="display:block;">`,
    url: "https://www.ece.msstate.edu/"
  },
  {
    name: "Microsoft",
    svg: `<img src="./assets/logos/Microsoft-black.svg" height="96" style="display:block;">`,
    url: "https://www.microsoft.com/en-us"
  }, 
];

function makeCard(s) {
  return `<div class="sponsor-card" title="${s.name}">
	<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.svg}</a>
	</div>`;
}

const track = document.getElementById("track");
const html = sponsors.map(makeCard).join("");
track.innerHTML = html + html;
