import type { Readable } from 'svelte/store';

export type connectionStateType = 'idle' | 'good' | 'warn' | 'fail';

export const secondMs = 1000;
export const minuteMs = 60000;

export interface Config {
	readonly: boolean;
	mute: boolean;
	borders: boolean;
	cursor: boolean;
}

export interface ClockInterface extends Readable<ClockInterface> {
	last_state_change: number;
	last_time_remaining: number;
	state: 'Running' | 'Stopped';

	start: (value?: number) => void;
	stop: (value?: number) => void;
	set: (value: number) => void;
	adjust: (value: number) => void;
}

export interface TeamInterface extends Readable<TeamInterface> {
	label: string;
	score: number;
	team_fouls: number;
	timeout_requested: boolean;
	foul_warning: boolean;

	labelSet: (label: string) => void;

	scoreSet: (value: number) => void;
	scoreIncrement: () => void;
	scoreDecrement: () => void;

	foulsSet: (value: number) => void;
	foulsIncrement: () => void;
	foulsDecrement: () => void;

	toggleTimeout: () => void;
	toggleFouls: () => void;
}

export interface GameInterface extends Readable<GameInterface> {
	home: TeamInterface;
	away: TeamInterface;
	game_clock: ClockInterface;
	shot_clock: ClockInterface;
	stoppage_clock: ClockInterface;
	siren: boolean;
	period: number;
	match_title: string;
	connection_state: connectionStateType;

	reset: () => void;
	toggleSiren: () => void;
	periodIncrement: () => void;
	periodDecrement: () => void;
	setMatchTitle: (value: string) => void;
}
