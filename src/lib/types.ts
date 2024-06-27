export type connectionStateType = 'idle' | 'good' | 'warn' | 'fail';

export const secondMs = 1000;
export const minuteMs = 60000;

export interface ClockInterface {
    last_state_change: number;
    last_time_remaining: number;
    state: "Running" | "Stopped";
}

export class ClockBase implements ClockInterface {
    last_state_change: number;
    last_time_remaining: number;
    state: "Running" | "Stopped";

    constructor() {
        this.last_state_change = 0;
        this.last_time_remaining = 0;
        this.state = "Stopped"
    }
}

export interface TeamScoreInterface {
	score: number;
	team_fouls: number;
	timeout_requested: boolean;
	fouls_accumulated: boolean;

	scoreIncrement: (add?: number) => void;
	scoreDecrement: (subtract?: number) => void;

	foulsIncrement: (add?: number) => void;
	foulsDecrement: (subtract?: number) => void;

    toggleTimeout: () => void;
    toggleFouls: () => void;
}

export interface GameInterface {
    home: TeamScoreInterface;
    away: TeamScoreInterface;
    game_clock: ClockInterface;
    shot_clock: ClockInterface;
}