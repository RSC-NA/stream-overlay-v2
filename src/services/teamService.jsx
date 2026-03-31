import { callApi, callStats } from "@/services/apiService";

// Set to true to pull stats from Google Sheets, false to use the devleague API
const USE_SHEETS = true;

// --- Sheet IDs ---
// To update a gid: open the Google Sheet, click the tab, copy the gid from the URL (?gid=XXXXXXX)

// `S## RSC Stats Totals` sheet for team and player total stats
const STAT_TOTALS_ID    = "1Df8tmEbUC4gGzBQ6SD8DLf-0OzU7blaXZtUDeSF_jKk";
const TEAM_TOTALS_GID   = "669024021";   // "Team Totals" tab
const PLAYER_TOTALS_GID = "855518274"; // "Player Totals" tab

// `S## RSC 3s Contracts` sheet for player-team mapping
const CONTRACTS_ID  = "1bqmviA6pfWXuM3S5huG7KNwsv9ENvelW9Im4q_4AMRM";
const CONTRACTS_GID = "558155493";

// `S## RSC Team Standings - BACKEND` sheet for calculating wins/losses to avoid forfeit issues in the Stat Totals sheet
const STANDINGS_ID  = "124c4bx8PDYAFc3y9sIwFWZTi8JKZMDK9SEv-pVflhI4";
const STANDINGS_GID = "1020340468"; // All tiers, Column C = team, H = wins, I = losses

const TEAM_TOTALS_URL   = `https://docs.google.com/spreadsheets/d/${STAT_TOTALS_ID}/export?format=csv&gid=${TEAM_TOTALS_GID}`;
const PLAYER_TOTALS_URL = `https://docs.google.com/spreadsheets/d/${STAT_TOTALS_ID}/export?format=csv&gid=${PLAYER_TOTALS_GID}`;
const CONTRACTS_URL     = `https://docs.google.com/spreadsheets/d/${CONTRACTS_ID}/export?format=csv&gid=${CONTRACTS_GID}`;
const STANDINGS_URL     = `https://docs.google.com/spreadsheets/d/${STANDINGS_ID}/export?format=csv&gid=${STANDINGS_GID}`;

// --- CSV Parser ---
// Handles RFC 4180 quoted fields (fields containing commas, newlines, or quotes).
// A naive split(",") breaks on rows where a cell contains a comma (e.g. "Team A, Team B" in the Team(s) column).
const parseCSV = (text) => {
	const rows = [];
	let row = [];
	let field = "";
	let inQuotes = false;

	for (let i = 0; i < text.length; i++) {
		const ch   = text[i];
		const next = text[i + 1];

		if (ch === '"') {
			if (inQuotes && next === '"') { field += '"'; i++; } // escaped quote inside a quoted field
			else inQuotes = !inQuotes;
		} else if (ch === "," && !inQuotes) {
			row.push(field.trim()); field = "";
		} else if (ch === "\r" && next === "\n" && !inQuotes) {
			row.push(field.trim()); field = ""; rows.push(row); row = []; i++;
		} else if ((ch === "\n" || ch === "\r") && !inQuotes) {
			row.push(field.trim()); field = ""; rows.push(row); row = [];
		} else {
			field += ch;
		}
	}

	if (field || row.length) { row.push(field.trim()); rows.push(row); }
	return rows;
};

// --- Client-side Google Sheets fetch (production) ---
// In dev, the Vite server middleware (sheetsPlugin.js) handles /api/sheets/... requests server-side,
// avoiding any potential CSP/CORS issues during local development.
// In production (static build at overlay.rscna.com), there is no Node.js server — the Vite plugin
// does not exist. Instead, the browser fetches Google Sheets CSV directly. Google's public sheet
// export URLs include Access-Control-Allow-Origin: * so this works from any browser without a proxy.

const fetchTeamStatsDirect = async (tier) => {
	// Fetch Team Totals (goals, assists, saves, shots) and Standings (wins/losses) in parallel.
	// Wins/losses come from the Standings sheet to avoid forfeit-inflated numbers in Stat Totals.
	const [totalsText, standingsText] = await Promise.all([
		fetch(TEAM_TOTALS_URL).then(r => r.text()),
		fetch(STANDINGS_URL).then(r => r.text()),
	]);

	// Build wins/losses lookup from standings sheet (team name → { wins, loss })
	// Column C = team name, H = wins, I = losses
	const standingsMap = {};
	parseCSV(standingsText).slice(1).forEach(row => {
		const teamName = row[2]?.trim(); // C
		if (teamName) standingsMap[teamName.toLowerCase()] = {
			wins: Number(row[7]) || 0,  // H
			loss: Number(row[8]) || 0,  // I
		};
	});

	// Filter Team Totals to the requested tier and map to the expected shape
	// Column A = tier, B = team name, F = goals, G = assists, H = saves, I = shots, O = opp goals
	return parseCSV(totalsText).slice(1)
		.filter(row => row[1]?.trim() !== "" && row[0]?.trim().toLowerCase() === tier.toLowerCase())
		.map(row => {
			const goals    = Number(row[5]) || 0;  // F
			const shots    = Number(row[8]) || 0;  // I
			const teamName = row[1]?.trim();        // B
			const standing = standingsMap[teamName.toLowerCase()] ?? { wins: 0, loss: 0 };
			return {
				teamName,
				wins:     standing.wins,
				loss:     standing.loss,
				goals,
				shots,
				shotPct:  shots > 0 ? parseFloat(((goals / shots) * 100).toFixed(2)) : 0,
				assists:  Number(row[6]) || 0,   // G
				oppGoals: Number(row[14]) || 0,  // O
				saves:    Number(row[7]) || 0,   // H
			};
		});
};

const fetchPlayerStatsDirect = async (team) => {
	// Fetch Contracts (roster + RSC IDs) and Player Totals (stats) in parallel.
	// Joined on RSC ID (Column B in Player Totals, Column A in Contracts).
	const [contractsText, statsText] = await Promise.all([
		fetch(CONTRACTS_URL).then(r => r.text()),
		fetch(PLAYER_TOTALS_URL).then(r => r.text()),
	]);

	// Build RSC ID -> player name map for rostered players and Free Agents/PFA.
	// Free Agent and Permanent Free Agent are included to account for subs who play
	// under the team's name but retain their original contract status.
	// Column A = RSC ID, B = player name, D = team name, G = contract status
	const rosterMap = {};
	parseCSV(contractsText).slice(1).forEach(row => {
		const rscId          = row[0]?.trim(); // A
		const playerName     = row[1]?.trim(); // B
		const teamName       = row[3]?.trim(); // D
		const contractStatus = row[6]?.trim(); // G
		if (rscId && teamName.toLowerCase() === team.toLowerCase() &&
			["Rostered", "Free Agent", "Permanent Free Agent"].includes(contractStatus)) {
			rosterMap[rscId] = playerName;
		}
	});

	// Index player stats rows by RSC ID for O(1) lookup when building the roster below
	// Column B = RSC ID
	const statsIndex = {};
	parseCSV(statsText).slice(1).forEach(row => {
		const rscId = row[1]?.trim(); // B
		if (rscId) statsIndex[rscId] = row;
	});

	// Build player list from the roster, defaulting to 0 if no stats row is found.
	// Iterating the roster (not the stats) ensures players with 0 games still appear.
	// Column D = GP, J = goals, K = assists, L = saves, M = shots, U = demos inflicted
	return Object.entries(rosterMap).map(([rscId, playerName]) => {
		const row   = statsIndex[rscId];
		const goals = Number(row?.[9])  || 0;  // J
		const shots = Number(row?.[12]) || 0;  // M
		return {
			playerName,
			gp:      Number(row?.[3])  || 0,   // D
			goals,
			shots,
			shotPct: shots > 0 ? parseFloat(((goals / shots) * 100).toFixed(2)) : 0,
			assists: Number(row?.[10]) || 0,   // K
			saves:   Number(row?.[11]) || 0,   // L
			demos:   Number(row?.[20]) || 0,   // U
		};
	});
};

export const getTeamListByTier = async (league, tier, season) =>

	new Promise((resolve, reject) => {

		callApi(
			"get",
			`teams/`,
			{
				league,
				tier,
				season,
			}
		)
			.then((response) =>
				resolve(response.data))

			.catch((error) =>
				reject(error));

	});

export const getTeamPlayerStats = async (team) => {
	if (USE_SHEETS) {
		if (import.meta.env.DEV) {
			// Dev: Vite's dev server causes outbound fetches to send Origin: null, which Google's
			// redirect chain rejects. Route through the sheetsPlugin.js middleware instead,
			// which fetches server-side (no CORS restrictions).
			const response = await fetch(`/api/sheets/players/${encodeURIComponent(team)}`);
			return response.json();
		}
		// Production: fetch Google Sheets CSV directly from the browser.
		// The static host does not modify outbound requests, so CORS succeeds normally.
		return fetchPlayerStatsDirect(team);
	}
	// Fallback: devleague API (requires manual sync, may be stale)
	return new Promise((resolve, reject) => {
		callStats("get", `players/${team}`, {})
			.then((response) => resolve(response.data))
			.catch((error) => reject(error));
	});
};

export const getTeamStatsByTier = async (tier) => {
	if (USE_SHEETS) {
		if (import.meta.env.DEV) {
			// Dev: Vite's dev server causes outbound fetches to send Origin: null, which Google's
			// redirect chain rejects. Route through the sheetsPlugin.js middleware instead,
			// which fetches server-side (no CORS restrictions).
			const response = await fetch(`/api/sheets/teams/${encodeURIComponent(tier)}`);
			return response.json();
		}
		// Production: fetch Google Sheets CSV directly from the browser.
		// The static host does not modify outbound requests, so CORS succeeds normally.
		return fetchTeamStatsDirect(tier);
	}
	// Fallback: devleague API (requires manual sync, may be stale)
	return new Promise((resolve, reject) => {
		callStats("get", `teams/${tier}`, {})
			.then((response) => resolve(response.data))
			.catch((error) => reject(error));
	});
};
