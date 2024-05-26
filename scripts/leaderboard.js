
let leaderboardData = [];
let list = document.querySelector('#leaderboard-list');


async function getLeaderboard() {
    try {

        const response = await fetch('http://localhost:5000/leaderboard')
        const data = await response.json();
        console.log(data);
        leaderboardData = data;
        rederData();
    } catch (error) {
        console.error(error);
    }
}

function rederData() {
    leaderboardData.forEach((data, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${index + 1}</span>
            <span>${data.name}</span>
            <span>${data.score}</span>
        `;
        list.appendChild(li);
    });
}

getLeaderboard();