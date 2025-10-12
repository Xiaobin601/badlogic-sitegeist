/**
 * Centralized port communication module for sidepanel <-> background messaging.
 *
 * Handles automatic reconnection when port disconnects (Chrome disconnects after ~5min inactivity).
 * Background script listeners (runtime.onConnect) stay alive forever and handle new connections.
 */

// Cross-browser API compatibility
const browserAPI = globalThis.chrome;

let port: chrome.runtime.Port | null = null;
let currentWindowId: number | undefined;
const responseHandlers = new Map<string, (msg: any) => void>();

/**
 * Initialize port system with window ID.
 * Must be called before sending any messages.
 */
export function initialize(windowId: number): void {
	currentWindowId = windowId;
	connect();
}

/**
 * Create new port connection and set up listeners.
 * Background script will receive this connection via runtime.onConnect.
 */
function connect(): void {
	if (!currentWindowId) {
		throw new Error("[Port] Cannot connect: windowId not initialized");
	}

	console.log("[Port] Connecting...");
	port = browserAPI.runtime.connect({ name: `sidepanel:${currentWindowId}` });

	// Set up message listener to dispatch responses
	port.onMessage.addListener((msg: any) => {
		// Handle special close-yourself command
		if (msg.type === "close-yourself") {
			window.close();
			return;
		}

		// Dispatch to registered response handlers
		const handler = responseHandlers.get(msg.type);
		if (handler) {
			handler(msg);
		}
	});

	// Set up disconnect listener
	port.onDisconnect.addListener(() => {
		console.log("[Port] Disconnected (likely due to inactivity timeout)");
		port = null;
	});

	console.log("[Port] Connected");
}

/**
 * Mark port as disconnected.
 * Next send attempt will create a new connection.
 */
function disconnect(): void {
	port = null;
}

/**
 * Send a message through the port, optionally waiting for a response.
 *
 * Automatically reconnects if port is disconnected. Retries once on failure.
 *
 * @param message - Message to send to background script
 * @param responseType - Expected response message type (e.g., "lockResult"). If provided, waits for response.
 * @param timeoutMs - Response timeout in milliseconds (default: 5000)
 * @returns Promise resolving to response message (if responseType provided) or void
 */
export async function sendMessage<T = any>(
	message: any,
	responseType?: string,
	timeoutMs = 5000,
): Promise<T | void> {
	for (let attempt = 1; attempt <= 2; attempt++) {
		// Ensure we have a port connection
		if (!port) {
			connect();
		}

		// TypeScript: at this point port cannot be null (connect() sets it)
		if (!port) {
			throw new Error("[Port] Failed to establish connection");
		}

		try {
			// Set up response handler if expecting a response
			let responsePromise: Promise<T> | undefined;
			if (responseType) {
				responsePromise = new Promise<T>((resolve, reject) => {
					const timeoutId = setTimeout(() => {
						responseHandlers.delete(responseType);
						reject(new Error(`[Port] Timeout waiting for response: ${responseType}`));
					}, timeoutMs);

					responseHandlers.set(responseType, (msg: any) => {
						clearTimeout(timeoutId);
						responseHandlers.delete(responseType);
						resolve(msg);
					});
				});
			}

			// Try to send the message
			// This can throw if port disconnected between our check and this call
			port.postMessage(message);

			// Wait for response if needed
			if (responsePromise) {
				return await responsePromise;
			}
			return;
		} catch (err) {
			// Clean up response handler if we set one up
			if (responseType) {
				responseHandlers.delete(responseType);
			}

			// If this was our last attempt, give up
			if (attempt === 2) {
				throw new Error(`[Port] Failed to send message after ${attempt} attempts: ${err}`);
			}

			// Retry: disconnect and loop will reconnect
			console.warn(`[Port] Send attempt ${attempt} failed, will retry...`, err);
			disconnect();
		}
	}
}

/**
 * Check if port is currently connected.
 * Note: This is best-effort - port can disconnect immediately after this check.
 */
export function isConnected(): boolean {
	return port !== null;
}
