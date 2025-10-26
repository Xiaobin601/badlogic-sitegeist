/**
 * This code gets stringified and injected into the page context.
 * Creates a full-viewport overlay with shimmer effect and abort button.
 */
export function createOverlayScript(taskName: string): string {
	return `
(function() {
	// Check if overlay already exists (prevent duplicates)
	if (document.getElementById('sitegeist-repl-overlay')) {
		return;
	}

	// Create overlay container
	const overlay = document.createElement('div');
	overlay.id = 'sitegeist-repl-overlay';
	overlay.style.cssText = \`
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 2147483647;
		pointer-events: none;
		font-family: system-ui, -apple-system, sans-serif;
	\`;

	// Create shimmer backdrop
	const shimmer = document.createElement('div');
	shimmer.style.cssText = \`
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			rgba(99, 102, 241, 0.1) 0%,
			rgba(99, 102, 241, 0.3) 50%,
			rgba(99, 102, 241, 0.1) 100%
		);
		background-size: 200% 100%;
		animation: sitegeist-shimmer 3s ease-in-out infinite;
	\`;

	// Create toolbar
	const toolbar = document.createElement('div');
	toolbar.style.cssText = \`
		position: absolute;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: rgba(0, 0, 0, 0.9);
		backdrop-filter: blur(8px);
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		pointer-events: auto;
		z-index: 1;
	\`;

	// Task name label
	const label = document.createElement('span');
	label.textContent = '${taskName.replace(/'/g, "\\'")}';
	label.style.cssText = \`
		color: rgba(255, 255, 255, 0.9);
		font-size: 14px;
		font-weight: 500;
	\`;

	// Abort button
	const abortBtn = document.createElement('button');
	abortBtn.textContent = 'Stop';
	abortBtn.style.cssText = \`
		padding: 6px 12px;
		background: rgba(239, 68, 68, 0.9);
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	\`;
	abortBtn.onmouseover = () => {
		abortBtn.style.background = 'rgba(220, 38, 38, 1)';
	};
	abortBtn.onmouseout = () => {
		abortBtn.style.background = 'rgba(239, 68, 68, 0.9)';
	};
	abortBtn.onclick = async () => {
		console.log('[Overlay] Stop button clicked');
		console.log('[Overlay] chrome.runtime:', chrome.runtime);
		console.log('[Overlay] chrome.runtime.sendMessage:', chrome.runtime.sendMessage);
		console.log('[Overlay] chrome.runtime.id:', chrome.runtime.id);

		// Send message BEFORE removing overlay
		try {
			console.log('[Overlay] Calling sendMessage...');
			const response = await chrome.runtime.sendMessage({ type: 'abort-repl' });
			console.log('[Overlay] Got response:', response);
		} catch (error) {
			console.error('[Overlay] sendMessage failed:', error);
		}

		// Remove overlay after message sent
		overlay.remove();
	};

	// Assemble toolbar
	toolbar.appendChild(label);
	toolbar.appendChild(abortBtn);

	// Assemble overlay
	overlay.appendChild(shimmer);
	overlay.appendChild(toolbar);

	// Add CSS animation
	const style = document.createElement('style');
	style.textContent = \`
		@keyframes sitegeist-shimmer {
			0% { background-position: 0% 50%; }
			50% { background-position: 100% 50%; }
			100% { background-position: 0% 50%; }
		}
	\`;
	document.head.appendChild(style);

	// Inject into page
	document.body.appendChild(overlay);
})();
`;
}

/**
 * Code to remove the overlay from the page.
 */
export function removeOverlayScript(): string {
	return `
(function() {
	const overlay = document.getElementById('sitegeist-repl-overlay');
	if (overlay) {
		overlay.remove();
	}
})();
`;
}
