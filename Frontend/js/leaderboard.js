function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}

const leaderboardBody = document.querySelector("#leaderboard tbody");

function updateLeaderboard(snapshot) {
  const users = snapshot.val();
  const playerList = [];

  for (const id in users) {
    const player = users[id];
    if (player.name) {
      playerList.push({
        name: player.name,
        gameID: id, // userID
        score: player.score || 0
      });
    }
  }

  playerList.sort((a, b) => b.score - a.score);

  leaderboardBody.innerHTML = "";

  playerList.forEach((player, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${player.name}</td>
      <td>${player.gameID}</td>
      <td>${player.score}</td>
    `;
    leaderboardBody.appendChild(row);
  });
}

const usersRef = database.ref("users");
usersRef.on("value", updateLeaderboard);
