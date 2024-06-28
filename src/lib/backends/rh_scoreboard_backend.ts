import { Fetcher, ReliableWebSocket } from '$lib/api';
import {
	type ClockInterface,
	type GameInterface,
	type TeamScoreInterface
} from '$lib/types';

export interface ClockJSON {
	last_state_change: number;
	last_time_remaining: number;
	state: 'Running' | 'Stopped';
}

export interface GameJSON {
	home_score: number;
	away_score: number;

	home_tf: number;
	away_tf: number;

	home_team_timeout?: boolean;
	away_team_timeout?: boolean;

	home_team_foul_warning?: boolean;
	away_team_foul_warning?: boolean;

	game_clock: ClockJSON;
	shot_clock: ClockJSON;

	siren: boolean;
}

export class BackendAPI extends Fetcher {
	post(
		path: string,
		params?: Record<string, string>,
		options?: RequestInit,
		timeout?: number | undefined
	): Promise<Response> {
		params = {
			ts: `${Date.now()}`,
			uuid: crypto.randomUUID(),
			...(params || {})
		};
		return super.post(path, params, options, timeout);
	}
}

export class Clock implements ClockInterface {
	last_state_change: number;
	last_time_remaining: number;
	state: 'Running' | 'Stopped';
	api: BackendAPI;
	name: 'gameclock' | 'shotclock';

	constructor(api: BackendAPI, name: 'gameclock' | 'shotclock') {
		this.last_state_change = 0;
		this.last_time_remaining = 0;
		this.state = 'Stopped';
		this.api = api;
		this.name = name;
	}

	fromData(data: ClockJSON) {
		this.last_state_change = data?.last_state_change || this.last_state_change;
		this.last_time_remaining = data?.last_time_remaining || this.last_time_remaining;
		this.state = data?.state || this.state;
	}

	start() {
		this.api.post(`clock/${this.name}/start`);
	}
	stop() {
		this.api.post(`clock/${this.name}/stop`);
	}
	set(value: number) {
		this.api.post(`clock/${this.name}/set`, { value: `${value}` });
	}
	adjust(value: number) {
		this.api.post(`clock/${this.name}/set`, { value: `${this.last_time_remaining + value}` });
	}
}

export class TeamScore implements TeamScoreInterface {
	score: number;
	team_fouls: number;
	timeout_requested: boolean;
	fouls_accumulated: boolean;
	api: BackendAPI;
	team: 'home' | 'away';

	constructor(api: BackendAPI, team: 'home' | 'away') {
		this.score = 0;
		this.team_fouls = 0;
		this.timeout_requested = false;
		this.fouls_accumulated = false;
		this.api = api;
		this.team = team;
	}

	scoreIncrement = () => {
		this.api.post(`counter/${this.team}/score/increment`);
	};
	scoreDecrement = () => {
		this.api.post(`counter/${this.team}/score/decrement`);
	};
	foulsIncrement = () => {
		this.api.post(`counter/${this.team}/teamfouls/increment`);
	};
	foulsDecrement = () => {
		this.api.post(`counter/${this.team}/teamfouls/decrement`);
	};
	toggleTimeout = () => {
		this.api.post('timeout/toggle');
	};
	toggleFouls = () => {
		this.api.post('fouls/toggle');
	};
}

export class Game implements GameInterface {
	home: TeamScore;
	away: TeamScore;
	game_clock: Clock;
	shot_clock: Clock;
	ws: ReliableWebSocket<string>;
	api: BackendAPI;

	constructor(url: string) {
		this.api = new BackendAPI(url);
		this.home = new TeamScore(this.api, 'home');
		this.away = new TeamScore(this.api, 'away');
		this.game_clock = new Clock(this.api, 'gameclock');
		this.shot_clock = new Clock(this.api, 'shotclock');
		const wsUrl = url.replace(/^http/, 'ws');
		console.table({ wsUrl });
		this.ws = new ReliableWebSocket(wsUrl + 'data_stream');
		this.ws.onmessage = this.onmessage;
		this.ws.open();
	}

	onmessage = (ev: MessageEvent<string>) => {
		const data: GameJSON = JSON.parse(ev.data);

		this.home.score = data.home_score;
		this.away.score = data.away_score;

		this.home.team_fouls = data.home_tf;
		this.away.team_fouls = data.away_tf;

		this.home.timeout_requested = data.home_team_timeout || false;
		this.away.timeout_requested = data.away_team_timeout || false;

		this.home.fouls_accumulated = data.home_team_foul_warning || false;
		this.away.fouls_accumulated = data.away_team_foul_warning || false;

		this.game_clock.fromData(data.game_clock);
		this.shot_clock.fromData(data.shot_clock);

		console.table(this);
	};
}
