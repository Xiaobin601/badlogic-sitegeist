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

	// Create shimmer backdrop with multiple layers
	const shimmerContainer = document.createElement('div');
	shimmerContainer.style.cssText = \`
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
	\`;

	// Layer 1: Horizontal sweep (orange)
	const layer1 = document.createElement('div');
	layer1.style.cssText = \`
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(217, 79, 0, 0.15) 25%,
			rgba(255, 107, 0, 0.4) 50%,
			rgba(217, 79, 0, 0.15) 75%,
			transparent 100%
		);
		background-size: 200% 100%;
		animation: sitegeist-shimmer-horizontal 3s ease-in-out infinite;
	\`;

	// Layer 2: Diagonal sweep (purple/pink)
	const layer2 = document.createElement('div');
	layer2.style.cssText = \`
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			135deg,
			transparent 0%,
			rgba(123, 31, 162, 0.1) 25%,
			rgba(194, 24, 91, 0.3) 50%,
			rgba(81, 45, 168, 0.1) 75%,
			transparent 100%
		);
		background-size: 200% 200%;
		animation: sitegeist-shimmer-diagonal 4s ease-in-out infinite;
	\`;

	// Layer 3: Vertical sweep (blue/green)
	const layer3 = document.createElement('div');
	layer3.style.cssText = \`
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			180deg,
			transparent 0%,
			rgba(21, 101, 192, 0.1) 25%,
			rgba(45, 139, 61, 0.25) 50%,
			rgba(21, 101, 192, 0.1) 75%,
			transparent 100%
		);
		background-size: 100% 200%;
		animation: sitegeist-shimmer-vertical 5s ease-in-out infinite;
	\`;

	// Layer 4: Pulsing border glow (gold/orange)
	const borderGlow = document.createElement('div');
	borderGlow.style.cssText = \`
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		box-shadow: inset 0 0 80px rgba(212, 165, 0, 0.3),
		            inset 0 0 40px rgba(216, 67, 21, 0.2);
		animation: sitegeist-pulse 2s ease-in-out infinite;
	\`;

	shimmerContainer.appendChild(layer1);
	shimmerContainer.appendChild(layer2);
	shimmerContainer.appendChild(layer3);
	shimmerContainer.appendChild(borderGlow);

	// Create particle system
	const particleContainer = document.createElement('div');
	particleContainer.style.cssText = \`
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		pointer-events: none;
	\`;

	// Generate 30 particles with random properties
	for (let i = 0; i < 30; i++) {
		const particle = document.createElement('div');
		const size = Math.random() * 4 + 2; // 2-6px
		const startX = Math.random() * 100; // Random horizontal position
		const startY = Math.random() * 100; // Random vertical position
		const duration = Math.random() * 10 + 8; // 8-18s
		const delay = Math.random() * 5; // 0-5s delay
		const opacity = Math.random() * 0.4 + 0.3; // 0.3-0.7

		// Random color from OrbAnimation palette
		const colors = [
			'217, 79, 0',     // orange
			'255, 107, 0',    // bright orange
			'212, 165, 0',    // gold
			'45, 139, 61',    // green
			'21, 101, 192',   // blue
			'123, 31, 162',   // purple
			'194, 24, 91',    // pink
			'216, 67, 21',    // red-orange
			'81, 45, 168',    // deep purple
		];
		const color = colors[Math.floor(Math.random() * colors.length)];

		particle.style.cssText = \`
			position: absolute;
			left: \${startX}%;
			top: \${startY}%;
			width: \${size}px;
			height: \${size}px;
			background: rgba(\${color}, \${opacity});
			border-radius: 50%;
			box-shadow: 0 0 \${size * 2}px rgba(\${color}, \${opacity * 0.8});
			animation: sitegeist-particle-float \${duration}s ease-in-out \${delay}s infinite;
		\`;
		particleContainer.appendChild(particle);
	}

	shimmerContainer.appendChild(particleContainer);

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
	overlay.appendChild(shimmerContainer);
	overlay.appendChild(toolbar);

	// Add CSS animations
	const style = document.createElement('style');
	style.textContent = \`
		@keyframes sitegeist-shimmer-horizontal {
			0% { background-position: 0% 50%; }
			50% { background-position: 100% 50%; }
			100% { background-position: 0% 50%; }
		}

		@keyframes sitegeist-shimmer-diagonal {
			0% { background-position: 0% 0%; }
			50% { background-position: 100% 100%; }
			100% { background-position: 0% 0%; }
		}

		@keyframes sitegeist-shimmer-vertical {
			0% { background-position: 50% 0%; }
			50% { background-position: 50% 100%; }
			100% { background-position: 50% 0%; }
		}

		@keyframes sitegeist-pulse {
			0%, 100% {
				box-shadow: inset 0 0 80px rgba(212, 165, 0, 0.3),
				            inset 0 0 40px rgba(216, 67, 21, 0.2);
			}
			50% {
				box-shadow: inset 0 0 120px rgba(212, 165, 0, 0.5),
				            inset 0 0 60px rgba(216, 67, 21, 0.3);
			}
		}

		@keyframes sitegeist-particle-float {
			0%, 100% {
				transform: translate(0, 0) scale(1);
				opacity: 1;
			}
			25% {
				transform: translate(20px, -30px) scale(1.2);
				opacity: 0.8;
			}
			50% {
				transform: translate(-10px, -60px) scale(0.9);
				opacity: 0.6;
			}
			75% {
				transform: translate(30px, -40px) scale(1.1);
				opacity: 0.9;
			}
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
