<script>
  import { createEventDispatcher } from "svelte";

  export let isDark = false;
  export let sections = [];
  export let activeChatId = null;

  const dispatch = createEventDispatcher();
  let query = "";

  $: normalizedQuery = query.trim().toLowerCase();
  $: filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.title.toLowerCase().includes(normalizedQuery)
      )
    }))
    .filter((section) => section.items.length > 0);

  function selectChat(chatId) {
    dispatch("selectchat", { chatId });
  }

  function startNewChat() {
    dispatch("newchat");
  }
</script>

<aside class="sidebar" class:dark={isDark}>
  <div class="brand-row">
    <div class="logo">◆</div>
    <div class="brand-text">RenAi</div>
    <span class="pro">PRO</span>
  </div>

  <button class="new-chat" type="button" on:click={startNewChat}>+ New Chat</button>

  <label class="search-wrap" for="search-history">
    <input id="search-history" type="text" placeholder="Search chats..." bind:value={query} />
  </label>

  <div class="list-wrap">
    {#if filteredSections.length === 0}
      <p class="empty-state">No chats found.</p>
    {:else}
      {#each filteredSections as section (section.title)}
        <p class="section-title">{section.title}</p>
        {#each section.items as item (item.id)}
          <button
            class:active={item.id === activeChatId}
            class="chat-item"
            type="button"
            on:click={() => selectChat(item.id)}
          >
            {item.title}
          </button>
        {/each}
      {/each}
    {/if}
  </div>

  <div class="profile">
    <div class="avatar">JD</div>
    <div class="person">
      <strong>Jane Doe</strong>
      <span>jane@example.com</span>
    </div>
  </div>
</aside>

<style>
  .sidebar {
    width: 250px;
    min-width: 250px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px 10px;
    border-right: 1px solid var(--line);
    background: color-mix(in srgb, var(--panel) 95%, transparent);
  }

  .brand-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 8px;
  }

  .logo {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--accent), #8f77ff);
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 11px;
  }

  .brand-text {
    font-size: 20px;
    font-weight: 700;
  }

  .pro {
    margin-left: auto;
    background: var(--accent-soft);
    color: var(--accent);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    border-radius: 999px;
    padding: 2px 8px;
    font-size: 10px;
    font-weight: 700;
  }

  .new-chat {
    background: linear-gradient(90deg, var(--accent), #3b82f6);
    color: #fff;
    border: 0;
    border-radius: 12px;
    padding: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .search-wrap input {
    width: 100%;
    border: 1px solid var(--line);
    background: var(--panel-soft);
    color: var(--text);
    border-radius: 10px;
    padding: 10px 12px;
    outline: none;
  }

  .search-wrap input::placeholder {
    color: var(--muted);
  }

  .list-wrap {
    flex: 1;
    overflow: auto;
  }

  .section-title {
    margin: 12px 6px 8px;
    color: var(--muted);
    font-size: 11px;
    letter-spacing: 0.08em;
    font-weight: 700;
  }

  .empty-state {
    color: var(--muted);
    font-size: 13px;
    padding: 6px 8px;
  }

  .chat-item {
    width: 100%;
    text-align: left;
    border: 0;
    background: transparent;
    color: var(--text);
    padding: 10px 10px;
    border-radius: 10px;
    cursor: pointer;
    margin-bottom: 4px;
    font-size: 14px;
  }

  .chat-item:hover,
  .chat-item.active {
    background: var(--panel-soft);
  }

  .profile {
    border: 1px solid var(--line);
    background: var(--panel-soft);
    border-radius: 14px;
    padding: 10px;
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--accent);
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 11px;
    font-weight: 700;
  }

  .person {
    display: flex;
    flex-direction: column;
  }

  .person strong {
    font-size: 13px;
  }

  .person span {
    color: var(--muted);
    font-size: 12px;
  }

  @media (max-width: 860px) {
    .sidebar {
      width: 100%;
      min-width: 0;
      height: 210px;
      border-right: 0;
      border-bottom: 1px solid var(--line);
    }
  }
</style>