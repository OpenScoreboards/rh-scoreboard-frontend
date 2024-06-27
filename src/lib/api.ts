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

export class ReliableWebSocket<T> {
	socket?: WebSocket;
	url: string | URL;
	protocols?: string | string[];
	state: 'closed' | 'opening' | 'open';
	autoRestart: boolean;
	timeout: number;
	onmessage?: { (ev: MessageEvent<T>): void; };
	onerror?: { (ev: Event): void; };

	constructor(url: string | URL, protocols?: string | string[], timeout: number = 10000) {
		this.url = url;
		this.protocols = protocols;
		this.state = 'closed';
		this.autoRestart = true;
		this.timeout = timeout;
	}
	open() {
		this.close();
		this.state = 'opening'
		this.socket = new WebSocket(this.url, this.protocols);
		const timeout = setTimeout(() => {
			console.log(`Timeout ${this.url}: ${this.timeout}`);
			this.close();
			if (this.autoRestart) this.open();
		}, this.timeout);
		this.socket.onopen = (ev: Event) => {
			console.log(`Connected ${this.url}: ${ev.timeStamp}`);
			this.state = 'open';
			clearTimeout(timeout);
		};
		this.socket.onclose = (ev: CloseEvent) => {
			console.log(`Closed ${this.url}: ${ev.reason}`);
			this.close();
			if (this.autoRestart) this.open();
		};
		if (typeof this.onmessage !== 'undefined') {
			this.socket.onmessage = this.onmessage;
		}
		if (typeof this.onerror !== 'undefined') {
			this.socket.onerror = this.onerror;
		}
	}
	close() {
		this.state = 'closed';
		if (typeof this.socket == 'undefined') return;
		this.socket.close();
		this.socket = undefined;
	}
}
