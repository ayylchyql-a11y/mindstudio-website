/* Showcase snippet generators + framework logos, transpiled verbatim from
 *  morphicons.com (website/lib/showcase-snippets.ts, website/lib/logos.ts; MIT).
 *  Logos: simple-icons (CC0). Call MorphSnippets.init(byId, dOf) once. */
window.MorphSnippets = (function () {
let byId, dOf;
/* Brand glyphs from simple-icons (CC0), 24×24, fill currentColor. Shared by
   the code panel tabs and the showcase framework selector. */
const REACT_LOGO = "M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z";
const VUE_LOGO = "M24,1.61H14.06L12,5.16,9.94,1.61H0L12,22.39ZM12,14.08,5.16,2.23H9.59L12,6.41l2.41-4.18h4.43Z";
const SVELTE_LOGO = "M10.354 21.125a4.44 4.44 0 0 1-4.765-1.767 4.109 4.109 0 0 1-.703-3.107 3.898 3.898 0 0 1 .134-.522l.105-.321.287.21a7.21 7.21 0 0 0 2.186 1.092l.208.063-.02.208a1.253 1.253 0 0 0 .226.83 1.337 1.337 0 0 0 1.435.533 1.231 1.231 0 0 0 .343-.15l5.59-3.562a1.164 1.164 0 0 0 .524-.778 1.242 1.242 0 0 0-.211-.937 1.338 1.338 0 0 0-1.435-.533 1.23 1.23 0 0 0-.343.15l-2.133 1.36a4.078 4.078 0 0 1-1.135.499 4.44 4.44 0 0 1-4.765-1.766 4.108 4.108 0 0 1-.702-3.108 3.855 3.855 0 0 1 1.742-2.582l5.589-3.563a4.072 4.072 0 0 1 1.135-.499 4.44 4.44 0 0 1 4.765 1.767 4.109 4.109 0 0 1 .703 3.107 3.943 3.943 0 0 1-.134.522l-.105.321-.286-.21a7.204 7.204 0 0 0-2.187-1.093l-.208-.063.02-.207a1.255 1.255 0 0 0-.226-.831 1.337 1.337 0 0 0-1.435-.532 1.231 1.231 0 0 0-.343.15L8.62 9.368a1.162 1.162 0 0 0-.524.778 1.24 1.24 0 0 0 .211.937 1.338 1.338 0 0 0 1.435.533 1.235 1.235 0 0 0 .344-.151l2.132-1.36a4.067 4.067 0 0 1 1.135-.498 4.44 4.44 0 0 1 4.765 1.766 4.108 4.108 0 0 1 .702 3.108 3.857 3.857 0 0 1-1.742 2.583l-5.589 3.562a4.072 4.072 0 0 1-1.135.499m10.358-17.95C18.484-.015 14.082-.96 10.9 1.068L5.31 4.63a6.412 6.412 0 0 0-2.896 4.295 6.753 6.753 0 0 0 .666 4.336 6.43 6.43 0 0 0-.96 2.396 6.833 6.833 0 0 0 1.168 5.167c2.229 3.19 6.63 4.135 9.812 2.108l5.59-3.562a6.41 6.41 0 0 0 2.896-4.295 6.756 6.756 0 0 0-.665-4.336 6.429 6.429 0 0 0 .958-2.396 6.831 6.831 0 0 0-1.167-5.168Z";
const ASTRO_LOGO = "M8.358 20.162c-1.186-1.07-1.532-3.316-1.038-4.944.856 1.026 2.043 1.352 3.272 1.535 1.897.283 3.76.177 5.522-.678.202-.098.388-.229.608-.36.166.473.209.95.151 1.437-.14 1.185-.738 2.1-1.688 2.794-.38.277-.782.525-1.175.787-1.205.804-1.531 1.747-1.078 3.119l.044.148a3.158 3.158 0 0 1-1.407-1.188 3.31 3.31 0 0 1-.544-1.815c-.004-.32-.004-.642-.048-.958-.106-.769-.472-1.113-1.161-1.133-.707-.02-1.267.411-1.415 1.09-.012.053-.028.104-.045.165h.002zm-5.961-4.445s3.24-1.575 6.49-1.575l2.451-7.565c.092-.366.36-.614.662-.614.302 0 .57.248.662.614l2.45 7.565c3.85 0 6.491 1.575 6.491 1.575L16.088.727C15.93.285 15.663 0 15.303 0H8.697c-.36 0-.615.285-.784.727l-5.516 14.99z";

/* Snippet generators for the showcase (app/showcase): every recipe as a
   ready-to-paste component in React, Vue or Svelte, parameterized by the
   sidebar controls. Lucide snippets import icon data from the `lucide`
   package; Heroicons and Tabler ship as raw `d` strings, which morphicons
   consumes directly — no adapter layer, so the copied code is exactly what
   the library supports. Button/Input imports point at the shadcn ports
   (shadcn/ui, shadcn-vue, shadcn-svelte), whose APIs match on purpose. */

const FRAMEWORK_LABEL = {
    react: "React",
    vue: "Vue",
    svelte: "Svelte",
};
/* Icon label → the identifier used in every template (Lucide's export name,
   so the same body works for the import and the d-string variants). */
const IDENT = {
    copy: "Copy",
    check: "Check",
    x: "X",
    eye: "Eye",
    "eye-off": "EyeOff",
    sun: "Sun",
    moon: "Moon",
    play: "Play",
    pause: "Pause",
    volume: "Volume2",
    "volume-x": "VolumeX",
    folder: "Folder",
    "folder-open": "FolderOpen",
};
const LIB_TITLE = {
    lucide: "Lucide",
    heroicons: "Heroicons 24/outline",
    tabler: "Tabler Icons outline",
};
/* The icon-data block at the top of a snippet: an import for Lucide, raw
   path data for the packs that publish icons as SVG files. */
function iconBlock(lib, labels) {
    if (lib === "lucide") {
        const names = labels.map((l) => IDENT[l]).sort();
        return `import { ${names.join(", ")} } from "lucide"; // icon data, not components`;
    }
    const consts = labels
        .map((l) => {
        const entry = byId.get(`${lib}:${l}`);
        if (!entry)
            throw new Error(`showcase icon missing: ${lib}:${l}`);
        return `const ${IDENT[l]} = "${dOf(entry)}";`;
    })
        .join("\n");
    return `/* ${LIB_TITLE[lib]} geometry as raw path data — morphicons takes \`d\` strings as-is. */\n${consts}`;
}
/* Extra MorphIcon props from the sidebar. Stroke 2 is the default, so it is
   only emitted when it differs. */
const jsxProps = (o) => ` spring="${o.spring}"` +
    (o.strokeWidth === 2 ? "" : ` strokeWidth={${o.strokeWidth}}`);
const vueProps = (o) => ` spring="${o.spring}"` +
    (o.strokeWidth === 2 ? "" : ` :stroke-width="${o.strokeWidth}"`);
const indent = (s, pad) => s
    .split("\n")
    .map((l) => (l ? pad + l : l))
    .join("\n");
const RECIPES = {
    copy: {
        labels: ["copy", "check"],
        tpl: {
            react: (c) => `${c.icons}



function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button variant="ghost" size="icon" onClick={copy} aria-label="Copy to clipboard">
      <MorphIcon icon={copied ? Check : Copy} size={16}${c.props} />
    </Button>
  );
}
`,
            vue: (c) => `<script setup lang="ts">
${c.icons}



const props = defineProps<{ text: string }>();
const copied = ref(false);

async function copy() {
  await navigator.clipboard.writeText(props.text);
  copied.value = true;
  setTimeout(() => (copied.value = false), 1500);
}
</script>

<template>
  <Button variant="ghost" size="icon" aria-label="Copy to clipboard" @click="copy">
    <MorphIcon :icon="copied ? Check : Copy" :size="16"${c.vProps} />
  </Button>
</template>
`,
            svelte: (c) => `<script lang="ts">
${indent(c.icons, "  ")}
  import { MorphIcon } from "morphicons/svelte";
  import { Button } from "$lib/components/ui/button";

  let { text }: { text: string } = $props();
  let copied = $state(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<Button variant="ghost" size="icon" aria-label="Copy to clipboard" onclick={copy}>
  <MorphIcon icon={copied ? Check : Copy} size={16}${c.props} />
</Button>
`,
        },
    },
    password: {
        labels: ["eye", "eye-off"],
        tpl: {
            react: (c) => `${c.icons}




function PasswordInput() {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        placeholder="Password"
        className="pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        <MorphIcon icon={visible ? EyeOff : Eye} size={16}${c.props} />
      </Button>
    </div>
  );
}
`,
            vue: (c) => `<script setup lang="ts">
${c.icons}




const visible = ref(false);
</script>

<template>
  <div class="relative">
    <Input :type="visible ? 'text' : 'password'" placeholder="Password" class="pr-10" />
    <Button
      type="button"
      variant="ghost"
      size="icon"
      class="absolute top-1/2 right-1 size-7 -translate-y-1/2"
      :aria-label="visible ? 'Hide password' : 'Show password'"
      :aria-pressed="visible"
      @click="visible = !visible"
    >
      <MorphIcon :icon="visible ? EyeOff : Eye" :size="16"${c.vProps} />
    </Button>
  </div>
</template>
`,
            svelte: (c) => `<script lang="ts">
${indent(c.icons, "  ")}
  import { MorphIcon } from "morphicons/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";

  let visible = $state(false);
</script>

<div class="relative">
  <Input type={visible ? "text" : "password"} placeholder="Password" class="pr-10" />
  <Button
    type="button"
    variant="ghost"
    size="icon"
    class="absolute top-1/2 right-1 size-7 -translate-y-1/2"
    aria-label={visible ? "Hide password" : "Show password"}
    aria-pressed={visible}
    onclick={() => (visible = !visible)}
  >
    <MorphIcon icon={visible ? EyeOff : Eye} size={16}${c.props} />
  </Button>
</div>
`,
        },
    },
    theme: {
        labels: ["sun", "moon"],
        tpl: {
            react: (c) => `${c.icons}



function ThemeToggle() {
  // Wire this to next-themes or your theme store.
  const [dark, setDark] = useState(false);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle theme"
      aria-pressed={dark}
    >
      <MorphIcon icon={dark ? Moon : Sun} size={16}${c.props} />
    </Button>
  );
}
`,
            vue: (c) => `<script setup lang="ts">
${c.icons}



// Wire this to your theme store (VueUse useDark, nuxt color-mode…).
const dark = ref(false);
</script>

<template>
  <Button
    variant="outline"
    size="icon"
    aria-label="Toggle theme"
    :aria-pressed="dark"
    @click="dark = !dark"
  >
    <MorphIcon :icon="dark ? Moon : Sun" :size="16"${c.vProps} />
  </Button>
</template>
`,
            svelte: (c) => `<script lang="ts">
${indent(c.icons, "  ")}
  import { MorphIcon } from "morphicons/svelte";
  import { Button } from "$lib/components/ui/button";

  // Wire this to mode-watcher or your theme store.
  let dark = $state(false);
</script>

<Button
  variant="outline"
  size="icon"
  aria-label="Toggle theme"
  aria-pressed={dark}
  onclick={() => (dark = !dark)}
>
  <MorphIcon icon={dark ? Moon : Sun} size={16}${c.props} />
</Button>
`,
        },
    },
    player: {
        labels: ["play", "pause", "volume", "volume-x"],
        tpl: {
            react: (c) => `${c.icons}



function PlayerControls() {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "Pause" : "Play"}
      >
        <MorphIcon icon={playing ? Pause : Play} size={16}${c.props} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute" : "Mute"}
        aria-pressed={muted}
      >
        <MorphIcon icon={muted ? VolumeX : Volume2} size={16}${c.props} />
      </Button>
    </div>
  );
}
`,
            vue: (c) => `<script setup lang="ts">
${c.icons}



const playing = ref(false);
const muted = ref(false);
</script>

<template>
  <div class="flex items-center gap-1">
    <Button
      size="icon"
      :aria-label="playing ? 'Pause' : 'Play'"
      @click="playing = !playing"
    >
      <MorphIcon :icon="playing ? Pause : Play" :size="16"${c.vProps} />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      :aria-label="muted ? 'Unmute' : 'Mute'"
      :aria-pressed="muted"
      @click="muted = !muted"
    >
      <MorphIcon :icon="muted ? VolumeX : Volume2" :size="16"${c.vProps} />
    </Button>
  </div>
</template>
`,
            svelte: (c) => `<script lang="ts">
${indent(c.icons, "  ")}
  import { MorphIcon } from "morphicons/svelte";
  import { Button } from "$lib/components/ui/button";

  let playing = $state(false);
  let muted = $state(false);
</script>

<div class="flex items-center gap-1">
  <Button
    size="icon"
    aria-label={playing ? "Pause" : "Play"}
    onclick={() => (playing = !playing)}
  >
    <MorphIcon icon={playing ? Pause : Play} size={16}${c.props} />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    aria-label={muted ? "Unmute" : "Mute"}
    aria-pressed={muted}
    onclick={() => (muted = !muted)}
  >
    <MorphIcon icon={muted ? VolumeX : Volume2} size={16}${c.props} />
  </Button>
</div>
`,
        },
    },
    validation: {
        labels: ["check", "x"],
        tpl: {
            react: (c) => `${c.icons}



const EMAIL = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

function EmailField() {
  const [value, setValue] = useState("");

  return (
    <div className="relative">
      <Input
        type="email"
        placeholder="you@example.com"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pr-10"
      />
      {/* Stays mounted so valid ↔ invalid morphs instead of remounting. */}
      <MorphIcon
        icon={EMAIL.test(value) ? Check : X}
        size={16}
        className={"pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 " + (value ? "" : "opacity-0")}${c.props}
      />
    </div>
  );
}
`,
            vue: (c) => `<script setup lang="ts">
${c.icons}



const EMAIL = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
const value = ref("");
</script>

<template>
  <div class="relative">
    <Input v-model="value" type="email" placeholder="you@example.com" class="pr-10" />
    <!-- Stays mounted so valid ↔ invalid morphs instead of remounting. -->
    <MorphIcon
      :icon="EMAIL.test(value) ? Check : X"
      :size="16"
      class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
      :class="{ 'opacity-0': !value }"${c.vProps}
    />
  </div>
</template>
`,
            svelte: (c) => `<script lang="ts">
${indent(c.icons, "  ")}
  import { MorphIcon } from "morphicons/svelte";
  import { Input } from "$lib/components/ui/input";

  const EMAIL = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  let value = $state("");
</script>

<div class="relative">
  <Input bind:value type="email" placeholder="you@example.com" class="pr-10" />
  <!-- Stays mounted so valid ↔ invalid morphs instead of remounting. -->
  <MorphIcon
    icon={EMAIL.test(value) ? Check : X}
    size={16}
    class={"pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 " + (value ? "" : "opacity-0")}${c.props}
  />
</div>
`,
        },
    },
    tree: {
        labels: ["folder", "folder-open"],
        tpl: {
            react: (c) => `${c.icons}


function TreeFolder({ name, children }: { name: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
      >
        <MorphIcon icon={open ? FolderOpen : Folder} size={16}${c.props} />
        {name}
      </button>
      {open && <div className="ml-4 border-l pl-3">{children}</div>}
    </div>
  );
}
`,
            vue: (c) => `<script setup lang="ts">
${c.icons}


defineProps<{ name: string }>();
const open = ref(false);
</script>

<template>
  <div>
    <button
      type="button"
      class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
      :aria-expanded="open"
      @click="open = !open"
    >
      <MorphIcon :icon="open ? FolderOpen : Folder" :size="16"${c.vProps} />
      {{ name }}
    </button>
    <div v-if="open" class="ml-4 border-l pl-3">
      <slot />
    </div>
  </div>
</template>
`,
            svelte: (c) => `<script lang="ts">
${indent(c.icons, "  ")}
  import { MorphIcon } from "morphicons/svelte";
  import type { Snippet } from "svelte";

  let { name, children }: { name: string; children?: Snippet } = $props();
  let open = $state(false);
</script>

<div>
  <button
    type="button"
    onclick={() => (open = !open)}
    aria-expanded={open}
    class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
  >
    <MorphIcon icon={open ? FolderOpen : Folder} size={16}${c.props} />
    {name}
  </button>
  {#if open}
    <div class="ml-4 border-l pl-3">{@render children?.()}</div>
  {/if}
</div>
`,
        },
    },
};
function snippet(id, o) {
    const { labels, tpl } = RECIPES[id];
    return tpl[o.framework]({
        icons: iconBlock(o.lib, labels),
        props: jsxProps(o),
        vProps: vueProps(o),
    });
}

return { init(b, d) { byId = b; dOf = d; }, snippet, FRAMEWORK_LABEL, REACT_LOGO, VUE_LOGO, SVELTE_LOGO };
})();
