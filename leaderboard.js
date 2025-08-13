document.addEventListener("DOMContentLoaded", () => {
  fetchLeaderboard();
});

function fetchLeaderboard() {
  fetch("http://localhost:5000/api/leaderboard") // Backend endpoint
    .then(res => res.json())
    .then(data => {
      const tableBody = document.querySelector("#leaderboardTable tbody");
      tableBody.innerHTML = "";

      data.forEach((player, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${player.name}</td>
          <td>${player.email}</td>
          <td>${player.score}</td>
        `;

        tableBody.appendChild(row);
      });
    })
    .catch(err => {
      console.error("Error fetching leaderboard:", err);
    });
}
