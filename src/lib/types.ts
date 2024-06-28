export type connectionStateType = 'idle' | 'good' | 'warn' | 'fail';

export const secondMs = 1000;
export const minuteMs = 60000;

export interface ClockInterface {
	last_state_change: number;
	last_time_remaining: number;
	state: 'Running' | 'Stopped';

	start: () => void;
	stop: () => void;
	set: (value: number) => void;
	adjust: (value: number) => void;
}

export interface TeamScoreInterface {
	score: number;
	team_fouls: number;
	timeout_requested: boolean;
	fouls_accumulated: boolean;

	scoreIncrement: () => void;
	scoreDecrement: () => void;

	foulsIncrement: () => void;
	foulsDecrement: () => void;

	toggleTimeout: () => void;
	toggleFouls: () => void;
}

export interface GameInterface {
	home: TeamScoreInterface;
	away: TeamScoreInterface;
	game_clock: ClockInterface;
	shot_clock: ClockInterface;
}
