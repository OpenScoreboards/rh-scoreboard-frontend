import { Fetcher, ReliableWebSocket } from '$lib/api';
import {
	ClockBase,
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

export class Clock extends ClockBase implements ClockInterface {
	last_state_change: number;
	last_time_remaining: number;
	state: 'Running' | 'Stopped';
	api: Fetcher;

	constructor(url: string) {
		super();
		this.last_state_change = 0;
		this.last_time_remaining = 0;
		this.state = 'Stopped';
		this.api = new Fetcher(url, 10000);
	}

	fromData(data: ClockJSON) {
		this.last_state_change = data?.last_state_change || this.last_state_change;
		this.last_time_remaining = data?.last_time_remaining || this.last_time_remaining;
		this.state = data?.state || this.state;
	}

	start() {
		this.api.post('start');
	}
	stop() {
		this.api.post('stop');
	}
	set(value: number) {
		this.api.post('set', { value: `${value}` });
	}
}

export class TeamScore implements TeamScoreInterface {
	score: number;
	team_fouls: number;
	timeout_requested: boolean;
	fouls_accumulated: boolean;
	api: Fetcher;

	constructor(url: string) {
		this.score = 0;
		this.team_fouls = 0;
		this.timeout_requested = false;
		this.fouls_accumulated = false;
		this.api = new Fetcher(url, 10000);
	}

	scoreIncrement(add: number = 1): void {
		this.api.post('score/increment', { add: `${add}` });
	}
	scoreDecrement(subtract: number = 1): void {
		this.api.post('score/decrement', { subtract: `${subtract}` });
	}
	foulsIncrement(add: number = 1): void {
		this.api.post('fouls/increment', { add: `${add}` });
	}
	foulsDecrement(subtract: number = 1): void {
		this.api.post('fouls/decrement', { subtract: `${subtract}` });
	}
	toggleTimeout(): void {
		this.api.post('timeout/toggle');
	}
	toggleFouls(): void {
		this.api.post('fouls/toggle');
	}
}

export class Game implements GameInterface {
	home: TeamScore;
	away: TeamScore;
	game_clock: Clock;
	shot_clock: Clock;
	ws: ReliableWebSocket<string>;

	constructor(url: string) {
		this.home = new TeamScore(url + 'home/');
		this.away = new TeamScore(url + 'away/');
		this.game_clock = new Clock(url + 'game_clock/');
		this.shot_clock = new Clock(url + 'shot_clock/');
		this.ws = new ReliableWebSocket(url + 'data_stream');
		this.ws.onmessage = this.onmessage;
	}

	onmessage(ev: MessageEvent<string>) {
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
	}
}
