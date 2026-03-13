<script>
  import { onDestroy } from "svelte";
  import { createEventDispatcher } from "svelte";

  export let centered = false;

  const dispatch = createEventDispatcher();
  let message = "";
  let fileInput;
  let isDragOver = false;
  let pendingFiles = [];

  const MAX_FILES = 3;
  const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
  const ACCEPTED_TYPES = [
    "image/",
    "text/",
    "application/pdf",
    "application/json",
    "application/javascript",
    "application/typescript"
  ];

  function canAcceptFile(file) {
    return ACCEPTED_TYPES.some((typePrefix) => file.type.startsWith(typePrefix));
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
      reader.readAsDataURL(file);
    });
  }

  function pickFiles() {
    fileInput?.click();
  }

  function toPendingFile(file) {
    return {
      id: crypto.randomUUID(),
      file,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : ""
    };
  }

  function releasePreview(pendingFile) {
    if (pendingFile.previewUrl) {
      URL.revokeObjectURL(pendingFile.previewUrl);
    }
  }

  function validateFiles(chosen) {
    return chosen.filter((file) => {
      if (!canAcceptFile(file)) {
        alert(`Unsupported file type: ${file.name}`);
        return false;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        alert(`File is too large (max 2MB): ${file.name}`);
        return false;
      }

      return true;
    });
  }

  function addFiles(chosen) {
    const valid = validateFiles(chosen).map(toPendingFile);
    const merged = [...pendingFiles, ...valid];
    const trimmed = merged.slice(0, MAX_FILES);
    const dropped = merged.slice(MAX_FILES);

    dropped.forEach(releasePreview);
    pendingFiles = trimmed;

    if (merged.length > MAX_FILES) {
      alert(`Only ${MAX_FILES} files can be attached per message.`);
    }
  }

  function removeFile(index) {
    const target = pendingFiles[index];
    if (target) {
      releasePreview(target);
    }
    pendingFiles = pendingFiles.filter((_, i) => i !== index);
  }

  function handleFileSelect(event) {
    const chosen = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = "";
    addFiles(chosen);
  }

  function handleDragOver(event) {
    event.preventDefault();
    isDragOver = true;
  }

  function handleDragLeave(event) {
    event.preventDefault();
    isDragOver = false;
  }

  function handleDrop(event) {
    event.preventDefault();
    isDragOver = false;
    const dropped = Array.from(event.dataTransfer?.files || []);
    addFiles(dropped);
  }

  async function sendMessage() {
    const text = message.trim();
    if (text === "" && pendingFiles.length === 0) return;

    const attachments = await Promise.all(
      pendingFiles.map(async (item) => ({
        name: item.file.name,
        type: item.file.type || "application/octet-stream",
        size: item.file.size,
        data: await fileToBase64(item.file)
      }))
    );

    dispatch("send", {
      message: text,
      attachments
    });

    pendingFiles.forEach(releasePreview);
    message = "";
    pendingFiles = [];
  }

  function sendPreset(text) {
    dispatch("send", { message: text, attachments: [] });
  }

  onDestroy(() => {
    pendingFiles.forEach(releasePreview);
  });
</script>

<div class="composer-wrap" class:centered>
  <div class="quick-actions">
    <button type="button" on:click={() => sendPreset("Help me write code for a login form")}>Write code</button>
    <button type="button" on:click={() => sendPreset("Research the latest Svelte best practices")}>Research</button>
    <button type="button" on:click={() => sendPreset("Describe this design image in detail")}>Describe image</button>
    <button type="button" on:click={() => sendPreset("Summarize my notes into bullet points")}>Summarize</button>
  </div>

  <div class="selected-files" class:has-files={pendingFiles.length > 0}>
    {#each pendingFiles as item, index (item.id)}
      <button type="button" class="file-chip" on:click={() => removeFile(index)} title="Remove file">
        {#if item.previewUrl}
          <img src={item.previewUrl} alt={item.file.name} />
        {/if}
        <span>{item.file.name}</span>
        <strong>×</strong>
      </button>
    {/each}
  </div>

  <form
    class="input-area"
    class:drag-over={isDragOver}
    on:submit|preventDefault={sendMessage}
    on:dragenter|preventDefault={() => (isDragOver = true)}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
  >
    <input
      bind:this={fileInput}
      class="hidden-file-input"
      type="file"
      multiple
      accept="image/*,.pdf,.txt,.md,.csv,.json,.js,.ts,.html,.css"
      on:change={handleFileSelect}
    />

    <button class="attach" type="button" aria-label="Attach files" on:click={pickFiles}>+</button>

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

  .selected-files {
    max-width: 920px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-height: 0;
    overflow: hidden;
    transition: max-height 160ms ease;
  }

  .selected-files.has-files {
    max-height: 140px;
    margin-bottom: 10px;
  }

  .file-chip {
    border: 1px solid var(--line);
    background: color-mix(in srgb, var(--panel) 88%, transparent);
    color: var(--text);
    border-radius: 999px;
    padding: 6px 10px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    max-width: 240px;
  }

  .file-chip img {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    object-fit: cover;
    flex: 0 0 auto;
  }

  .file-chip span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
  }

  .file-chip strong {
    font-size: 14px;
    line-height: 1;
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

  .input-area.drag-over {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 30%, transparent);
  }

  .hidden-file-input {
    display: none;
  }

  .attach {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    border: 1px solid var(--line);
    background: var(--panel-soft);
    color: var(--text);
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    align-self: center;
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