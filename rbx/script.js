document.addEventListener("DOMContentLoaded", () => {
	// --- Element References ---
	const userSearchForm = document.getElementById("user-search-form");
	const usernameInput = document.getElementById("username-input");
	const userResultDiv = document.getElementById("user-result");

	const gameSearchForm = document.getElementById("game-search-form");
	const gameInput = document.getElementById("game-input");
	const gameResultDiv = document.getElementById("game-result");

	// --- API Configuration ---
	// Using a CORS proxy to bypass browser restrictions.
	// In a real application, you'd build your own backend for this.
	const PROXY_URL = "https://www.roproxy.com";
	const ROBLOX_API = {
		users: "https://users.roblox.com/v1",
		games: "https://games.roblox.com/v1",
		thumbnails: "https://thumbnails.roblox.com/v1",
		develop: "https://develop.roblox.com/v1",
	};

	// --- Helper Functions ---
	const showLoader = (element) => {
		element.innerHTML = `<p class="loader">Loading...</p>`;
	};

	const showError = (element, message) => {
		element.innerHTML = `<p class="error">${message}</p>`;
	};

	const formatNumber = (num) => {
		return num.toLocaleString("en-US");
	};

	// --- User Search Logic ---
	userSearchForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		const username = usernameInput.value.trim();
		if (!username) return;

		showLoader(userResultDiv);

		try {
			// 1. Get User ID from Username
			const userSearchResponse = await fetch(
				`${PROXY_URL}${ROBLOX_API.users}/usernames/users`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ usernames: [username] }),
				},
			);
			if (!userSearchResponse.ok) throw new Error("User search failed.");
			const userData = await userSearchResponse.json();
			if (!userData.data || userData.data.length === 0) {
				throw new Error(`User "${username}" not found.`);
			}
			const userId = userData.data[0].id;

			// 2. Get User Details (including ban status)
			const userDetailsResponse = await fetch(
				`${PROXY_URL}${ROBLOX_API.users}/users/${userId}`,
			);
			if (!userDetailsResponse.ok) throw new Error("Could not fetch user details.");
			const userDetails = await userDetailsResponse.json();

			// 3. Get User Avatar
			const avatarResponse = await fetch(
				`${PROXY_URL}${ROBLOX_API.thumbnails}/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`,
			);
			if (!avatarResponse.ok) throw new Error("Could not fetch user avatar.");
			const avatarData = await avatarResponse.json();
			const avatarUrl = avatarData.data[0].imageUrl;

			// 4. Display Results
			displayUserResult(userDetails, avatarUrl);
		} catch (error) {
			showError(userResultDiv, error.message);
		}
	});

	const displayUserResult = (details, avatarUrl) => {
		const joinDate = new Date(details.created).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});

		// Conditionally add the terminated banner
		const terminatedBanner = details.isBanned
			? `<div class="terminated-banner">ACCOUNT TERMINATED</div>`
			: "";

		userResultDiv.innerHTML = `
            <div class="profile-card">
                <div class="profile-avatar">
                    <img src="${avatarUrl}" alt="${details.displayName}'s Avatar">
                </div>
                <div class="profile-info">
                    ${terminatedBanner}
                    <h3>${details.displayName}</h3>
                    <p>@${details.name}</p>
                    <p><strong>User ID:</strong> ${details.id}</p>
                    <p><strong>Joined:</strong> ${joinDate}</p>
                </div>
            </div>
        `;
	};

	// --- Game Search Logic ---
	gameSearchForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		const input = gameInput.value.trim();
		if (!input) return;

		showLoader(gameResultDiv);

		try {
			// 1. Extract Game/Place ID from input (URL or just ID)
			let placeId = null;
			const urlMatch = input.match(/roblox\.com\/games\/(\d+)/);
			if (urlMatch) {
				placeId = urlMatch[1];
			} else if (/^\d+$/.test(input)) {
				placeId = input;
			} else {
				throw new Error("Invalid input. Please provide a Game ID or a full URL.");
			}

			// 2. Get Universe ID from Place ID
			const universeResponse = await fetch(
				`${PROXY_URL}${ROBLOX_API.develop}/places/${placeId}`,
			);
			if (!universeResponse.ok) throw new Error("Could not find a game with that ID.");
			const placeDetails = await universeResponse.json();
			const universeId = placeDetails.universeId;

			// 3. Get Game Details using Universe ID
			const gameDetailsResponse = await fetch(
				`${PROXY_URL}${ROBLOX_API.games}/games?universeIds=${universeId}`,
			);
			if (!gameDetailsResponse.ok) throw new Error("Could not fetch game details.");
			const gameData = await gameDetailsResponse.json();
			const gameDetails = gameData.data[0];

			// 4. Get Game Thumbnail
			const thumbnailResponse = await fetch(
				`${PROXY_URL}${ROBLOX_API.thumbnails}/games/icons?universeIds=${universeId}&size=150x150&format=Png&isCircular=false`,
			);
			if (!thumbnailResponse.ok) throw new Error("Could not fetch game thumbnail.");
			const thumbnailData = await thumbnailResponse.json();
			const thumbnailUrl = thumbnailData.data[0].imageUrl;

			// 5. Display Results
			displayGameResult(gameDetails, thumbnailUrl);
		} catch (error) {
			showError(gameResultDiv, error.message);
		}
	});

	const displayGameResult = (details, thumbnailUrl) => {
		gameResultDiv.innerHTML = `
            <div class="game-card">
                <div class="game-thumbnail">
                    <img src="${thumbnailUrl}" alt="${details.name}'s Thumbnail">
                </div>
                <div class="game-info">
                    <h3>${details.name}</h3>
                    <p>by ${details.creator.name}</p>
                    <p><strong>Active Users:</strong> ${formatNumber(details.playing)}</p>
                    <p><strong>Total Visits:</strong> ${formatNumber(details.visits)}</p>
                </div>
            </div>
        `;
	};
});
