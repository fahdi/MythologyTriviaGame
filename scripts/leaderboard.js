
let leaderboardData = [];
let list = document.querySelector('#leaderboard-list');


async function getLeaderboard() {
    try {

        const response = await fetch('http://localhost:5000/leaderboard')
        const data = await response.json();
        leaderboardData = data;
        rederData();
    } catch (error) {
        console.error(error);
        list.innerHTML = '<li style="color:tomato; font-size:.9rem;">Something went wrong. Check your Network! </li>';
    }
}

function rederData() {

    if (leaderboardData.length === 0 || !leaderboardData) {
        list.innerHTML = '<li>No data</li>';
        return;
    }

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