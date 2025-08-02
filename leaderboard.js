const fullLeaderboardList = document.getElementById("full-leaderboard-list");

function loadFullLeaderboard() {
  fullLeaderboardList.innerHTML = "<li>Loading...</li>";

  database.ref("leaderboard")
    .orderByChild("score")
    .once("value", snapshot => {
      const data = [];
      snapshot.forEach(child => data.push(child.val()));
      data.reverse(); // High scores first

      if (data.length === 0) {
        fullLeaderboardList.innerHTML = "<li>No entries yet.</li>";
        return;
      }

      fullLeaderboardList.innerHTML = data.map((player, i) => `
        <li>
          <strong>#${i + 1}</strong> 
          ${player.name} — ${player.score} 
          <small>${player.email ? `(${player.email})` : ""}</small>
        </li>
      `).join("");
    });
}

window.onload = loadFullLeaderboard;
