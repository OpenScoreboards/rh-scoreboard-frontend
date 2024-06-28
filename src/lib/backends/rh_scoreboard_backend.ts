import { Fetcher, ReliableWebSocket } from '$lib/api';
import {
	type ClockInterface,
	type GameInterface,
	type TeamInterface,
	type connectionStateType
} from '$lib/types';
import { writable, type Invalidator, type Subscriber, type Writable } from 'svelte/store';

export interface ClockJSON {
	last_state_change: number;
	last_time_remaining: number;
	state: 'Running' | 'Stopped';
}

export interface GameJSON {
	label: string;

	home: string;
	away: string;

	home_score: number;
	away_score: number;

	home_tf: number;
	away_tf: number;

	home_team_timeout: boolean;
	away_team_timeout: boolean;

	home_team_foul_warning: boolean;
	away_team_foul_warning: boolean;

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
	store: Writable<ClockInterface>;

	constructor(api: BackendAPI, name: 'gameclock' | 'shotclock') {
		this.last_state_change = 0;
		this.last_time_remaining = 0;
		this.state = 'Stopped';
		this.api = api;
		this.name = name;
		this.store = writable(this);
	}

	subscribe = (
		run: Subscriber<ClockInterface>,
		invalidate?: Invalidator<ClockInterface> | undefined
	) => {
		return this.store.subscribe(run, invalidate);
	};

	fromData(data: ClockJSON) {
		this.last_state_change = data.last_state_change;
		this.last_time_remaining = data.last_time_remaining;
		this.state = data.state;
		this.store.set(this);
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

export class Team implements TeamInterface {
	label: string;
	score: number;
	team_fouls: number;
	timeout_requested: boolean;
	foul_warning: boolean;
	api: BackendAPI;
	team: 'home' | 'away';
	store: Writable<TeamInterface>;

	constructor(api: BackendAPI, team: 'home' | 'away') {
		this.label = team == 'home' ? 'Home' : 'Away';
		this.score = 0;
		this.team_fouls = 0;
		this.timeout_requested = false;
		this.foul_warning = false;
		this.api = api;
		this.team = team;
		this.store = writable(this);
	}

	subscribe = (
		run: Subscriber<TeamInterface>,
		invalidate?: Invalidator<TeamInterface> | undefined
	) => {
		return this.store.subscribe(run, invalidate);
	};

	labelSet = (label: string) => {
		this.api.post(`label/${this.team}/set`, { value: label });
	};
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
		this.api.post(
			`toggle/${this.team}/timeoutwarning/${this.timeout_requested ? 'deactivate' : 'activate'}`
		);
	};
	toggleFouls = () => {
		this.api.post(
			`toggle/${this.team}/teamfoulwarning/${this.foul_warning ? 'deactivate' : 'activate'}`
		);
	};
}

export class Game implements GameInterface {
	home: Team;
	away: Team;
	game_clock: Clock;
	shot_clock: Clock;
	siren: boolean;
	connection_state: connectionStateType;
	ws: ReliableWebSocket<string>;
	api: BackendAPI;
	store: Writable<GameInterface>;

	constructor(url: string) {
		this.api = new BackendAPI(url);
		this.home = new Team(this.api, 'home');
		this.away = new Team(this.api, 'away');
		this.game_clock = new Clock(this.api, 'gameclock');
		this.shot_clock = new Clock(this.api, 'shotclock');
		this.siren = false;
		this.connection_state = 'idle';
		this.store = writable(this);
		const wsUrl = url.replace(/^http/, 'ws');
		this.ws = new ReliableWebSocket(wsUrl + 'data_stream');
		this.ws.onmessage = this.onmessage;
		this.ws.onerror = this.onerror;
		this.ws.open();
		this.ws.subscribe((value) => {
			this.connection_state = value;
			this.store.set(this);
		});
	}

	subscribe = (
		run: Subscriber<GameInterface>,
		invalidate?: Invalidator<GameInterface> | undefined
	) => {
		return this.store.subscribe(run, invalidate);
	};

	toggleSiren = () => {
		this.api.post('toggle/siren/activate')
	};

	onerror = (ev: Event) => {
		this.connection_state = 'warn';
		this.store.set(this);
		console.warn(ev.type);
	};

	onmessage = (ev: MessageEvent<string>) => {
		const data: GameJSON = JSON.parse(ev.data);
		// console.table(data);

		this.home.label = data.home;
		this.away.label = data.away;

		this.home.score = data.home_score;
		this.away.score = data.away_score;

		this.home.team_fouls = data.home_tf;
		this.away.team_fouls = data.away_tf;

		this.home.timeout_requested = data.home_team_timeout;
		this.away.timeout_requested = data.away_team_timeout;

		this.home.foul_warning = data.home_team_foul_warning;
		this.away.foul_warning = data.away_team_foul_warning;

		this.game_clock.fromData(data.game_clock);
		this.shot_clock.fromData(data.shot_clock);

		this.siren = data.siren;

		this.connection_state = 'good';
		this.store.set(this);
	};
}
