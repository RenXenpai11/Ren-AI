<script>
  import { createEventDispatcher } from "svelte";

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

<div class="composer-wrap">
  <div class="quick-actions">
    <button type="button" on:click={() => sendPreset("Help me write code for a login form")}>Write code</button>
    <button type="button" on:click={() => sendPreset("Research the latest Svelte best practices")}>Research</button>
    <button type="button" on:click={() => sendPreset("Describe this design image in detail")}>Describe image</button>
    <button type="button" on:click={() => sendPreset("Summarize my notes into bullet points")}>Summarize</button>
  </div>

  <div class="input-area">
    <input
      bind:value={message}
      placeholder="Message RenAi... (Shift+Enter for new line)"
      on:keydown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
    />

    <button class="send" on:click={sendMessage} aria-label="Send message">Send</button>
  </div>
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
    background: var(--accent);
    color: #fff;
    border: 0;
    padding: 0 18px;
    border-radius: 11px;
    cursor: pointer;
    font-weight: 700;
  }

  @media (max-width: 860px) {
    .composer-wrap {
      padding: 8px 10px 12px;
    }

    .input-area {
      padding: 6px;
    }

    .send {
      padding: 0 12px;
    }
  }
</style>