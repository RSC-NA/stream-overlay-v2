// --- Sheet IDs ---
// To update a gid: open the Google Sheet, click the tab, copy the gid from the URL (?gid=XXXXXXX)

const STAT_TOTALS_ID   = "1Df8tmEbUC4gGzBQ6SD8DLf-0OzU7blaXZtUDeSF_jKk";
const TEAM_TOTALS_GID  = "669024021";   // "Team Totals" tab
const PLAYER_TOTALS_GID = "1005539084"; // "Player Totals" tab

const CONTRACTS_ID  = "1bqmviA6pfWXuM3S5huG7KNwsv9ENvelW9Im4q_4AMRM";
const CONTRACTS_GID = "558155493";

const TEAM_TOTALS_URL   = `https://docs.google.com/spreadsheets/d/${STAT_TOTALS_ID}/export?format=csv&gid=${TEAM_TOTALS_GID}`;
const PLAYER_TOTALS_URL = `https://docs.google.com/spreadsheets/d/${STAT_TOTALS_ID}/export?format=csv&gid=${PLAYER_TOTALS_GID}`;
const CONTRACTS_URL     = `https://docs.google.com/spreadsheets/d/${CONTRACTS_ID}/export?format=csv&gid=${CONTRACTS_GID}`;

const parseCSV = (text) => {
	const rows = [];
	let row = [];
	let field = "";
	let inQuotes = false;

	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		const next = text[i + 1];

		if (ch === '"') {
			if (inQuotes && next === '"') { field += '"'; i++; } // escaped quote
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

// GET /api/sheets/teams/:tier
const teamsHandler = async (req, res, next) => {
	const tier = decodeURIComponent(req.url.replace(/^\//, "").split("?")[0]);
	if (!tier) { next(); return; }

	try {
		const rows = parseCSV(await (await fetch(TEAM_TOTALS_URL)).text());

		const teams = rows.slice(1)
			.filter(row => row[1]?.trim() !== "" && row[0]?.trim().toLowerCase() === tier.toLowerCase())
			.map(row => {
				const goals = Number(row[5]) || 0;
				const shots = Number(row[8]) || 0;
				return {
					teamName: row[1]?.trim(),
					wins:     Number(row[2]) || 0,
					loss:     Number(row[3]) || 0,
					goals,
					shots,
					shotPct:  shots > 0 ? parseFloat(((goals / shots) * 100).toFixed(2)) : 0,
					assists:  Number(row[6]) || 0,
					oppGoals: Number(row[14]) || 0,
					saves:    Number(row[7]) || 0,
				};
			});

		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(teams));
	} catch (err) {
		console.error("Team stats fetch error:", err);
		res.statusCode = 500;
		res.end(JSON.stringify({ error: err.message }));
	}
};

// GET /api/sheets/players/:teamName
const playersHandler = async (req, res, next) => {
	const team = decodeURIComponent(req.url.replace(/^\//, "").split("?")[0]);
	if (!team) { next(); return; }

	try {
		const [contractsText, statsText] = await Promise.all([
			fetch(CONTRACTS_URL).then(r => r.text()),
			fetch(PLAYER_TOTALS_URL).then(r => r.text()),
		]);

		// Build RSC ID -> player name map for rostered players on this team
		const rosterMap = {};
		parseCSV(contractsText).slice(1).forEach(row => {
			const rscId          = row[0]?.trim();
			const playerName     = row[1]?.trim();
			const teamName       = row[3]?.trim();
			const contractStatus = row[6]?.trim();
			if (rscId && teamName.toLowerCase() === team.toLowerCase() && contractStatus === "Rostered") {
				rosterMap[rscId] = playerName;
			}
		});

		// Index player stats rows by RSC ID
		const statsIndex = {};
		parseCSV(statsText).slice(1).forEach(row => {
			const rscId = row[1]?.trim();
			if (rscId) statsIndex[rscId] = row;
		});

		// Build player list from roster, defaulting to 0 if no stats row found
		const players = Object.entries(rosterMap).map(([rscId, playerName]) => {
			const row   = statsIndex[rscId];
			const goals = Number(row?.[9])  || 0;
			const shots = Number(row?.[12]) || 0;
			return {
				playerName,
				gp:      Number(row?.[3])  || 0,
				goals,
				shots,
				shotPct: shots > 0 ? parseFloat(((goals / shots) * 100).toFixed(2)) : 0,
				assists: Number(row?.[10]) || 0,
				saves:   Number(row?.[11]) || 0,
				demos:   Number(row?.[20]) || 0,
			};
		});

		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(players));
	} catch (err) {
		console.error("Player stats fetch error:", err);
		res.statusCode = 500;
		res.end(JSON.stringify({ error: err.message }));
	}
};

export default function sheetsPlugin() {
	return {
		name: "sheets-proxy",
		configureServer(server) {
			server.middlewares.use("/api/sheets/teams", teamsHandler);
			server.middlewares.use("/api/sheets/players", playersHandler);
		},
		configurePreviewServer(server) {
			server.middlewares.use("/api/sheets/teams", teamsHandler);
			server.middlewares.use("/api/sheets/players", playersHandler);
		},
	};
}
