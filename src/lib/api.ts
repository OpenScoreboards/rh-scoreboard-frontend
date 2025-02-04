import {
	writable,
	type Invalidator,
	type Readable,
	type Subscriber,
	type Writable
} from 'svelte/store';
import type { connectionStateType } from './types';

export class Fetcher {
	url: string;
	timeout: number;

	constructor(url: string, timeout: number = 0) {
		this.url = url;
		this.timeout = timeout;
	}

	fetch(
		path: string,
		params: Record<string, string> = {},
		options: RequestInit = {},
		method: string = 'get',
		timeout?: number
	) {
		options = { ...options };
		if (!options?.method) options.method = method;
		if (!options?.signal && (timeout || this.timeout))
			options.signal = AbortSignal.timeout(timeout || this.timeout);
		const searchParams = new URLSearchParams(params).toString();
		const url = new URL(this.url + path + (searchParams.length == 0 ? '' : `?${searchParams}`));
		return fetch(url, options);
	}

	buildUrl(path: string, params: Record<string, string> = {}): URL {
		const searchParams = new URLSearchParams(params).toString();
		return new URL(this.url + path + (searchParams.length == 0 ? '' : `?${searchParams}`));
	}

	get(
		path: string,
		params: Record<string, string> = {},
		options: RequestInit = {},
		timeout?: number
	) {
		return this.fetch(path, params, options, 'get', timeout);
	}
	put(
		path: string,
		params: Record<string, string> = {},
		options: RequestInit = {},
		timeout?: number
	) {
		return this.fetch(path, params, options, 'put', timeout);
	}
	post(
		path: string,
		params: Record<string, string> = {},
		options: RequestInit = {},
		timeout?: number
	) {
		return this.fetch(path, params, options, 'post', timeout);
	}
	delete(
		path: string,
		params: Record<string, string> = {},
		options: RequestInit = {},
		timeout?: number
	) {
		return this.fetch(path, params, options, 'delete', timeout);
	}
}

export class ReliableWebSocket<T> implements Readable<connectionStateType> {
	socket?: WebSocket;
	url: string | URL;
	protocols?: string | string[];
	state: 'closed' | 'opening' | 'open';
	autoRestart: boolean;
	timeout: number;
	store: Writable<connectionStateType>;
	onmessage?: { (ev: MessageEvent<T>): void };
	onerror?: { (ev: Event): void };

	constructor(url: string | URL, protocols?: string | string[], timeout: number = 10000) {
		this.url = url;
		this.protocols = protocols;
		this.state = 'closed';
		this.autoRestart = true;
		this.timeout = timeout;
		this.store = writable('idle');
	}
	subscribe = (
		run: Subscriber<connectionStateType>,
		invalidate?: Invalidator<connectionStateType> | undefined
	) => {
		return this.store.subscribe(run, invalidate);
	};
	open = () => {
		this.close();
		this.state = 'opening';
		this.store.set('idle');
		this.socket = new WebSocket(this.url, this.protocols);
		const timeout = setTimeout(() => {
			console.log(`Timeout ${this.url}: ${this.timeout}`);
			this.close();
			this.store.set('fail');
			if (this.autoRestart) this.open();
		}, this.timeout);
		this.socket.onopen = (ev: Event) => {
			clearTimeout(timeout);
			console.log(`Connected ${this.url}: ${ev.timeStamp}`);
			this.store.set('good');
		};
		this.socket.onclose = (ev: CloseEvent) => {
			clearTimeout(timeout);
			console.log(`Closed ${this.url}: ${ev.reason}`);
			this.close();
			if (!this.autoRestart) return;
			setTimeout(this.open, 1000);
		};
		if (typeof this.onmessage !== 'undefined') {
			this.socket.onmessage = this.onmessage;
		}
		if (typeof this.onerror !== 'undefined') {
			this.socket.onerror = this.onerror;
		}
	};
	close = () => {
		this.state = 'closed';
		this.store.set('idle');
		if (typeof this.socket == 'undefined') return;
		this.socket.onclose = null;
		this.socket.close();
		this.socket = undefined;
	};
}
