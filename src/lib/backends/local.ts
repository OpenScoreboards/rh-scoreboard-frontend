import type { ClockInterface, GameInterface, TeamInterface, connectionStateType } from '$lib/types';
import { writable, type Invalidator, type Subscriber, type Writable } from 'svelte/store';

class Team implements TeamInterface {
	label: string;
	score: number;
	team_fouls: number;
	timeout_requested: boolean;
	foul_warning: boolean;
	store: Writable<TeamInterface>;

	constructor(label: string) {
		this.label = label;
		this.score = 0;
		this.team_fouls = 0;
		this.timeout_requested = false;
		this.foul_warning = false;
		this.store = writable(this);
	}

	subscribe = (
		run: Subscriber<TeamInterface>,
		invalidate?: Invalidator<TeamInterface> | undefined
	) => {
		return this.store.subscribe(run, invalidate);
	};

	scoreIncrement = () => {
		this.score++;
		this.store.set(this);
	};
	scoreDecrement = () => {
		this.score--;
		this.store.set(this);
	};
	foulsIncrement = () => {
		this.team_fouls++;
		this.store.set(this);
	};
	foulsDecrement = () => {
		this.team_fouls--;
		this.store.set(this);
	};
	labelSet = (label: string) => {
		this.label = label;
		this.store.set(this);
	};
	toggleTimeout = () => {
		this.timeout_requested = !this.timeout_requested;
		this.store.set(this);
	};
	toggleFouls = () => {
		this.foul_warning = !this.foul_warning;
		this.store.set(this);
	};
}

class Clock implements ClockInterface {
	last_state_change: number;
	last_time_remaining: number;
	state: 'Running' | 'Stopped';
	store: Writable<ClockInterface>;

	constructor() {
		this.last_state_change = Date.now();
		this.last_time_remaining = 0;
		this.state = 'Stopped';
		this.store = writable(this);
	}

	subscribe = (
		run: Subscriber<ClockInterface>,
		invalidate?: Invalidator<ClockInterface> | undefined
	) => {
		return this.store.subscribe(run, invalidate);
	};

	start = (value?: number) => {
		if (this.state == 'Running') return;
		this.last_state_change = Date.now();
		if (typeof value !== 'undefined') this.last_time_remaining = value;
		this.state = 'Running';
		this.store.set(this);
	};
	stop = () => {
		if (this.state == 'Stopped') return;
		const now = Date.now();
		this.last_time_remaining = Math.min(0, this.last_time_remaining - now + this.last_state_change);
		this.last_state_change = now;
		this.state = 'Stopped';
		this.store.set(this);
	};
	set = (value: number) => {
		this.last_time_remaining = value;
		this.store.set(this);
	};
	adjust = (value: number) => {
		this.last_time_remaining += value;
		this.store.set(this);
	};
}

export class Game implements GameInterface {
	home: Team;
	away: Team;
	game_clock: Clock;
	shot_clock: Clock;
	stoppage_clock: Clock;
	siren: boolean;
	period: number;
	match_title: string;
	connection_state: connectionStateType;
	siren_timer: ReturnType<typeof setTimeout> | null;
	store: Writable<GameInterface>;

	constructor() {
		this.home = new Team('Home');
		this.away = new Team('Away');
		this.game_clock = new Clock();
		this.shot_clock = new Clock();
		this.stoppage_clock = new Clock();
		this.siren = false;
		this.siren_timer = null;
		this.period = 1;
		this.match_title = '';
		this.connection_state = 'idle';
		this.store = writable(this);
	}

	subscribe = (
		run: Subscriber<GameInterface>,
		invalidate?: Invalidator<GameInterface> | undefined
	) => {
		return this.store.subscribe(run, invalidate);
	};

	toggleSiren = () => {
		this.siren = !this.siren;
		this.store.set(this);
		if (this.siren_timer !== null) clearTimeout(this.siren_timer);
		if (this.siren)
			this.siren_timer = setTimeout(() => {
				if (this.siren) {
					this.toggleSiren();
				}
			}, 1000);
	};

	periodIncrement = () => {
		this.period++;
		this.store.set(this);
	};

	periodDecrement = () => {
		this.period = Math.min(0, this.period - 1);
		this.store.set(this);
	};

	setMatchTitle = (value: string) => {
		this.match_title = value;
		this.store.set(this);
	};
}
