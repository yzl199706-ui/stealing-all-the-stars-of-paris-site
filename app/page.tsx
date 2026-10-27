"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionTemplate, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { chapters, imagePaths, memory } from "./data/story";
import { StarlightCursor } from "../components/effects/StarlightCursor";
import { StarlightParticles } from "../components/effects/StarlightParticles";
import { StarIcon } from "../components/effects/StarIcon";
import { createMemoryCardPng } from "../components/keepsake/createMemoryCardPng";

const art = {
  opening: imagePaths.opening,
  encounter: imagePaths.encounter,
  treasures: imagePaths.treasures,
  seasons: imagePaths.spring,
  burning: imagePaths.burning,
  paris: imagePaths.paris,
  returning: imagePaths.return,
} as const;

type StoryKey = keyof typeof chapters;
const BACKGROUND_MUSIC_PATH = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/audio/background.mp3`;

function Ornament() {
  return <span className="ornament" aria-hidden="true"><i />✦<i /></span>;
}

function ScrollDrivenImage({ target, src, alt, sizes, priority = false }: { target: React.RefObject<HTMLElement | null>; src: string; alt: string; sizes: string; priority?: boolean }) {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 115, damping: 28, mass: .25 });
  const points = [0, .2, .42, .58, .8, 1];
  const brightness = useTransform(smoothProgress, points, reducedMotion ? [.72, .84, 1, 1, .84, .72] : [.36, .58, 1, 1, .58, .36]);
  const blur = useTransform(smoothProgress, points, reducedMotion ? [.8, .4, 0, 0, .4, .8] : [3, 1.5, 0, 0, 1.5, 3]);
  const filter = useMotionTemplate`brightness(${brightness}) blur(${blur}px)`;

  return <motion.div className="scroll-image-layer" data-scroll-reveal-image style={{ filter }}>
    <Image src={src} alt={alt} fill priority={priority} sizes={sizes} />
  </motion.div>;
}

function ArtFrame({ target, src, alt, caption, priority = false, children }: { target: React.RefObject<HTMLElement | null>; src: string; alt: string; caption: string; priority?: boolean; children?: React.ReactNode }) {
  return <figure className="art-frame">
    <ScrollDrivenImage target={target} src={src} alt={alt} priority={priority} sizes="(max-width: 760px) 100vw, 48vw" />
    <figcaption>{caption}</figcaption>
    {children}
  </figure>;
}

function ChapterHeading({ number, locale, title, english }: { number: string; locale: string; title: string; english: string }) {
  return <header className="chapter-heading">
    <span className="chapter-number" aria-hidden="true">{number}</span>
    <p className="locale">{locale}</p>
    <h2>{title}</h2>
    <p className="chapter-english">{english}</p>
    <Ornament />
  </header>;
}

function StoryLines({ lines }: { lines: readonly string[] }) {
  return <div className="story-lines">
    {lines.map((line, index) => <motion.p key={`${line}-${index}`} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .7 }} transition={{ duration: .7, delay: Math.min(index * .045, .4) }}>{line}</motion.p>)}
  </div>;
}

function EditorialChapter({ story, number, locale, image, imageAlt, caption, reversed = false, dark = false }: { story: StoryKey; number: string; locale: string; image: string; imageAlt: string; caption: string; reversed?: boolean; dark?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const content = chapters[story];
  return <section ref={sectionRef} data-scene={content.scene} className={`chapter-spread ${reversed ? "is-reversed" : ""} ${dark ? "is-dark" : ""}`}>
    <p className="margin-label">CHAPITRE {number}</p>
    <div className="spread-grid">
      <ArtFrame target={sectionRef} src={image} alt={imageAlt} caption={caption} />
      <article className="chapter-copy">
        <ChapterHeading number={number} locale={locale} title={content.number.replace(/^第.+?章 · /, "")} english={content.english} />
        <StoryLines lines={content.lines} />
      </article>
    </div>
  </section>;
}

function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.3;
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    try {
      if (unavailable) audio.load();
      audio.volume = 0.3;
      await audio.play();
      setUnavailable(false);
    } catch {
      setPlaying(false);
      setUnavailable(true);
    }
  };

  return <>
    <audio
      ref={audioRef}
      src={BACKGROUND_MUSIC_PATH}
      preload="none"
      loop
      playsInline
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onError={() => { setPlaying(false); setUnavailable(true); }}
    />
    <button
      data-starlight-interactive
      data-no-starlight
      className="music-toggle"
      onClick={togglePlayback}
      aria-pressed={playing}
      aria-label={unavailable ? "背景音乐文件尚未提供" : playing ? "关闭音乐" : "开启音乐"}
      title={unavailable ? "请上传已授权音频至 public/audio/background.mp3" : playing ? "暂停背景音乐" : "播放背景音乐"}
    >
      <span className={playing ? "music-mark is-playing" : "music-mark"}><i /><i /><i /></span>
      <span>{playing ? "ON" : "OFF"}</span>
    </button>
  </>;
}

function Opening() {
  return <section data-scene="opening" className="cover">
    <Image src={art.opening} alt="星空下的金色麦田、稻草人与白色渡鸦" fill priority sizes="100vw" />
    <div className="cover-wash" />
    <div className="cover-border" aria-hidden="true" />
    <div className="cover-content">
      <p className="cover-kicker">UNE HISTOIRE PRIVÉE · NOVEMBRE MMXXVI</p>
      <div className="cover-title-group">
        <p className="cover-french">Si le champ de blé se souvient de toi</p>
        <h1>如果麦田<br />还记得你</h1>
        <p className="cover-english">If the Wheat Field Remembers You</p>
        <Ornament />
        <p className="cover-byline">The Story of <em>Anna &amp; Alex</em></p>
      </div>
      <blockquote>“一只白色渡鸦，曾经改变了一具稻草人的整个世界。”</blockquote>
      <a href="#chapter-one" className="turn-page">tournez la page <span>↓</span></a>
    </div>
  </section>;
}

function Treasures() {
  const sectionRef = useRef<HTMLElement>(null);
  const [note, setNote] = useState<string | null>(null);
  const notes = ["谢谢你，让我知道世界还有其他颜色。", "谢谢你，愿意停在我的肩膀上。", "谢谢你，一次又一次地回来。"];
  return <section ref={sectionRef} data-scene="treasures" className="chapter-spread treasure-spread">
    <p className="margin-label">CHAPITRE 02</p>
    <div className="spread-grid is-reversed-grid">
      <ArtFrame target={sectionRef} src={art.treasures} alt="装饰着鲜花的稻草人与白色渡鸦，麦穗间散落着小小宝物" caption="Les petits trésors · étude de lumière">
        <div className="treasure-buttons">{notes.map((text, index) => <button key={text} data-starlight-interactive className={`treasure-gem gem-${index + 1}`} onClick={() => setNote(text)} aria-label={`打开第 ${index + 1} 颗宝石`}><StarIcon /></button>)}</div>
      </ArtFrame>
      <article className="chapter-copy">
        <ChapterHeading number="02" locale="Les trésors · après le coucher du soleil" title="闪闪发光的宝物" english="Little Treasures" />
        <StoryLines lines={chapters.treasures.lines} />
      </article>
    </div>
    <AnimatePresence>{note && <motion.button className="whisper-note" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onClick={() => setNote(null)}>{note}</motion.button>}</AnimatePresence>
  </section>;
}

function Seasons() {
  const sectionRef = useRef<HTMLElement>(null);
  const verses = [
    ["春", "Au printemps", "我想让你看看盛开的花。"],
    ["夏", "En été", "我想为你挡住炽热的阳光。"],
    ["秋", "En automne", "我想把最漂亮的麦穗留给你。"],
    ["冬", "En hiver", "我希望你有一个温暖的地方。"],
  ];
  return <section ref={sectionRef} data-scene="seasons" className="season-chapter">
    <div className="season-intro">
      <ChapterHeading number="03" locale="Le temps passe · le blé se souvient" title="四季" english="The Four Seasons" />
      <p>可惜那时候的我，<br />还只是一个不会行走的稻草人。</p>
    </div>
    <ArtFrame target={sectionRef} src={art.seasons} alt="同一片麦田从春花、夏日、秋叶过渡到冬雪，稻草人站在中央" caption="Quatre saisons · un même champ" />
    <div className="season-notes">{verses.map(([name, french, copy]) => <article key={name}><span>{name}</span><p>{french}</p><strong>{copy}</strong></article>)}</div>
  </section>;
}

function ParisChapter() {
  const sectionRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  return <section ref={sectionRef} data-scene="paris" className="paris-chapter">
    <ScrollDrivenImage target={sectionRef} src={art.paris} alt="安娜与艾利克斯站在塞纳河畔眺望巴黎夜景" sizes="100vw" />
    <div className="paris-overlay" />
    <div className="paris-layout">
      <article className="chapter-copy">
        <ChapterHeading number="05" locale="Paris · sous les étoiles" title="巴黎的星星" english="Under the Parisian Stars" />
        <StoryLines lines={chapters.paris.lines} />
      </article>
      <button data-starlight-interactive className="chocolate-box" onClick={() => setOpen(true)} aria-label="打开巧克力盒"><i /><span>chocolat</span></button>
    </div>
    <AnimatePresence>{open && <motion.button className="whisper-note on-dark" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>这一次，巧克力还没有融化。</motion.button>}</AnimatePresence>
  </section>;
}

function MemoryCard() {
  return <div className="memory-card">
    <div className="memory-stars" aria-hidden="true">✦　　　✧　　✦</div>
    <p className="card-kicker">A NIGHT TO REMEMBER</p>
    <h3>{memory.names}</h3>
    <Ornament />
    <p className="card-detail">{memory.date}<br />{memory.location}</p>
    <p className="card-copy">故事里的艾利克斯，<br />没能留住所有的星星。<br /><br />但故事外的我们，<br />留下了这个夜晚。</p>
    <p className="card-en">The story may end,<br />but this night will remain.</p>
    <p className="card-sign">谢谢你，成为那天的安娜。<br />也谢谢那个夜晚，<br />让我有机会成为艾利克斯。</p>
  </div>;
}

function Keepsake() {
  const exportUrlRef = useRef<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hint, setHint] = useState("");
  const [exportPreviewUrl, setExportPreviewUrl] = useState("");

  useEffect(() => () => {
    if (exportUrlRef.current) URL.revokeObjectURL(exportUrlRef.current);
  }, []);

  const save = async () => {
    if (saving) return;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    // iOS only permits new tabs opened synchronously from the original tap.
    const previewWindow = isIOS ? window.open("", "_blank") : null;
    setSaving(true);
    setHint("");
    try {
      const blob = await createMemoryCardPng();
      if (exportUrlRef.current) URL.revokeObjectURL(exportUrlRef.current);
      const url = URL.createObjectURL(blob);
      exportUrlRef.current = url;
      setExportPreviewUrl(url);

      if (isIOS) {
        if (previewWindow) previewWindow.location.replace(url);
        else {
          const previewLink = document.createElement("a");
          previewLink.href = url;
          previewLink.target = "_blank";
          previewLink.rel = "noopener noreferrer";
          document.body.appendChild(previewLink);
          previewLink.click();
          previewLink.remove();
        }
        setHint("已打开高清纪念卡，请长按图片保存到相册。");
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = "anna-alex-a-night-to-remember.png";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setHint("纪念卡已开始下载。");
      }
    } catch {
      previewWindow?.close();
      setHint("暂时无法生成图片，请稍后重试。");
    } finally {
      setSaving(false);
    }
  };
  return <section data-scene="memory" className="keepsake-section">
    <div className="keepsake-heading"><p>Los Angeles · le premier novembre</p><h2>那个夜晚</h2><span>A Night to Remember</span></div>
    <MemoryCard />
    <button data-starlight-interactive className="save-button" onClick={save}>{saving ? "正在绘制…" : "保存纪念卡"}</button>
    {hint && <p className="save-hint" role="status">{hint}</p>}
    {exportPreviewUrl && <>
      {/* This hidden native image is a lightweight verification target for the generated Blob, not page content. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img hidden data-memory-card-export-preview src={exportPreviewUrl} alt="" aria-hidden="true" />
    </>}
  </section>;
}

function HiddenEnding() {
  const reduced = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const reveal = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    window.dispatchEvent(new CustomEvent("starlight-burst", { detail: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } }));
    window.setTimeout(() => setRevealed(true), reduced ? 0 : 900);
  };
  return <section data-scene="ending" className={`hidden-ending ${revealed ? "is-revealed" : ""}`}>
    <Image src={art.opening} alt="夜空下的麦田、稻草人与白色渡鸦" fill sizes="100vw" />
    <div className="ending-wash" />
    <AnimatePresence mode="wait">{!revealed ? <motion.div key="star" className="last-star-stage" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
      <p>还有一颗星星，没有被带走。</p>
      <button data-starlight-interactive className="last-star" onClick={reveal} aria-label="轻触最后一颗星星"><StarIcon /></button>
      <span>轻触星星</span>
    </motion.div> : <motion.div key="final" className="final-message" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? .2 : 1.25 }}>
      <p className="final-kicker">Pour</p><h2>Anna &amp; Alex</h2><p>The Scarecrow &amp; The White Raven</p><Ornament /><p>{memory.game}<br />{memory.date}<br />Los Angeles</p><blockquote>故事会落幕。<br />但麦田记得，<br />那只白色渡鸦曾经来过。</blockquote><small>Fin. …ou peut-être, à suivre.</small>
    </motion.div>}</AnimatePresence>
  </section>;
}

export default function Home() {
  return <main>
    <StarlightCursor />
    <StarlightParticles />
    <MusicToggle />
    <Opening />
    <div id="chapter-one"><EditorialChapter story="encounter" number="01" locale="Le champ de blé · un soir doré" image={art.encounter} imageAlt="白色渡鸦第一次停在稻草人的肩膀上" caption="La première rencontre · étude de lumière" /></div>
    <Treasures />
    <Seasons />
    <EditorialChapter story="burning" number="04" locale="Le champ en feu · avant la nuit" image={art.burning} imageAlt="远处的麦田火光、稻草人与盘旋的白色渡鸦" caption="Le feu au loin · après le silence" reversed dark />
    <ParisChapter />
    <EditorialChapter story="return" number="06" locale="La nuit · là où les étoiles reviennent" image={art.returning} imageAlt="星空下的麦田，白色渡鸦飞向远方" caption="Le retour des étoiles · la dernière lumière" dark />
    <Keepsake />
    <HiddenEnding />
  </main>;
}
