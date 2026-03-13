<script>
  import Sidebar from "$lib/components/Sidebar.svelte";
  import ChatArea from "$lib/components/ChatArea.svelte";
  import ChatInput from "$lib/components/ChatInput.svelte";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  const CHAT_STORAGE_KEY = "aura-chat-list-v1";
  const ACTIVE_CHAT_STORAGE_KEY = "aura-active-chat-v1";

  const defaultAssistantMessage = {
    role: "ai",
    text: "Hello! I'm RenAi. How can I help you today?"
  };

  const sectionOrder = ["TODAY", "YESTERDAY", "LAST WEEK", "OLDER"];

  const initialChats = [
    {
      id: "chat-1",
      title: "React component architecture",
      section: "TODAY",
      messages: [{ ...defaultAssistantMessage }]
    },
    {
      id: "chat-2",
      title: "Python data analysis",
      section: "TODAY",
      messages: [{ ...defaultAssistantMessage }]
    },
    {
      id: "chat-3",
      title: "Marketing strategy ideas",
      section: "YESTERDAY",
      messages: [{ ...defaultAssistantMessage }]
    },
    {
      id: "chat-4",
      title: "Travel itinerary for Japan",
      section: "YESTERDAY",
      messages: [{ ...defaultAssistantMessage }]
    },
    {
      id: "chat-5",
      title: "CSS grid vs flexbox",
      section: "LAST WEEK",
      messages: [{ ...defaultAssistantMessage }]
    },
    {
      id: "chat-6",
      title: "Book recommendations",
      section: "LAST WEEK",
      messages: [{ ...defaultAssistantMessage }]
    }
  ];

  let chats = [...initialChats];

  let activeChatId = chats[0].id;
  let messages = [...chats[0].messages];
  $: hasConversation = messages.some((msg) => msg.role === "user");

  $: sidebarSections = sectionOrder
    .map((title) => ({
      title,
      items: chats
        .filter((chat) => chat.section === title)
        .map((chat) => ({ id: chat.id, title: chat.title }))
    }))
    .filter((section) => section.items.length > 0);

  let isDark = false;
  let isMobile = false;
  let isSidebarOpen = true;
  let typingAnimationToken = 0;

  onMount(() => {
    const storedChats = localStorage.getItem(CHAT_STORAGE_KEY);
    const storedActiveChatId = localStorage.getItem(ACTIVE_CHAT_STORAGE_KEY);

    if (storedChats) {
      try {
        const parsedChats = JSON.parse(storedChats);
        if (Array.isArray(parsedChats) && parsedChats.length > 0) {
          chats = parsedChats;
        }
      } catch (error) {
        console.error("Failed to parse saved chats", error);
      }
    }

    if (storedActiveChatId && chats.some((chat) => chat.id === storedActiveChatId)) {
      activeChatId = storedActiveChatId;
    } else {
      activeChatId = chats[0]?.id ?? "";
    }

    const selected = chats.find((chat) => chat.id === activeChatId);
    messages = selected ? [...selected.messages] : [{ ...defaultAssistantMessage }];

    const savedTheme = localStorage.getItem("aura-theme");
    if (savedTheme) {
      isDark = savedTheme === "dark";
    } else {
      isDark = true;
      localStorage.setItem("aura-theme", "dark");
    }

    const media = window.matchMedia("(max-width: 860px)");
    const syncViewport = () => {
      isMobile = media.matches;
      isSidebarOpen = !media.matches;
    };

    syncViewport();
    media.addEventListener("change", syncViewport);

    return () => {
      media.removeEventListener("change", syncViewport);
    };
  });

  $: if (browser) {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
  }

  $: if (browser && activeChatId) {
    localStorage.setItem(ACTIVE_CHAT_STORAGE_KEY, activeChatId);
  }

  function toggleTheme() {
    isDark = !isDark;
    localStorage.setItem("aura-theme", isDark ? "dark" : "light");
  }

  function syncActiveChatMessages(nextMessages, chatId = activeChatId) {
    if (activeChatId === chatId) {
      messages = nextMessages;
    }

    chats = chats.map((chat) =>
      chat.id === chatId ? { ...chat, messages: nextMessages } : chat
    );
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function animateAssistantReply(baseMessages, reply, chatId) {
    const token = ++typingAnimationToken;
    const safeReply = String(reply ?? "");
    let cursor = 0;

    while (cursor < safeReply.length) {
      if (token !== typingAnimationToken) return;

      const remaining = safeReply.length - cursor;
      const step = Math.max(1, Math.ceil(remaining / 35));
      cursor = Math.min(safeReply.length, cursor + step);

      syncActiveChatMessages(
        [...baseMessages, { role: "ai", text: `${safeReply.slice(0, cursor)}▍` }],
        chatId
      );

      await wait(20);
    }

    if (token !== typingAnimationToken) return;
    syncActiveChatMessages([...baseMessages, { role: "ai", text: safeReply }], chatId);
  }

  function maybeRenameChat(promptText) {
    const nextTitle = promptText.trim().slice(0, 40);
    if (!nextTitle) return;

    chats = chats.map((chat) => {
      if (chat.id !== activeChatId) return chat;

      if (!chat.title.toLowerCase().startsWith("new chat")) {
        return chat;
      }

      return { ...chat, title: nextTitle };
    });
  }

  function handleSelectChat(event) {
    const { chatId } = event.detail;
    const selected = chats.find((chat) => chat.id === chatId);

    if (!selected) return;

    activeChatId = selected.id;
    messages = [...selected.messages];

    if (isMobile) {
      isSidebarOpen = false;
    }
  }

  function handleNewChat() {
    const id = `chat-${Date.now()}`;
    const newChat = {
      id,
      title: `New Chat ${chats.length + 1}`,
      section: "TODAY",
      messages: [{ ...defaultAssistantMessage }]
    };

    chats = [newChat, ...chats];
    activeChatId = id;
    messages = [...newChat.messages];

    if (isMobile) {
      isSidebarOpen = false;
    }
  }

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }

  function closeSidebar() {
    isSidebarOpen = false;
  }

  function handlePromptSend(event) {
    handleSendInput(event.detail);
  }

  function handleSend(event) {
    handleSendInput(event.detail);
  }

  function toUserBubbleText(userMessage, attachments) {
    const text = String(userMessage || "").trim();
    if (!attachments.length) return text;

    const attachmentLine = `Attached: ${attachments.map((item) => item.name).join(", ")}`;
    return text ? `${text}\n\n${attachmentLine}` : attachmentLine;
  }

  async function handleSendInput(payload){
    const userMessage = typeof payload === "string" ? payload : payload?.message;
    const attachments = Array.isArray(payload?.attachments) ? payload.attachments : [];

    if (!String(userMessage || "").trim() && attachments.length === 0) {
      return;
    }

    const targetChatId = activeChatId;
    const userBubbleText = toUserBubbleText(userMessage, attachments);

    const optimisticMessages = [
      ...messages,
      { role:"user", text:userBubbleText },
      { role:"ai", text:"(AI thinking...)" }
    ];

    typingAnimationToken += 1;
    syncActiveChatMessages(optimisticMessages, targetChatId);
    maybeRenameChat(String(userMessage || attachments[0]?.name || "New Chat"));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, attachments })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.reply) {
        await animateAssistantReply(optimisticMessages.slice(0, -1), data.reply, targetChatId);
      } else {
        throw new Error("No reply in response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      syncActiveChatMessages(
        [...optimisticMessages.slice(0, -1), { role: "ai", text: `Error: ${error.message}` }],
        targetChatId
      );
    }
  }
</script>

<div class="layout" class:dark={isDark}>

  <Sidebar
    {isDark}
    {isMobile}
    isOpen={isSidebarOpen}
    sections={sidebarSections}
    {activeChatId}
    on:selectchat={handleSelectChat}
    on:newchat={handleNewChat}
  />

  {#if isMobile && isSidebarOpen}
    <button class="sidebar-overlay" type="button" aria-label="Close sidebar" on:click={closeSidebar}></button>
  {/if}

  <div class="main-shell">
    <div class="topbar">
      {#if isMobile}
        <button
          class="icon-btn menu-btn"
          type="button"
          aria-label="Toggle sidebar"
          on:click={toggleSidebar}
        >
          Chats
        </button>
      {/if}

      <div class="model-pill">
        <span class="dot"></span>
        RenAi 4
        <span class="pro-badge">PRO</span>
      </div>

      <div class="topbar-actions">
        <button class="ghost-btn" type="button">Share</button>
        <button class="icon-btn" type="button" on:click={toggleTheme} aria-label="Toggle theme">
          {#if isDark}
            Light
          {:else}
            Dark
          {/if}
        </button>
      </div>
    </div>

    <div class="main" class:new-session={!hasConversation}>
      <ChatArea {messages} on:promptsend={handlePromptSend} />

      <ChatInput centered={!hasConversation} on:send={handleSend} />
    </div>
  </div>

</div>

<style>
:global(body) {
  margin: 0;
  font-family: "Plus Jakarta Sans", "Segoe UI", sans-serif;
}

.layout {
  --bg: #f6f7fb;
  --panel: #ffffff;
  --panel-soft: #eff2f8;
  --text: #111827;
  --muted: #5f6880;
  --line: #d7dde8;
  --accent: #6a38ff;
  --accent-soft: #efe9ff;
  --user-bubble: #7c3aed;

  display: flex;
  height: 100vh;
  background: radial-gradient(circle at 75% 0%, #e9edff 0%, var(--bg) 42%);
  color: var(--text);
}

.layout.dark {
  --bg: #020817;
  --panel: #111d34;
  --panel-soft: #17243f;
  --text: #f4f7ff;
  --muted: #9eb0d0;
  --line: #2a3a58;
  --accent: #9d7cff;
  --accent-soft: rgba(157, 124, 255, 0.14);
  --user-bubble: #7a4dff;
  background: radial-gradient(circle at 70% -8%, #1a2b55 0%, var(--bg) 46%);
}

.main-shell {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  height: 64px;
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22px;
  background: color-mix(in srgb, var(--panel) 85%, transparent);
  backdrop-filter: blur(8px);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  border: 0;
  background: rgba(11, 17, 32, 0.35);
  z-index: 19;
}

.model-pill {
  border: 1px solid var(--line);
  background: var(--panel-soft);
  border-radius: 999px;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--accent);
}

.pro-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
}

.topbar-actions {
  display: flex;
  gap: 10px;
}

.menu-btn {
  display: none;
}

.ghost-btn,
.icon-btn {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 8px 12px;
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
  font-weight: 600;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.main.new-session {
  justify-content: center;
  gap: 12px;
  padding-bottom: 44px;
}

.main.new-session :global(.chat-area) {
  flex: 0 0 auto;
  overflow: visible;
  padding-top: 0;
  padding-bottom: 0;
}

.main.new-session :global(.landing) {
  margin-top: 0;
}

.main.new-session :global(.cards) {
  display: none;
}

@media (max-width: 860px) {
  .layout {
    flex-direction: column;
    height: 100dvh;
    overflow: hidden;
  }

  .topbar {
    padding: 0 14px;
    gap: 8px;
    height: 56px;
  }

  .model-pill {
    font-size: 13px;
    padding: 7px 10px;
  }

  .pro-badge,
  .ghost-btn {
    display: none;
  }

  .menu-btn {
    display: inline-flex;
  }

  .topbar-actions {
    margin-left: auto;
  }

  .main.new-session {
    padding-bottom: 18px;
  }
}

</style>