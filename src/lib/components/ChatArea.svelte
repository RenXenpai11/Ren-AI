<script>
  import { createEventDispatcher } from "svelte";
  import { onMount, afterUpdate } from "svelte";

  export let messages = [];

  const dispatch = createEventDispatcher();

  let chatContainer;

  $: hasConversation = messages.some((msg) => msg.role === "user");

  function scrollToBottom() {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  function sendPrompt(prompt) {
    dispatch("promptsend", prompt);
  }

  onMount(scrollToBottom);
  afterUpdate(scrollToBottom);
</script>

<div class="chat-area" bind:this={chatContainer}>

  {#if !hasConversation}
    <section class="landing">
      <div class="hero-logo">◆</div>
      <h1>How can I help you today?</h1>
      <p>Ask me anything - RenAi is here to assist with writing, coding, research, and much more.</p>

      <div class="cards">
        <article>
          <h3>Answer questions</h3>
          <p>Get detailed explanations on any topic, from science to philosophy.</p>
          <button type="button" class="prompt-link" on:click={() => sendPrompt("Explain quantum entanglement in simple terms")}>"Explain quantum entanglement in simple terms"</button>
        </article>
        <article>
          <h3>Write & edit</h3>
          <p>Draft emails, essays, code, and creative content with ease.</p>
          <button type="button" class="prompt-link" on:click={() => sendPrompt("Write a cover letter for a senior engineer role")}>"Write a cover letter for a senior engineer role"</button>
        </article>
        <article>
          <h3>Analyze & summarize</h3>
          <p>Break down complex documents, data, and ideas quickly.</p>
          <button type="button" class="prompt-link" on:click={() => sendPrompt("Summarize the key points of this research paper")}>"Summarize the key points of this research paper"</button>
        </article>
        <article>
          <h3>Code & debug</h3>
          <p>Write, review, and debug code across all major languages.</p>
          <button type="button" class="prompt-link" on:click={() => sendPrompt("Debug this Python function and explain the issue")}>"Debug this Python function and explain the issue"</button>
        </article>
      </div>
    </section>
  {:else}
    <div class="messages-wrap">
      {#each messages as msg, idx (msg.role + idx)}
        <div class={msg.role === "user" ? "user" : "ai"}>
          {msg.text}
        </div>
      {/each}
    </div>
  {/if}

</div>

<style>

.chat-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 28px 20px 18px;
}

.landing {
  max-width: 760px;
  margin: 22px auto 0;
  text-align: center;
  animation: rise-in 320ms ease;
}

.hero-logo {
  width: 70px;
  height: 70px;
  margin: 0 auto 18px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: #fff;
  background: radial-gradient(circle at 30% 30%, #966dff, #4d22d6);
  box-shadow: 0 8px 34px rgba(80, 45, 201, 0.45);
}

h1 {
  margin: 0;
  font-size: clamp(34px, 4.4vw, 50px);
  letter-spacing: -0.03em;
}

p {
  margin: 12px auto 0;
  max-width: 620px;
  line-height: 1.5;
  color: var(--muted);
}

.cards {
  margin-top: 30px;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

article {
  text-align: left;
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--panel) 90%, transparent);
  border-radius: 16px;
  padding: 18px;
  transition: transform 160ms ease;
}

article:hover {
  transform: translateY(-2px);
}

article h3 {
  margin: 0;
  font-size: 19px;
}

article p {
  margin: 8px 0 0;
  font-size: 14px;
}

.prompt-link {
  margin-top: 12px;
  font-size: 13px;
  color: var(--accent);
  font-weight: 700;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.messages-wrap {
  max-width: 860px;
  margin: 0 auto;
}

.user,
.ai {
  padding: 12px 16px;
  border-radius: 14px;
  margin-bottom: 10px;
  line-height: 1.5;
}

.user {
  background: var(--user-bubble);
  color: #fff;
  max-width: 480px;
  margin-left: auto;
}

.ai {
  background: var(--panel-soft);
  border: 1px solid var(--line);
  color: var(--text);
  max-width: 620px;
  white-space: pre-wrap;
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 860px) {
  .chat-area {
    padding: 18px 12px;
  }

  .cards {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: clamp(30px, 9vw, 40px);
  }
}

</style>