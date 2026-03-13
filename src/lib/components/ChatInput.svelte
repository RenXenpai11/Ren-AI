<script>
  import { createEventDispatcher } from "svelte";

  export let centered = false;

  const dispatch = createEventDispatcher();
  let message = "";

  function sendMessage() {
    if (message.trim() === "") return;

    dispatch("send", message);
    message = "";
  }

  function sendPreset(text) {
    dispatch("send", text);
  }
</script>

<div class="composer-wrap" class:centered>
  <div class="quick-actions">
    <button type="button" on:click={() => sendPreset("Help me write code for a login form")}>Write code</button>
    <button type="button" on:click={() => sendPreset("Research the latest Svelte best practices")}>Research</button>
    <button type="button" on:click={() => sendPreset("Describe this design image in detail")}>Describe image</button>
    <button type="button" on:click={() => sendPreset("Summarize my notes into bullet points")}>Summarize</button>
  </div>

  <form class="input-area" on:submit|preventDefault={sendMessage}>
    <input
      bind:value={message}
      placeholder="Message RenAi..."
    />

    <button class="send" type="submit" aria-label="Send message">
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M10 3.5a1 1 0 0 1 1 1v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 3.98a1 1 0 0 1-1.4 0l-4-3.98a1 1 0 1 1 1.4-1.42L9 13.09V4.5a1 1 0 0 1 1-1z" />
      </svg>
    </button>
  </form>
</div>

<style>
  .composer-wrap {
    padding: 10px 18px 16px;
    border-top: 1px solid var(--line);
    background: color-mix(in srgb, var(--bg) 74%, transparent);
    backdrop-filter: blur(6px);
  }

  .quick-actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .composer-wrap.centered {
    border-top: 0;
    background: transparent;
    padding: 0 18px;
  }

  .quick-actions button {
    border: 1px solid var(--line);
    color: var(--text);
    background: var(--panel);
    border-radius: 999px;
    padding: 8px 14px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
  }

  .input-area {
    max-width: 920px;
    margin: 0 auto;
    display: flex;
    gap: 10px;
    padding: 8px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--panel);
    box-shadow: 0 18px 40px color-mix(in srgb, var(--accent) 12%, transparent);
  }

  .composer-wrap.centered .input-area {
    max-width: 760px;
    border-radius: 24px;
    padding: 10px;
  }

  input {
    flex: 1;
    min-height: 48px;
    border-radius: 10px;
    border: 0;
    padding: 0 12px;
    background: transparent;
    color: var(--text);
    outline: none;
    font-size: 15px;
  }

  input::placeholder {
    color: var(--muted);
  }

  .send {
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    background: var(--text);
    color: var(--panel);
    border: 0;
    padding: 0;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 140ms ease, opacity 140ms ease;
  }

  .send:hover {
    transform: translateY(-1px);
  }

  .send:active {
    transform: translateY(0);
    opacity: 0.9;
  }

  .send svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }

  @media (max-width: 860px) {
    .composer-wrap {
      padding: 8px 10px 12px;
    }

    .input-area {
      padding: 6px;
    }

    .send {
      width: 40px;
      height: 40px;
    }
  }
</style>