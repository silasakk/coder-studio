"use client";

import React, { useState } from "react";
import Link from "next/link";
import Button3D from "@/components/game/Button3D";
import Badge3D from "@/components/game/Badge3D";
import Card3D from "@/components/game/Card3D";
import Input3D from "@/components/game/Input3D";
import Checkbox3D from "@/components/game/Checkbox3D";
import Toggle3D from "@/components/game/Toggle3D";
import Combobox3D from "@/components/game/Combobox3D";
import Breadcrumb3D from "@/components/game/Breadcrumb3D";
import Navbar3D from "@/components/game/Navbar3D";
import Dialog3D from "@/components/game/Dialog3D";
import Popup3D from "@/components/game/Popup3D";
import Alert3D from "@/components/game/Alert3D";
import Carousel3D from "@/components/game/Carousel3D";
import Collapse3D from "@/components/game/Collapse3D";
import ProgressBar3D from "@/components/game/ProgressBar3D";
import MascotBubble from "@/components/game/MascotBubble";

// Import all 17 new components
import Dropdown3D from "@/components/game/Dropdown3D";
import Tabs3D from "@/components/game/Tabs3D";
import Steps3D from "@/components/game/Steps3D";
import Timeline3D from "@/components/game/Timeline3D";
import Pagination3D from "@/components/game/Pagination3D";
import Toast3D from "@/components/game/Toast3D";
import Table3D from "@/components/game/Table3D";
import Rating3D from "@/components/game/Rating3D";
import Kbd3D from "@/components/game/Kbd3D";
import Stat3D from "@/components/game/Stat3D";
import Textarea3D from "@/components/game/Textarea3D";
import Radio3D from "@/components/game/Radio3D";
import Range3D from "@/components/game/Range3D";
import Hero3D from "@/components/game/Hero3D";
import Loading3D from "@/components/game/Loading3D";
import Sidebar3D from "@/components/game/Sidebar3D";
import FileInput3D from "@/components/game/FileInput3D";

import { CodeHighlight } from "@/components/ui/CodeHighlight";

// Import sharp Lucide icons for documentation sidebar and details
import {
  BookOpen,
  Palette,
  Square,
  Award,
  Layers,
  Type,
  CheckSquare,
  ToggleLeft,
  ChevronDown,
  Navigation,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Sliders,
  User,
  Check,
  X,
  Sparkles,
  Info,
  ChevronRight,
  Flame,
  Star,
  Shield,
  Search,
  List,
  Menu,
  Activity,
  Upload,
  Database,
  ArrowRight,
  Keyboard,
  FileText,
  Sun,
  Moon
} from "lucide-react";

// Sidebar component ID types (35 components + intro + tokens)
type ComponentId =
  | "intro"
  | "tokens"
  | "button3d"
  | "badge3d"
  | "card3d"
  | "input3d"
  | "checkbox3d"
  | "toggle3d"
  | "combobox3d"
  | "breadcrumb3d"
  | "navbar3d"
  | "dialog3d"
  | "popup3d"
  | "alert3d"
  | "carousel3d"
  | "collapse3d"
  | "progressbar3d"
  | "mascotbubble"
  // NEW ADDITIONS:
  | "dropdown3d"
  | "tabs3d"
  | "steps3d"
  | "timeline3d"
  | "pagination3d"
  | "toast3d"
  | "table3d"
  | "rating3d"
  | "kbd3d"
  | "stat3d"
  | "textarea3d"
  | "radio3d"
  | "range3d"
  | "hero3d"
  | "loading3d"
  | "sidebar3d"
  | "fileinput3d";

const ALL_COMPONENTS: { id: ComponentId; label: string; category: string }[] = [
  { id: "intro", label: "Introduction", category: "Getting Started" },
  { id: "tokens", label: "Tokens & Palette", category: "Getting Started" },
  { id: "button3d", label: "Button", category: "General Primitives" },
  { id: "badge3d", label: "Badge", category: "General Primitives" },
  { id: "card3d", label: "Card", category: "General Primitives" },
  { id: "kbd3d", label: "Keyboard Keycap", category: "General Primitives" },
  { id: "loading3d", label: "Loading Spinner", category: "General Primitives" },
  { id: "input3d", label: "Text Input", category: "Forms & Inputs" },
  { id: "textarea3d", label: "Textarea", category: "Forms & Inputs" },
  { id: "checkbox3d", label: "Checkbox", category: "Forms & Inputs" },
  { id: "radio3d", label: "Radio Button", category: "Forms & Inputs" },
  { id: "toggle3d", label: "Toggle Switch", category: "Forms & Inputs" },
  { id: "combobox3d", label: "Search Combobox", category: "Forms & Inputs" },
  { id: "dropdown3d", label: "Dropdown Menu", category: "Forms & Inputs" },
  { id: "range3d", label: "Range Slider", category: "Forms & Inputs" },
  { id: "fileinput3d", label: "File Uploader", category: "Forms & Inputs" },
  { id: "breadcrumb3d", label: "Breadcrumbs", category: "Navigations" },
  { id: "navbar3d", label: "Navbar", category: "Navigations" },
  { id: "tabs3d", label: "Navigation Tabs", category: "Navigations" },
  { id: "steps3d", label: "Steps Indicator", category: "Navigations" },
  { id: "pagination3d", label: "Pagination", category: "Navigations" },
  { id: "sidebar3d", label: "Sidebar Menu", category: "Navigations" },
  { id: "dialog3d", label: "Modal Dialog", category: "Overlays & Feedback" },
  { id: "popup3d", label: "Tooltip Popover", category: "Overlays & Feedback" },
  { id: "alert3d", label: "Alert Banner", category: "Overlays & Feedback" },
  { id: "toast3d", label: "Toast Notification", category: "Overlays & Feedback" },
  { id: "carousel3d", label: "Carousel", category: "Data & Interactive" },
  { id: "collapse3d", label: "Accordion Collapse", category: "Data & Interactive" },
  { id: "progressbar3d", label: "Progress Bar", category: "Data & Interactive" },
  { id: "mascotbubble", label: "Mascot Bubble", category: "Data & Interactive" },
  { id: "timeline3d", label: "Roadmap Timeline", category: "Data & Interactive" },
  { id: "table3d", label: "Data Table", category: "Data & Interactive" },
  { id: "rating3d", label: "Star Rating", category: "Data & Interactive" },
  { id: "stat3d", label: "Scoreboard Stats", category: "Data & Interactive" },
  { id: "hero3d", label: "Hero Banner", category: "Data & Interactive" },
];

const BG_PRESETS = [
  { key: "default", label: "Default", light: "#f8fafc", dark: "#020617" },
  { key: "blue",    label: "Blue",    light: "#eff6ff", dark: "#0c1a33" },
  { key: "purple",  label: "Purple",  light: "#faf5ff", dark: "#150c2e" },
  { key: "rose",    label: "Rose",    light: "#fff1f2", dark: "#1f0a0c" },
  { key: "green",   label: "Green",   light: "#f0fdf4", dark: "#052e16" },
  { key: "warm",    label: "Warm",    light: "#fefce8", dark: "#1c1400" },
];

export default function DesignSystemCatalog() {
  const [activeComponent, setActiveComponent] = useState<ComponentId>("intro");

  // Theme Toggling State
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  // Background preset state
  const [bgPreset, setBgPreset] = useState("default");
  const [showBgPicker, setShowBgPicker] = useState(false);

  const currentBg = BG_PRESETS.find((p) => p.key === bgPreset) ?? BG_PRESETS[0];
  const bgStyle = { backgroundColor: isDark ? currentBg.dark : currentBg.light };

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Real Search functionality state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(-1);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard Shortcuts Effect
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "/") {
        const activeEl = document.activeElement;
        if (
          activeEl &&
          (activeEl.tagName === "INPUT" ||
            activeEl.tagName === "TEXTAREA" ||
            activeEl.hasAttribute("contenteditable"))
        ) {
          return;
        }
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter components by search term
  const filteredComponents = searchQuery
    ? ALL_COMPONENTS.filter(
        (c) =>
          c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchSelectedIndex((prev) =>
        prev < filteredComponents.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSearchSelectedIndex((prev) => (prev > -1 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchSelectedIndex >= 0 && searchSelectedIndex < filteredComponents.length) {
        const selected = filteredComponents[searchSelectedIndex];
        setActiveComponent(selected.id);
        setSearchQuery("");
        setIsSearchFocused(false);
        setSearchSelectedIndex(-1);
        searchInputRef.current?.blur();
      } else if (filteredComponents.length > 0) {
        setActiveComponent(filteredComponents[0].id);
        setSearchQuery("");
        setIsSearchFocused(false);
        setSearchSelectedIndex(-1);
        searchInputRef.current?.blur();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setSearchQuery("");
      setIsSearchFocused(false);
      setSearchSelectedIndex(-1);
      searchInputRef.current?.blur();
    }
  };

  // Preview vs Code tabs
  const [activeTabs, setActiveTabs] = useState<Record<string, "preview" | "code">>({});

  // Interactive states
  const [btnCount, setBtnCount] = useState(0);
  const [badgeState, setBadgeState] = useState<Record<string, boolean>>({
    crown: true,
    streak: true,
    star: false,
    shield: false,
  });
  const [textInput, setTextInput] = useState("");
  const [textError, setTextError] = useState("");
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [toggleVal, setToggleVal] = useState(false);
  const [comboVal, setComboVal] = useState("nextjs");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "failure" | "levelUp">("success");
  const [progressVal, setProgressVal] = useState(70);
  const [mascotIdx, setMascotIdx] = useState<1 | 2 | 3>(1);
  const [mascotAlign, setMascotAlign] = useState<"left" | "right">("left");

  // NEW INTERACTIVE STATES
  const [dropdownVal, setDropdownVal] = useState("html");
  const [activeTabId, setActiveTabId] = useState("overview");
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastVal, setToastVal] = useState(false);
  const [toastType, setToastType] = useState<"info" | "success" | "warning" | "error">("info");
  const [ratingVal, setRatingVal] = useState(4);
  const [textareaVal, setTextareaVal] = useState("");
  const [radioVal, setRadioVal] = useState(true);
  const [rangeVal, setRangeVal] = useState(50);
  const [loadType, setLoadType] = useState<"dots" | "spin-star" | "spinner">("dots");

  const getTab = (compId: string) => activeTabs[compId] || "preview";
  
  const toggleTab = (compId: string, tab: "preview" | "code") => {
    setActiveTabs((prev) => ({ ...prev, [compId]: tab }));
  };

  // Dropdown options
  const dropdownOptions = [
    { label: "HTML5 Structure", value: "html", icon: <Layers className="w-3.5 h-3.5 text-orange-500" /> },
    { label: "CSS3 Playful Styling", value: "css", icon: <Palette className="w-3.5 h-3.5 text-blue-500" /> },
    { label: "JavaScript Engine", value: "javascript", icon: <Activity className="w-3.5 h-3.5 text-yellow-500" /> },
    { label: "React Framework", value: "react", icon: <Sparkles className="w-3.5 h-3.5 text-cyan-500" />, disabled: true },
  ];

  // Tab items
  const tabItems = [
    { id: "overview", label: "ภาพรวมเรียนรู้", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: "tasks", label: "โจทย์ปฏิบัติ", icon: <Activity className="w-3.5 h-3.5" /> },
    { id: "stats", label: "อันดับคะแนน", icon: <Database className="w-3.5 h-3.5" /> },
  ];

  // List of search options for Combobox
  const comboOptions = [
    { label: "React.js", value: "react" },
    { label: "Next.js", value: "nextjs" },
    { label: "Tailwind CSS v4", value: "tailwind" },
    { label: "TypeScript", value: "typescript" },
    { label: "ESLint", value: "eslint" },
  ];

  // Steps mock items
  const stepItems = [
    { label: "บทนำ HTML", desc: "เรียนรู้แท็กพื้นฐาน" },
    { label: "จัดการ CSS", desc: "จัดแต่งสไตล์แบบ 3D" },
    { label: "ลูป JS", desc: "ท้าทายโจทย์เขียนเงื่อนไข" },
  ];

  // Timeline mock items
  const timelineItems = [
    { id: "1", title: "เริ่มด่านที่ 1", desc: "ประกอบแท็กโครงสร้างเว็บ", completed: true },
    { id: "2", title: "ลุยด่านที่ 2", desc: "ตกแต่ง Atlassian Blue มิติ", active: true },
    { id: "3", title: "ผ่านด่านที่ 3", desc: "เขียนโค้ด React Bouncy", active: false },
  ];

  // Table mock headers & rows
  const tableHeaders = ["อันดับ", "ชื่อผู้เรียน", "คะแนนรวม (XP)", "เหรียญรางวัล"];
  const tableRows = [
    [
      <span key={1} className="font-extrabold text-brand-blue font-mono">#1</span>,
      <span key={2}>น้องแพน (Silasak)</span>,
      <span key={3} className="font-extrabold text-game-success font-mono">2,450 XP</span>,
      <div key={4} className="flex gap-1.5"><Badge3D type="crown" size="sm" /><Badge3D type="streak" size="sm" /></div>
    ],
    [
      <span key={1} className="font-extrabold text-slate-400 font-mono">#2</span>,
      <span key={2}>พี่แชดี้ (Coding Master)</span>,
      <span key={3} className="font-extrabold font-mono">1,820 XP</span>,
      <div key={4} className="flex gap-1.5"><Badge3D type="star" size="sm" /></div>
    ],
    [
      <span key={1} className="font-extrabold text-slate-400 font-mono">#3</span>,
      <span key={2}>เจ้าคูโร่ (Junior Bot)</span>,
      <span key={3} className="font-extrabold font-mono">920 XP</span>,
      <div key={4} className="flex gap-1.5"><Badge3D type="shield" size="sm" active={false} /></div>
    ]
  ];

  // Sidebar navigation options
  const sidebarItems = [
    { id: "home", label: "แดชบอร์ดหลัก", icon: <Sliders className="w-4 h-4" />, active: true },
    { id: "lessons", label: "ห้องเรียนโปรแกรมมิ่ง", icon: <BookOpen className="w-4 h-4" /> },
    { id: "settings", label: "การตั้งค่าระบบ", icon: <Palette className="w-4 h-4" /> },
  ];

  // Full Code Snippets for all 35 components
  const snippets: Record<string, string> = {
    button3d: `import Button3D from "@/components/game/Button3D";

<Button3D variant="primary" size="md">ปุ่มหลัก Blue</Button3D>
<Button3D variant="success" size="lg">สำเร็จ Green</Button3D>
<Button3D variant="secondary" disabled={true}>ล็อก Muted</Button3D>`,

    badge3d: `import Badge3D from "@/components/game/Badge3D";

<Badge3D type="crown" label="มงกุฎทอง" active={true} />
<Badge3D type="streak" label="ขยันไฟลุก" active={false} />`,

    card3d: `import Card3D from "@/components/game/Card3D";

<Card3D title="บทเรียนฟังก์ชันหลัก" hoverable={true}>
  <p>เรียนรู้วิธีการประกาศฟังก์ชันแบบ 3 มิติ และก้าวข้ามขีดจำกัดด้วยความสนุกสนาน!</p>
</Card3D>`,

    input3d: `import Input3D from "@/components/game/Input3D";

<Input3D
  label="ชื่อผู้ใช้งาน"
  placeholder="กรอกชื่อของคุณ..."
  value={value}
  onChange={handleChange}
  error={error}
/>`,

    checkbox3d: `import Checkbox3D from "@/components/game/Checkbox3D";

<Checkbox3D
  label="ยอมรับเงื่อนไขการเรียนรู้สะสม"
  checked={checked}
  onChange={setChecked}
/>`,

    toggle3d: `import Toggle3D from "@/components/game/Toggle3D";

<Toggle3D
  label="เปิดโหมดเสียงมาสคอต"
  checked={checked}
  onChange={setChecked}
/>`,

    combobox3d: `import Combobox3D from "@/components/game/Combobox3D";

<Combobox3D
  label="เทคโนโลยีฐาน"
  options={[
    { label: "Next.js", value: "nextjs" },
    { label: "Tailwind CSS", value: "tailwind" }
  ]}
  value={value}
  onChange={setValue}
/>`,

    breadcrumb3d: `import Breadcrumb3D from "@/components/game/Breadcrumb3D";

<Breadcrumb3D
  items={[
    { label: "บทเรียนหลัก", href: "/lessons" },
    { label: "ตัวเลือกคอมโพเนนต์", active: true }
  ]}
/>`,

    navbar3d: `import Navbar3D from "@/components/game/Navbar3D";

<Navbar3D
  brandName="Coder Studio"
  links={[
    { label: "คลังแสง UI", href: "/design-system" },
    { label: "ช่วยเหลือ", href: "/docs" }
  ]}
/>`,

    dialog3d: `import Dialog3D from "@/components/game/Dialog3D";

<Dialog3D
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  type="levelUp"
  title="ยินดีต้อนรับสู่เลเวลใหม่!"
>
  คุณเรียนรู้ครบถ้วนและได้รับป้ายเหรียญรางวัลพิเศษสะสมเพิ่มเติม!
</Dialog3D>`,

    popup3d: `import Popup3D from "@/components/game/Popup3D";
import Button3D from "@/components/game/Button3D";

<Popup3D
  trigger={<Button3D size="sm">ชี้เมาส์ที่ฉัน</Button3D>}
  content={<p>ยินดีต้อนรับ! นี่คือกล่องทูลทิปลอยขยับสั่นได้ดุ๊กดิ๊ก</p>}
  position="top"
/>`,

    alert3d: `import Alert3D from "@/components/game/Alert3D";

<Alert3D title="ยินดีด้วย!" type="success">
  คุณทำภารกิจเขียนโค้ดติ้งและส่งคำตอบได้สำเร็จลุล่วงแล้ว!
</Alert3D>`,

    carousel3d: `import Carousel3D from "@/components/game/Carousel3D";

<Carousel3D
  slides={[
    <div key={1}>สไลด์ที่ 1</div>,
    <div key={2}>สไลด์ที่ 2</div>
  ]}
/>`,

    collapse3d: `import Collapse3D from "@/components/game/Collapse3D";

<Collapse3D title="คลิกเปิดดูคำใบ้ด่านเขียนโค้ด">
  ฟังก์ชันนี้ต้องใช้คำสั่ง return คืนค่ากลับมาเพื่อให้ระบบประมวลผลผ่านฉลุย!
</Collapse3D>`,

    progressbar3d: `import ProgressBar3D from "@/components/game/ProgressBar3D";

<ProgressBar3D
  value={75}
  color="brand"
  showPercentage={true}
/>`,

    mascotbubble: `import MascotBubble from "@/components/game/MascotBubble";

<MascotBubble
  mascotIndex={1}
  alignment="left"
  text="สวัสดีครับน้องแพน! น้องมาสคอตเดี่ยวถูกลบพื้นหลังคมชัดเรียบร้อยลอยขยับได้ครับ!"
/>`,

    dropdown3d: `import Dropdown3D from "@/components/game/Dropdown3D";

<Dropdown3D
  label="เลือกภาษาหลัก"
  options={[
    { label: "HTML5", value: "html" },
    { label: "CSS3", value: "css" }
  ]}
  value={value}
  onChange={setValue}
/>`,

    tabs3d: `import Tabs3D from "@/components/game/Tabs3D";

<Tabs3D
  items={[
    { id: "overview", label: "ภาพรวม" },
    { id: "tasks", label: "โจทย์วิจัย" }
  ]}
  activeId={activeId}
  onChange={setActiveId}
/>`,

    steps3d: `import Steps3D from "@/components/game/Steps3D";

<Steps3D
  steps={[
    { label: "แท็กเว็บ", desc: "HTML" },
    { label: "จัดโครง", desc: "CSS" }
  ]}
  currentStep={0}
/>`,

    timeline3d: `import Timeline3D from "@/components/game/Timeline3D";

<Timeline3D
  items={[
    { id: "1", title: "เริ่มภารกิจ", completed: true },
    { id: "2", title: "กำลังท้าทาย", active: true }
  ]}
/>`,

    pagination3d: `import Pagination3D from "@/components/game/Pagination3D";

<Pagination3D
  currentPage={currentPage}
  totalPages={5}
  onPageChange={setCurrentPage}
/>`,

    toast3d: `import Toast3D from "@/components/game/Toast3D";

<Toast3D
  isVisible={isVisible}
  message="ทำคำตอบถูกต้อง ด่านต่อไปปลดล็อกแล้ว!"
  title="สำเร็จแล้ว!"
  type="success"
  onClose={() => setIsVisible(false)}
/>`,

    table3d: `import Table3D from "@/components/game/Table3D";

<Table3D
  headers={["อันดับ", "ชื่อ"]}
  rows={[
    [<span>#1</span>, <span>แพน</span>],
    [<span>#2</span>, <span>คูโร่</span>]
  ]}
/>`,

    rating3d: `import Rating3D from "@/components/game/Rating3D";

<Rating3D
  value={rating}
  onChange={setRating}
  max={5}
/>`,

    kbd3d: `import Kbd3D from "@/components/game/Kbd3D";

กดปุ่ม <Kbd3D>⌘K</Kbd3D> หรือ <Kbd3D size="sm">Enter</Kbd3D>`,

    stat3d: `import Stat3D from "@/components/game/Stat3D";

<Stat3D
  label="คะแนนสะสม (XP)"
  value="2,450 XP"
  variant="primary"
/>`,

    textarea3d: `import Textarea3D from "@/components/game/Textarea3D";

<Textarea3D
  label="ส่งรหัสโค้ดคำตอบ"
  placeholder="พิมพ์โค้ดโปรแกรม..."
  rows={5}
/>`,

    radio3d: `import Radio3D from "@/components/game/Radio3D";

<Radio3D
  label="เปิดสวิตช์ระบบตอบรับ"
  checked={checked}
  onChange={setChecked}
/>`,

    range3d: `import Range3D from "@/components/game/Range3D";

<Range3D
  label="ระดับพลังเสียง"
  value={value}
  onChange={setValue}
/>`,

    hero3d: `import Hero3D from "@/components/game/Hero3D";

<Hero3D
  title="ก้าวข้ามขีดจำกัดโปรแกรมเมอร์"
  subtitle="หลักสูตรเรียนรู้สนุกสไตล์เกมแบบเห็นภาพสะใจ"
/>`,

    loading3d: `import Loading3D from "@/components/game/Loading3D";

<Loading3D type="dots" color="brand" />`,

    sidebar3d: `import Sidebar3D from "@/components/game/Sidebar3D";

<Sidebar3D
  items={[
    { id: "dashboard", label: "ภาพรวม", active: true }
  ]}
/>`,

    fileinput3d: `import FileInput3D from "@/components/game/FileInput3D";

<FileInput3D
  label="ส่งงานรายงานผล"
  onChange={(files) => console.log(files)}
/>`,
  };

  return (
    <div className="min-h-screen flex flex-col font-sans select-none antialiased text-left transition-colors duration-200" style={bgStyle}>
      {/* 1. TOP NAVBAR HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-6 h-14 flex items-center justify-between shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-85 active:scale-95 transition-all">
            <span className="w-6 h-6 rounded-lg bg-brand-blue flex items-center justify-center text-white text-xs font-black shadow-md">
              C
            </span>
            <span className="font-black text-slate-800 dark:text-slate-100 text-sm tracking-tight uppercase">
              Coder Studio <span className="text-brand-blue text-xs lowercase">ui</span>
            </span>
          </Link>
          <span className="text-[10px] bg-blue-50 dark:bg-slate-900/50 text-brand-blue dark:text-blue-400 font-extrabold px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40">
            3D-Style Framework
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Functional Search Box */}
          <div className="relative hidden sm:block">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 border-2 border-b-[4px] border-slate-200 dark:border-slate-950 rounded-xl text-slate-400 text-xs w-48 focus-within:border-brand-blue focus-within:border-b-brand-blue-hover focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchSelectedIndex(-1);
                }}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  // Small timeout to let onMouseDown register before hiding
                  setTimeout(() => setIsSearchFocused(false), 200);
                }}
                placeholder="ค้นหาคลังแสง..."
                className="bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 w-full font-bold text-xs"
              />
              <kbd className="pointer-events-none inline-flex h-4 items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 font-mono text-[9px] font-medium text-slate-400">
                ⌘K
              </kbd>
            </div>

            {/* Search Dropdown Results */}
            {isSearchFocused && searchQuery && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-900 border-2 border-b-[6px] border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-pop-in">
                {filteredComponents.length > 0 ? (
                  <div className="p-2 flex flex-col gap-1 max-h-64 overflow-y-auto">
                    {filteredComponents.map((comp, idx) => (
                      <button
                        key={comp.id}
                        onMouseDown={() => {
                          setActiveComponent(comp.id);
                          setSearchQuery("");
                          setIsSearchFocused(false);
                          setSearchSelectedIndex(-1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-black transition-colors flex flex-col gap-0.5 cursor-pointer ${
                          idx === searchSelectedIndex
                            ? "bg-blue-50 dark:bg-slate-800 text-brand-blue dark:text-blue-400"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <span className="font-extrabold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">{comp.category}</span>
                        <span>{comp.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs font-bold text-slate-400">
                    ไม่พบส่วนประกอบที่ค้นหา 😢
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Background Color Picker */}
          <div className="relative">
            <button
              onClick={() => setShowBgPicker((v) => !v)}
              className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border-2 border-b-[4px] border-slate-200 dark:border-slate-950 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 active:border-b-[2px] active:translate-y-[2px] transition-all duration-100 cursor-pointer"
              title="เปลี่ยน Background"
            >
              <span
                className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 shadow-sm"
                style={{ backgroundColor: isDark ? currentBg.dark : currentBg.light, filter: "saturate(3)" }}
              />
            </button>
            {showBgPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowBgPicker(false)} />
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-900 border-2 border-b-[6px] border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 z-50 flex flex-col gap-1.5 min-w-[140px]">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 mb-0.5">Background</span>
                {BG_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => { setBgPreset(preset.key); setShowBgPicker(false); }}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                      bgPreset === preset.key
                        ? "bg-blue-50 dark:bg-slate-800 text-brand-blue dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-600 flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: isDark ? preset.dark : preset.light, filter: "saturate(3)" }}
                    />
                    {preset.label}
                  </button>
                ))}
              </div>
              </>
            )}
          </div>

          {/* 3D Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border-2 border-b-[4px] border-slate-200 dark:border-slate-950 flex items-center justify-center text-slate-500 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 active:border-b-[2px] active:translate-y-[2px] transition-all duration-100 cursor-pointer"
            title="สลับธีม (Light/Dark)"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-game-warning animate-pulse" />
            ) : (
              <Moon className="w-4 h-4 text-brand-blue" />
            )}
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border-2 border-b-[4px] border-slate-200 dark:border-slate-950 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 active:border-b-[2px] active:translate-y-[2px] transition-all duration-100 cursor-pointer"
            title="เมนู"
          >
            <Menu className="w-4 h-4" />
          </button>

          <span className="text-slate-500 dark:text-slate-400 font-extrabold text-xs hidden sm:block">v2.0.0</span>
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Drawer panel */}
          <aside className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 h-14 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
              <span className="font-black text-slate-800 dark:text-slate-100 text-sm tracking-tight uppercase">เมนูหลัก</span>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="w-8 h-8 rounded-xl border-2 border-b-[3px] border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-6 flex-grow">
              {[
                {
                  title: "Getting Started",
                  items: [
                    { id: "intro", label: "Introduction" },
                    { id: "tokens", label: "Tokens & Palette" },
                  ],
                },
                {
                  title: "General Primitives",
                  items: [
                    { id: "button3d", label: "Button" },
                    { id: "badge3d", label: "Badge" },
                    { id: "card3d", label: "Card" },
                    { id: "kbd3d", label: "Keyboard Keycap" },
                    { id: "loading3d", label: "Loading Spinner" },
                  ],
                },
                {
                  title: "Forms & Inputs",
                  items: [
                    { id: "input3d", label: "Text Input" },
                    { id: "textarea3d", label: "Textarea" },
                    { id: "checkbox3d", label: "Checkbox" },
                    { id: "radio3d", label: "Radio Button" },
                    { id: "toggle3d", label: "Toggle Switch" },
                    { id: "combobox3d", label: "Search Combobox" },
                    { id: "dropdown3d", label: "Dropdown Menu" },
                    { id: "range3d", label: "Range Slider" },
                    { id: "fileinput3d", label: "File Uploader" },
                  ],
                },
                {
                  title: "Navigations",
                  items: [
                    { id: "breadcrumb3d", label: "Breadcrumbs" },
                    { id: "navbar3d", label: "Navbar" },
                    { id: "tabs3d", label: "Navigation Tabs" },
                    { id: "steps3d", label: "Steps Indicator" },
                    { id: "pagination3d", label: "Pagination" },
                    { id: "sidebar3d", label: "Sidebar Menu" },
                  ],
                },
                {
                  title: "Overlays & Feedback",
                  items: [
                    { id: "dialog3d", label: "Modal Dialog" },
                    { id: "popup3d", label: "Tooltip Popover" },
                    { id: "alert3d", label: "Alert Banner" },
                    { id: "toast3d", label: "Toast Notification" },
                  ],
                },
                {
                  title: "Data & Interactive",
                  items: [
                    { id: "carousel3d", label: "Carousel" },
                    { id: "collapse3d", label: "Accordion Collapse" },
                    { id: "progressbar3d", label: "Progress Bar" },
                    { id: "mascotbubble", label: "Mascot Bubble" },
                    { id: "timeline3d", label: "Roadmap Timeline" },
                    { id: "table3d", label: "Data Table" },
                    { id: "rating3d", label: "Star Rating" },
                    { id: "stat3d", label: "Scoreboard Stats" },
                    { id: "hero3d", label: "Hero Banner" },
                  ],
                },
              ].map((section) => (
                <div key={section.title}>
                  <h4 className="px-2 mb-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                    {section.title}
                  </h4>
                  <div className="flex flex-col gap-1">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveComponent(item.id as ComponentId); setIsMobileSidebarOpen(false); }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-black transition-colors block cursor-pointer ${
                          activeComponent === item.id
                            ? "bg-blue-50 dark:bg-slate-800/60 text-brand-blue dark:text-blue-400"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* 2. BODY WORKSPACE */}
      <div className="flex-grow flex w-full max-w-[1400px] mx-auto">
        
        {/* Left Sidebar Document Navigation Categories */}
        <aside className="hidden md:block w-72 border-r border-slate-200 dark:border-slate-800 p-6 flex-shrink-0 text-left overflow-y-auto max-h-[calc(100vh-3.5rem)] bg-white dark:bg-slate-900 transition-colors duration-200">
          <div className="space-y-6">
            
            {/* GETTING STARTED */}
            <div>
              <h4 className="px-2 mb-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                Getting Started
              </h4>
              <div className="flex flex-col gap-1">
                {[
                  { id: "intro", label: "Introduction" },
                  { id: "tokens", label: "Tokens & Palette" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveComponent(item.id as any)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-black transition-colors block cursor-pointer ${
                      activeComponent === item.id
                        ? "bg-blue-50 dark:bg-slate-800/60 text-brand-blue dark:text-blue-450"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* GENERAL ELEMENTS */}
            <div>
              <h4 className="px-2 mb-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                General Primitives
              </h4>
              <div className="flex flex-col gap-1">
                {[
                  { id: "button3d", label: "Button" },
                  { id: "badge3d", label: "Badge" },
                  { id: "card3d", label: "Card" },
                  { id: "kbd3d", label: "Keyboard Keycap" },
                  { id: "loading3d", label: "Loading Spinner" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveComponent(item.id as any)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-black transition-colors block cursor-pointer ${
                      activeComponent === item.id
                        ? "bg-blue-50 dark:bg-slate-800/60 text-brand-blue dark:text-blue-450"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FORMS & INPUTS */}
            <div>
              <h4 className="px-2 mb-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                Forms & Inputs
              </h4>
              <div className="flex flex-col gap-1">
                {[
                  { id: "input3d", label: "Text Input" },
                  { id: "textarea3d", label: "Textarea" },
                  { id: "checkbox3d", label: "Checkbox" },
                  { id: "radio3d", label: "Radio Button" },
                  { id: "toggle3d", label: "Toggle Switch" },
                  { id: "combobox3d", label: "Search Combobox" },
                  { id: "dropdown3d", label: "Dropdown Menu" },
                  { id: "range3d", label: "Range Slider" },
                  { id: "fileinput3d", label: "File Uploader" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveComponent(item.id as any)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-black transition-colors block cursor-pointer ${
                      activeComponent === item.id
                        ? "bg-blue-50 dark:bg-slate-800/60 text-brand-blue dark:text-blue-450"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* NAVIGATIONS */}
            <div>
              <h4 className="px-2 mb-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                Navigations
              </h4>
              <div className="flex flex-col gap-1">
                {[
                  { id: "breadcrumb3d", label: "Breadcrumbs" },
                  { id: "navbar3d", label: "Navbar" },
                  { id: "tabs3d", label: "Navigation Tabs" },
                  { id: "steps3d", label: "Steps Indicator" },
                  { id: "pagination3d", label: "Pagination" },
                  { id: "sidebar3d", label: "Sidebar Menu" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveComponent(item.id as any)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-black transition-colors block cursor-pointer ${
                      activeComponent === item.id
                        ? "bg-blue-50 dark:bg-slate-800/60 text-brand-blue dark:text-blue-450"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* OVERLAYS & FEEDBACK */}
            <div>
              <h4 className="px-2 mb-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                Overlays & Feedback
              </h4>
              <div className="flex flex-col gap-1">
                {[
                  { id: "dialog3d", label: "Modal Dialog" },
                  { id: "popup3d", label: "Tooltip Popover" },
                  { id: "alert3d", label: "Alert Banner" },
                  { id: "toast3d", label: "Toast Notification" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveComponent(item.id as any)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-black transition-colors block cursor-pointer ${
                      activeComponent === item.id
                        ? "bg-blue-50 dark:bg-slate-800/60 text-brand-blue dark:text-blue-450"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* DATA DISPLAY & INTERACTIVE */}
            <div>
              <h4 className="px-2 mb-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                Data & Interactive
              </h4>
              <div className="flex flex-col gap-1">
                {[
                  { id: "carousel3d", label: "Carousel" },
                  { id: "collapse3d", label: "Accordion Collapse" },
                  { id: "progressbar3d", label: "Progress Bar" },
                  { id: "mascotbubble", label: "Mascot Bubble" },
                  { id: "timeline3d", label: "Roadmap Timeline" },
                  { id: "table3d", label: "Data Table" },
                  { id: "rating3d", label: "Star Rating" },
                  { id: "stat3d", label: "Scoreboard Stats" },
                  { id: "hero3d", label: "Hero Banner" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveComponent(item.id as any)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-black transition-colors block cursor-pointer ${
                      activeComponent === item.id
                        ? "bg-blue-50 dark:bg-slate-800/60 text-brand-blue dark:text-blue-450"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Right Main Documentation Viewport */}
        <main className="flex-grow p-6 sm:p-10 max-w-4xl overflow-y-auto max-h-[calc(100vh-3.5rem)] text-left bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200">
          
          {/* Breadcrumbs path */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mb-2">
            <span>Docs</span>
            <span>/</span>
            <span>Components</span>
            <span>/</span>
            <span className="text-brand-blue dark:text-blue-400 font-black">{activeComponent}</span>
          </div>

          {/* ---------------------------------------------
              A. BENTO INTRO PAGE
              --------------------------------------------- */}
          {activeComponent === "intro" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 mb-2">Coder Studio UI Framework</h1>
                <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed font-medium">
                  ยินดีต้อนรับสู่ Coder Studio UI Framework! อภิมหาคลังส่วนประกอบอินเตอร์เฟสสำเร็จรูป 3 มิติ (Duolingo 3D + Atlassian Theme) ครบชุดมาตรฐานระดับโปรทั้งหมด 35 คอมโพเนนต์ถ้วน! ปราศจาก Emoji 100% และพร้อมติดตั้งใช้งานจริง
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm text-left transition-all">
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 mb-1.5 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-brand-blue" />
                    <span>ออกแบบเพื่อ Tailwind CSS v4</span>
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                    คอมโพเนนต์ทั้งหมดทำงานร่วมกับ Tailwind CSS v4 ตัวแปรสี Functional ถูกบรรจุด้วยระบบ Rust ช่วยรักษาโครงสร้างน้ำหนักเบาและตอบสนองได้เร็วระดับมิลลิวินาที
                  </p>
                </div>
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm text-left transition-all">
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 mb-1.5 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-game-success" />
                    <span>35 Primitives ครบครัน</span>
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                    ครอบคลุมทั้งกลุ่มปุ่มพื้นฐาน, แบบฟอร์มป้อนข้อมูล (Input, Textarea, Checkbox, Radio, Toggle, Combobox, Dropdown, Range, FileInput), เส้นทางนำทาง (Breadcrumb, Navbar, Tabs, Steps, Pagination, Sidebar), ตราเกียรติยศ และอินเตอร์เฟสตอบสนอง (Tooltip, Dialog, Alert, Toast, Carousel, Collapse, Progress, Timeline, Table, Scoreboard, Hero Banner)
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4 text-left">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-blue" />
                  <span>วิธีการเรียกใช้งาน Component ในโปรเจกต์</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                  สามารถเลือกคอมโพเนนต์ที่คุณต้องการ นำโค้ด React จากแท็บ **"Code"** ไปติดตั้งประยุกต์ใช้งานในหน้าเพจ Next.js ได้อย่างรวดเร็ว:
                </p>
                <CodeHighlight
                  code={`import Button3D from "@/components/game/Button3D";
import Dropdown3D from "@/components/game/Dropdown3D";

export default function Demo() {
  return (
    <div className="flex gap-4">
      <Button3D variant="primary">ปุ่ม 3D Bouncy</Button3D>
      <Dropdown3D
        options={[{ label: "HTML5", value: "html" }]}
        onChange={(val) => console.log(val)}
      />
    </div>
  );
}`}
                  language="tsx"
                  filename="Demo.tsx"
                />
              </div>
            </div>
          )}

          {/* ---------------------------------------------
              B. DESIGN TOKENS
              --------------------------------------------- */}
          {activeComponent === "tokens" && (
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h1 className="text-4xl font-black text-slate-800 mb-2">ชุดสีและฟอนต์ (Design Tokens)</h1>
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
                  โครงสร้างการตั้งค่า Functional Colors และแบบอักษรสำหรับเฟรมเวิร์ก Coder Studio UI
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: "Atlassian Blue", code: "#0052CC", tailwind: "bg-brand-blue" },
                  { name: "Lime Green", code: "#58CC02", tailwind: "bg-game-success" },
                  { name: "Vibrant Red", code: "#FF4B4B", tailwind: "bg-game-danger" },
                  { name: "Fire Orange", code: "#FF9600", tailwind: "bg-game-warning" },
                  { name: "Crown Gold", code: "#FFD900", tailwind: "bg-game-gold" },
                  { name: "Neutral Slate", code: "#E2E8F0", tailwind: "bg-game-slate" },
                ].map((color, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-sm text-left">
                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 ${color.tailwind} shadow-md`} />
                    <div className="text-left">
                      <h4 className="font-extrabold text-slate-800 text-xs">{color.name}</h4>
                      <code className="text-[10px] text-slate-400 font-mono font-bold">{color.code}</code>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-6 space-y-4 text-left">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Type className="w-5 h-5 text-brand-blue" />
                  <span>ฟอนต์ไทยหลัก (Google Sarabun)</span>
                </h3>
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                    ฟอนต์สารบัญ Sarabun ภาษาไทยสมบูรณ์แบบ
                  </div>
                  <span className="text-[10px] text-slate-400 font-black font-mono">
                    FONT-FAMILY: VAR(--FONT-SARABUN)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------
              C. THE 35 COMPONENTS DOCS SHOWCASE
              --------------------------------------------- */}
          {[
            // 1. BUTTON3D
            {
              id: "button3d",
              title: "Button3D (ปุ่มกด 3 มิติ)",
              desc: "ปุ่มกดหลักที่ยุบตัวลงไป 4px เมื่อถูกคลิกและมีขอบลึก Shading มิติชัดเจน สไตล์ Duolingo Bouncy Click",
              preview: (
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  <Button3D variant="primary" onClick={() => setBtnCount((c) => c + 1)}>
                    ปุ่มหลัก Blue ({btnCount})
                  </Button3D>
                  <Button3D variant="success">สำเร็จ Green</Button3D>
                  <Button3D variant="danger">ล้มเหลว Red</Button3D>
                  <Button3D variant="warning">คำเตือน Orange</Button3D>
                  <Button3D variant="secondary">ขอบขาว Secondary</Button3D>
                  <Button3D variant="primary" disabled>
                    ปิดใช้งาน Muted
                  </Button3D>
                </div>
              ),
              props: [
                { prop: "variant", type: '"primary" | "success" | "danger" | "warning" | "secondary"', dflt: '"primary"', desc: "ชุดธีมสีสถานะปุ่ม" },
                { prop: "size", type: '"sm" | "md" | "lg"', dflt: '"md"', desc: "ระดับขนาดความหนาและช่องป้อนของปุ่ม" },
                { prop: "disabled", type: "boolean", dflt: "false", desc: "ล็อกการทำงานของปุ่มกด สีกดจม" },
                { prop: "children", type: "React.ReactNode", dflt: "required", desc: "คำแนะนำ/ไอคอน หรือคีย์บอร์ดที่บรรจุภายในปุ่ม" },
              ],
            },

            // 2. BADGE3D
            {
              id: "badge3d",
              title: "Badge3D (เข็มกลัดป้ายตราเกียรติยศ)",
              desc: "เข็มกลัดรางวัลแสดงสถานะดีไซน์น่ารัก 3 มิติ ลอยตัวและหมุนเล่นดุ๊กดิ๊กเมื่อจ่อเมาส์ รองรับการใส่ปุ่มล็อก grayscale แสดงตรากุญแจล็อค",
              preview: (
                <div className="space-y-6 w-full max-w-sm mx-auto text-center">
                  <div className="flex justify-center gap-6">
                    <Badge3D type="crown" label="มงกุฎทอง" active={badgeState.crown} />
                    <Badge3D type="streak" label="ขยันไฟลุก" active={badgeState.streak} />
                    <Badge3D type="star" label="ดาวจอมเวท" active={badgeState.star} />
                    <Badge3D type="shield" label="เกราะคุ้มภัย" active={badgeState.shield} />
                  </div>
                  <div className="bg-slate-100/50 p-4 border border-slate-200 rounded-2xl flex flex-wrap gap-2.5 justify-center w-full">
                    <Button3D variant="secondary" size="sm" className="flex items-center gap-1.5" onClick={() => setBadgeState((prev) => ({ ...prev, crown: !prev.crown }))}>
                      {badgeState.crown ? <span>ล็อกมงกุฎ</span> : <span>ปลดล็อก</span>}
                    </Button3D>
                    <Button3D variant="secondary" size="sm" className="flex items-center gap-1.5" onClick={() => setBadgeState((prev) => ({ ...prev, streak: !prev.streak }))}>
                      {badgeState.streak ? <span>ล็อกไฟลุก</span> : <span>ปลดล็อก</span>}
                    </Button3D>
                    <Button3D variant="secondary" size="sm" className="flex items-center gap-1.5" onClick={() => setBadgeState((prev) => ({ ...prev, star: !prev.star }))}>
                      {badgeState.star ? <span>ล็อกดาว</span> : <span>ปลดล็อก</span>}
                    </Button3D>
                    <Button3D variant="secondary" size="sm" className="flex items-center gap-1.5" onClick={() => setBadgeState((prev) => ({ ...prev, shield: !prev.shield }))}>
                      {badgeState.shield ? <span>ล็อกโล่</span> : <span>ปลดล็อก</span>}
                    </Button3D>
                  </div>
                </div>
              ),
              props: [
                { prop: "type", type: '"crown" | "streak" | "star" | "shield"', dflt: "required", desc: "รูปแบบไอคอนตราเหรียญความสำเร็จ" },
                { prop: "label", type: "string", dflt: "undefined", desc: "คำอธิบายประกอบชื่อเหรียญใต้ตรา" },
                { prop: "size", type: '"sm" | "md" | "lg"', dflt: '"md"', desc: "ขนาดความหนากล่องของเหรียญ" },
                { prop: "active", type: "boolean", dflt: "true", desc: "หากตั้งเป็น false เหรียญจะขาวดำและขึ้นเครื่องหมายกุญแจล็อก" },
              ],
            },

            // 3. CARD3D
            {
              id: "card3d",
              title: "Card3D (การ์ดจัดวางเนื้อหา 3D)",
              desc: "กล่องการ์ดบรรจุเนื้อหาดีไซน์ 3D ที่ขลิบขอบชัดเจน เด้งเอนเอียงยกตัวสูงขึ้นเมื่อจ่อเมาส์ มอบความมีชีวิตชีวาให้เลย์เอาต์เว็บ",
              preview: (
                <div className="w-full max-w-sm mx-auto">
                  <Card3D title="บทเรียนฟังก์ชันลูปเงื่อนไข">
                    <p className="mb-4">มาสคอตเดี่ยวจะพาน้องๆ ไปก้าวข้ามขีดจำกัดด้วยโจทย์ฝึกทักษะการวนลูปเงื่อนไขแบบเห็นภาพสะใจ!</p>
                    <Button3D variant="primary" size="sm">เริ่มบทเรียน</Button3D>
                  </Card3D>
                </div>
              ),
              props: [
                { prop: "title", type: "string", dflt: "undefined", desc: "หัวข้อข้อความของการ์ดบริเวณส่วนบนสุด" },
                { prop: "children", type: "React.ReactNode", dflt: "required", desc: "เนื้อหาที่บรรจุอยู่ภายใต้กล่องการ์ด" },
                { prop: "className", type: "string", dflt: '""', desc: "คลาส Tailwind CSS ตกแต่งเสริม" },
                { prop: "hoverable", type: "boolean", dflt: "true", desc: "เปิดให้การ์ดยกตัวเด้งขึ้นเมื่อเอาเมาส์จ่อชี้" },
              ],
            },

            // 4. INPUT3D
            {
              id: "input3d",
              title: "Input3D (กล่องรับข้อมูลข้อความ 3D)",
              desc: "กล่องรับข้อมูลตัวอักษร 3 มิติขอบมนหนา ขยับยุบตัวลงไป 2px พร้อมไฮไลต์กรอบสีน้ำเงินเมื่อถูกคลิกรับข้อมูล",
              preview: (
                <div className="space-y-4 max-w-xs mx-auto w-full text-left">
                  <Input3D
                    label="ชื่อผู้ใช้งานโชว์โหมดปกติ"
                    placeholder="กรอกชื่อเล่นของคุณ..."
                    value={textInput}
                    onChange={(e) => {
                      setTextInput(e.target.value);
                      if (e.target.value.length < 3) {
                        setTextError("ชื่อผู้ใช้ต้องยาวกว่า 3 ตัวอักษร");
                      } else {
                        setTextError("");
                      }
                    }}
                    error={textError}
                  />
                </div>
              ),
              props: [
                { prop: "label", type: "string", dflt: "undefined", desc: "ข้อความป้ายกำกับป้ายด้านบนกล่องอินพุต" },
                { prop: "error", type: "string", dflt: "undefined", desc: "ข้อความแจ้งข้อผิดพลาด แถบจะขึ้นสีแดงพร้อมรูปไอคอนแจ้งเตือน" },
                { prop: "disabled", type: "boolean", dflt: "false", desc: "ปิดรับข้อมูล แถบจะ muted ล็อกยุบจม" },
              ],
            },

            // 5. CHECKBOX3D
            {
              id: "checkbox3d",
              title: "Checkbox3D (กล่องติ๊กเลือกเด้งสปริง)",
              desc: "ปุ่มติ๊กเลือกแบบ 3 มิติ ยุบตัวลงไปเมื่อคลิก ติ๊กแล้วแอนิเมชันเครื่องหมายถูกเด้งขยายตัวออกมาแบบสปริง Pop-in",
              preview: (
                <div className="flex flex-col gap-4 max-w-xs mx-auto w-full items-center">
                  <Checkbox3D
                    label="ยอมรับเงื่อนไขการสะสมพลัง"
                    checked={checkboxVal}
                    onChange={setCheckboxVal}
                  />
                  <Checkbox3D
                    label="ปิดติ๊กบล็อกล็อก Muted"
                    checked={false}
                    onChange={() => {}}
                    disabled={true}
                  />
                </div>
              ),
              props: [
                { prop: "checked", type: "boolean", dflt: "required", desc: "เปิดใช้งานการติ๊กถูกหรือปิด" },
                { prop: "onChange", type: "(checked: boolean) => void", dflt: "required", desc: "ฟังก์ชันส่งค่ากลับเมื่อติ๊กเลือกเปลี่ยนสถานะ" },
                { prop: "label", type: "string", dflt: "undefined", desc: "ข้อความป้ายอธิบายทางขวามือของกล่อง" },
                { prop: "disabled", type: "boolean", dflt: "false", desc: "ล็อกกล่องตัวเลือกติ๊กขยับไม่ได้" },
              ],
            },

            // 6. TOGGLE3D
            {
              id: "toggle3d",
              title: "Toggle3D (สวิตช์เปิด-ปิดสไลด์ 3D)",
              desc: "สวิตช์ปุ่มสไลด์เปิด-ปิดแบบกลมมนหนา 3 มิติ ปุ่มกลมด้านในเคลื่อนสไลด์สมูทพร้อมเอฟเฟกต์สีเขียวเมื่อเปิดใช้งาน",
              preview: (
                <div className="flex flex-col gap-4 max-w-xs mx-auto w-full items-center">
                  <Toggle3D
                    label="เปิดใช้ระบบเสียงมาสคอตพูด"
                    checked={toggleVal}
                    onChange={setToggleVal}
                  />
                  <Toggle3D
                    label="ปิดสวิตช์ล็อก Muted"
                    checked={false}
                    onChange={() => {}}
                    disabled={true}
                  />
                </div>
              ),
              props: [
                { prop: "checked", type: "boolean", dflt: "required", desc: "สถานะการเปิด/ปิดสวิตช์" },
                { prop: "onChange", type: "(checked: boolean) => void", dflt: "required", desc: "ฟังก์ชันตอบรับการส่งสถานะกลับ" },
                { prop: "label", type: "string", dflt: "undefined", desc: "ป้ายอธิบายประกอบทางขวาสวิตช์" },
                { prop: "disabled", type: "boolean", dflt: "false", desc: "ล็อกสวิตช์สไลด์ขยับไม่ได้" },
              ],
            },

            // 7. COMBOBOX3D
            {
              id: "combobox3d",
              title: "Combobox3D (กล่องเลือกค้นหาข้อมูล)",
              desc: "ตัวเลือกอินพุต dropdown ขอบหนา 3 มิติ ที่ให้คุณพิมพ์ฟิลเตอร์ตัวกรองค้นหารายการข้างในได้จริงเสมือนคอมโบบ็อกซ์ระดับโปร",
              preview: (
                <div className="max-w-xs mx-auto w-full min-h-60 pt-4 text-left">
                  <Combobox3D
                    label="เลือกเทคโนโลยีฐานใช้งาน"
                    options={comboOptions}
                    value={comboVal}
                    onChange={setComboVal}
                  />
                  <p className="mt-4 text-xs font-bold text-slate-400">
                    รายการที่เลือกอยู่: <span className="text-brand-blue dark:text-blue-400 font-black">{comboVal}</span>
                  </p>
                </div>
              ),
              props: [
                { prop: "options", type: "Array<{ label, value }>", dflt: "required", desc: "รายการหัวข้อและคีย์ทั้งหมด" },
                { prop: "value", type: "string", dflt: "required", desc: "คีย์ค่าของไอเทมที่เลือกอยู่ในปัจจุบัน" },
                { prop: "onChange", type: "(value: string) => void", dflt: "required", desc: "ฟังก์ชันส่งค่ากลับเมื่อเลือกสำเร็จ" },
                { prop: "placeholder", type: "string", dflt: '"เลือกรายการ..."', desc: "ข้อความพรีวิวเมื่อยังไม่มีการเลือก" },
                { prop: "label", type: "string", dflt: "undefined", desc: "ป้ายกำกับป้ายด้านบนคอมโบบ็อกซ์" },
              ],
            },

            // 8. BREADCRUMB3D
            {
              id: "breadcrumb3d",
              title: "Breadcrumb3D (ระบบนำทางย้อนลิงก์)",
              desc: "เส้นทางบอกพิกัดลิงก์ย้อนกลับ ขลิบขอบแบบ 3D เม็ดกลมมน ขยับยกตัวสูงลอยเด่นเมื่อเอาเมาส์ชี้จ่อ",
              preview: (
                <div className="flex items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl w-full max-w-md mx-auto">
                  <Breadcrumb3D
                    items={[
                      { label: "คลังแสง UI", href: "/design-system" },
                      { label: "ตัวเลือกคอมโพเนนต์", active: true },
                    ]}
                  />
                </div>
              ),
              props: [
                { prop: "items", type: "Array<{ label, href, active }>", dflt: "required", desc: "รายการแถบลิงก์และสถานะ Active" },
              ],
            },

            // 9. NAVBAR3D
            {
              id: "navbar3d",
              title: "Navbar3D (แถบเมนูด้านบนนำทาง)",
              desc: "แถบเมนูนำทางด้านบนแบบ Responsive ขอบลึกหนา 3D ตกแต่งปุ่มภายในด้วย Bouncy Button ลอยสั่นเยื้องจังหวะได้",
              preview: (
                <div className="w-full max-w-xl mx-auto">
                  <Navbar3D
                    brandName="Coder Studio"
                    links={[
                      { label: "คลังแสง UI", href: "/design-system" },
                      { label: "ภาพรวมเกม", href: "/" },
                    ]}
                  />
                </div>
              ),
              props: [
                { prop: "brandName", type: "string", dflt: '"Coder Studio"', desc: "ชื่อโลโก้ตราแบรนด์ทางซ้ายมือสุด" },
                { prop: "links", type: "Array<{ label, href }>", dflt: "[]", desc: "รายการแถบปุ่มลิงก์นำทางด้านขวา" },
              ],
            },

            // 10. DIALOG3D
            {
              id: "dialog3d",
              title: "Dialog3D (หน้าต่างโมดอลป๊อปอัปแจ้งผล)",
              desc: "หน้าต่างแจ้งผลลัพธ์อเนกประสงค์เด้งตัวออกมาด้วยสปริง Pop-in ชัดเจน มีกรอบไอคอนตกแต่ง 3 แบบ (สำเร็จ, ล้มเหลว, เลเวลอัพ)",
              preview: (
                <div className="space-y-4 max-w-sm mx-auto text-center">
                  <div className="flex flex-wrap gap-2.5 justify-center">
                    <Button3D variant="success" className="flex items-center gap-1.5" onClick={() => { setDialogType("success"); setIsDialogOpen(true); }}>
                      <Check className="w-4 h-4 text-white" />
                      <span>สำเร็จ</span>
                    </Button3D>
                    <Button3D variant="danger" className="flex items-center gap-1.5" onClick={() => { setDialogType("failure"); setIsDialogOpen(true); }}>
                      <X className="w-4 h-4 text-white" />
                      <span>ผิดพลาด</span>
                    </Button3D>
                    <Button3D variant="warning" className="flex items-center gap-1.5" onClick={() => { setDialogType("levelUp"); setIsDialogOpen(true); }}>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>เลเวลอัพ</span>
                    </Button3D>
                  </div>
                  <Dialog3D
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    type={dialogType}
                    title={
                      dialogType === "success"
                        ? "ยินดีด้วย! ด่านผ่านแล้ว"
                        : dialogType === "failure"
                        ? "โอ๊ะโอ! พลังหัวใจหมด"
                        : "ยินดีด้วย! คุณเลเวลอัพ"
                    }
                  >
                    {dialogType === "success" ? (
                      <p>คุณตอบคำถามได้ถูกต้องสมบูรณ์แบบ ได้รับพลังงาน <strong>+10 XP</strong> เพิ่มเติมในการเรียนรู้ด่านนี้!</p>
                    ) : dialogType === "failure" ? (
                      <p>ดูเหมือนว่าคำตอบนี้จะยังไม่ถูกต้องนะ ลองกดปุ่มคำใบ้ของพี่มาสคอตนำทางเพื่อดูแนวทางการเติมโค้ดใหม่!</p>
                    ) : (
                      <p>ทักษะเขียนโปรแกรมเพิ่มขึ้นแบบก้าวกระโดด ได้ขึ้นสู่เลเวลถัดไป and ปลดล็อกเข็มกลัดตราเหรียญรางวัลเพิ่ม!</p>
                    )}
                  </Dialog3D>
                </div>
              ),
              props: [
                { prop: "isOpen", type: "boolean", dflt: "required", desc: "เปิด/ปิด การจำลองแสดงผลหน้าต่างโมดอลลอย" },
                { prop: "onClose", type: "() => void", dflt: "required", desc: "ฟังก์ชันตอบรับเมื่อกดยอมรับปิดหน้าต่าง" },
                { prop: "title", type: "string", dflt: '"สำเร็จแล้ว!"', desc: "ข้อความพาดหัวเด่นตรงกลางป๊อปอัป" },
                { prop: "type", type: '"success" | "failure" | "levelUp"', dflt: '"success"', desc: "ธีมสีตกแต่งและคีย์ไอคอนส่วนหัว" },
                { prop: "children", type: "React.ReactNode", dflt: "required", desc: "คำบรรยายความสำเร็จหรือล้มเหลวด้านใน" },
              ],
            },

            // 11. POPUP3D
            {
              id: "popup3d",
              title: "Popup3D (กล่องคำใบ้ลอย Tooltip Popover)",
              desc: "กล่องพูดใบ้ทูลทิปชี้นำทางลอยตัว Pointing ชี้เมาส์หรือคลิกแล้วจะสลักแอนิเมชันสปริง Pop-in และขยับสั่นได้ดุ๊กดิ๊ก",
              preview: (
                <div className="flex justify-center items-center gap-4 min-h-24 pt-4">
                  <Popup3D
                    trigger={<Button3D size="sm">ชี้เมาส์ที่ฉัน (Hover)</Button3D>}
                    content={<p>ยินดีต้อนรับ! นี่คือกล่องข้อความทูลทิปชี้แนะขยับดุ๊กดิ๊กได้</p>}
                    position="top"
                  />
                  <Popup3D
                    trigger={<Button3D size="sm" variant="success">คลิกฉัน (Click)</Button3D>}
                    content={<p>ปิ๊บๆ! คลิกนอกแถบป๊อปเพื่อปิดกล่องข้อความใบ้นี้!</p>}
                    position="bottom"
                    event="click"
                  />
                </div>
              ),
              props: [
                { prop: "trigger", type: "React.ReactNode", dflt: "required", desc: "ตัวส่วนประกอบชิ้นงานที่จะดักเมาส์/คลิก (เช่น ปุ่มกด)" },
                { prop: "content", type: "React.ReactNode", dflt: "required", desc: "ข้อความหรือรูปภาพคำใบ้ลอยลอยด้านในกล่องพูด" },
                { prop: "position", type: '"top" | "bottom" | "left" | "right"', dflt: '"top"', desc: "เลือกมุมหันหัวและชี้ข้อความ" },
                { prop: "event", type: '"hover" | "click"', dflt: '"hover"', desc: "ตัวดักเหตุการณ์เพื่อแสดงกล่องลอยข้อความ" },
              ],
            },

            // 12. ALERT3D
            {
              id: "alert3d",
              title: "Alert3D (แถบการ์ดประกาศแจ้งเตือน)",
              desc: "แถบบอร์ดแจ้งข่าวขอบหนา 3D ประกาศสี่เฉดสถานะสี (สำเร็จ, ล้มเหลว, แจ้งข่าว, คำเตือน) และมีตัวปุ่มให้ Dismiss ปิดทิ้งได้",
              preview: (
                <div className="space-y-3 w-full max-w-md mx-auto text-left">
                  <Alert3D title="ตอบคำถามสำเร็จ!" type="success">
                    ฟังก์ชันของคุณเขียนได้ถูกตามทฤษฎีหลักการ รันผ่านและพร้อมศึกษาเลเวลต่อไป
                  </Alert3D>
                  <Alert3D title="พบจุดผิดสังเกต" type="warning">
                    โปรดระวังการตั้งชื่อตัวแปรที่ทับซ้อนกัน อาจทำให้เกิดบั๊กในภายหลังได้
                  </Alert3D>
                </div>
              ),
              props: [
                { prop: "title", type: "string", dflt: "undefined", desc: "หัวเรื่องประกาศข้อความหนา" },
                { prop: "type", type: '"info" | "success" | "error" | "warning"', dflt: '"info"', desc: "ธีมการ์ดสถานะของกล่องข่าว" },
                { prop: "onClose", type: "() => void", dflt: "undefined", desc: "ฟังก์ชันตอบรับเมื่อผู้ใช้กดปิดกล่องข่าว" },
                { prop: "children", type: "React.ReactNode", dflt: "required", desc: "รายละเอียดความยินดีหรือแจ้งเตือนด้านใน" },
              ],
            },

            // 13. CAROUSEL3D
            {
              id: "carousel3d",
              title: "Carousel3D (สไลเดอร์สไลด์เนื้อหา)",
              desc: "กล่องสไลด์ดูภาพหรือการ์ดแบบ Responsive มาพร้อมลูกศร 3D ด้านข้าง และแถบขีดวงกลมด้านล่างที่จะยืดขยายกว้าง (Stretched Pill) ตามหน้าสไลด์",
              preview: (
                <div className="w-full max-w-sm mx-auto">
                  <Carousel3D
                    slides={[
                      <div key={1} className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-brand-blue text-xl mb-3">
                          <Palette className="w-8 h-8 text-brand-blue" />
                        </div>
                        <h4 className="font-extrabold text-slate-800">1. วางโครงสร้างดีไซน์</h4>
                        <p className="text-xs text-slate-500 mt-1">เริ่มต้นสร้างด้วย custom Tailwind Primitives</p>
                      </div>,
                      <div key={2} className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-game-success text-xl mb-3">
                          <Layers className="w-8 h-8 text-game-success" />
                        </div>
                        <h4 className="font-extrabold text-slate-800">2. ประกอบ React โค้ดดิ้ง</h4>
                        <p className="text-xs text-slate-500 mt-1">อิมพอร์ตใช้งานได้อย่างเรียบลื่น ไร้บั๊ก</p>
                      </div>,
                      <div key={3} className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-game-gold text-xl mb-3">
                          <Sparkles className="w-8 h-8 text-game-gold" />
                        </div>
                        <h4 className="font-extrabold text-slate-800">3. รันโปรเจกต์ Next.js</h4>
                        <p className="text-xs text-slate-500 mt-1">พร้อมดีเดย์ปล่อยโปรดักต์ระดับพรีเมียม</p>
                      </div>
                    ]}
                  />
                </div>
              ),
              props: [
                { prop: "slides", type: "React.ReactNode[]", dflt: "required", desc: "รายการแผ่นการ์ด/แผ่นภาพ สไลด์ทั้งหมด" },
                { prop: "autoPlay", type: "boolean", dflt: "false", desc: "เปิดสไลด์ขยับเลื่อนหน้าอัตโนมัติ" },
                { prop: "interval", type: "number", dflt: "4000", desc: "จังหวะเวลาขยับสไลด์ในหน่วยมิลลิวินาที" },
              ],
            },

            // 14. COLLAPSE3D
            {
              id: "collapse3d",
              title: "Collapse3D (ส่วนพับหด/ขยาย Accordion)",
              desc: "กล่องย่นหดข้อมูลเด้งสปริง (Accordion Panel) เปิดตัวสมูทพร้อม chevron หันเหทิศทาง 90 องศาเด้งสีเมื่อคลิกเปิดเนื้อหา",
              preview: (
                <div className="w-full max-w-sm mx-auto text-left">
                  <Collapse3D title="เฉลยแนวคิดการประกาศตัวแปร">
                    ฟังก์ชันนี้ต้องการการประกาศตัวแปรชนิด <code>const</code> เพื่อไม่ให้เกิดการเปลี่ยนค่าของตัวแปรข้อความ Coder Studio ในภายหลัง ลองใส่คำสั่งนี้แล้วตรวจคำตอบอีกครั้งนะ!
                  </Collapse3D>
                  <Collapse3D title="วิธีการเรียกใช้งานมาสคอตเดี่ยว">
                    เพียงแค่อิมพอร์ตส่วนประกอบ <code>MascotBubble</code> แล้วกำหนดดัชนี 1, 2, 3 ภาพมาสคอตเดี่ยวโปร่งใสก็จะลอยดุ๊กดิ๊กพร้อมป้ายแชททันที!
                  </Collapse3D>
                </div>
              ),
              props: [
                { prop: "title", type: "string", dflt: "required", desc: "แถบข้อความหัวข้อเรื่องของการ์ดหลัก" },
                { prop: "children", type: "React.ReactNode", dflt: "required", desc: "รายละเอียดเนื้อหา/คำตอบ เฉลยที่ซ่อนซ่อนอยู่ด้านใน" },
                { prop: "defaultOpen", type: "boolean", dflt: "false", desc: "เปิดขยายบานเนื้อหาทิ้งไว้ทันทีตั้งแต่โหลดแรก" },
              ],
            },

            // 15. PROGRESSBAR3D
            {
              id: "progressbar3d",
              title: "ProgressBar3D (แถบพลังเลเวล 3D)",
              desc: "กระบอกแถบความยาวระดับเปอร์เซ็นต์เดี่ยว ขลิบขอบหนา 3D สะท้อนผิวกระจกเงา Glassmorphism และรันเปอร์เซ็นต์สมูท",
              preview: (
                <div className="space-y-6 w-full max-w-md mx-auto">
                  <ProgressBar3D value={progressVal} max={100} color="brand" showPercentage={true} />
                  <div className="flex gap-3 justify-center">
                    <Button3D variant="secondary" size="sm" onClick={() => setProgressVal((v) => Math.max(v - 15, 0))}>-15%</Button3D>
                    <Button3D variant="secondary" size="sm" onClick={() => setProgressVal((v) => Math.min(v + 15, 100))}>+15%</Button3D>
                  </div>
                </div>
              ),
              props: [
                { prop: "value", type: "number", dflt: "required", desc: "ค่าเปอร์เซ็นต์ความคืบหน้าปัจจุบัน" },
                { prop: "max", type: "number", dflt: "100", desc: "จำกัดค่าเต็มของกระบอกแถบเลื่อน" },
                { prop: "color", type: '"brand" | "success" | "danger" | "warning" | "gold"', dflt: '"brand"', desc: "ธีมสีความคืบหน้า" },
                { prop: "size", type: '"sm" | "md" | "lg"', dflt: '"md"', desc: "ระดับสัดส่วนความกว้างของแถบ" },
                { prop: "showPercentage", type: "boolean", dflt: "false", desc: "เปิดพิมพ์เปอร์เซ็นต์ไว้ที่มุมบนขวา" },
                { prop: "animate", type: "boolean", dflt: "true", desc: "เปิดให้รันแอนิเมชันเลื่อนและเรืองแสง" },
              ],
            },

            // 17. MASCOT BUBBLE
            {
              id: "mascotbubble",
              title: "MascotBubble (แชททักทายของมาสคอต)",
              desc: "กรอบข้อความมาสคอตแนะนำโจทย์ ดึงไฟล์ภาพมาสคอตเดี่ยวลบพื้นหลังมาขยับลอยตัว Floating และส่ายดุ๊กดิ๊กเมื่อ hovered ชี้เมาส์",
              preview: (
                <div className="space-y-6 w-full max-w-2xl mx-auto">
                  <MascotBubble
                    mascotIndex={mascotIdx}
                    alignment={mascotAlign}
                    title={
                      mascotIdx === 1
                        ? "น้องบลู (Atlassian Guide)"
                        : mascotIdx === 2
                        ? "พี่แชดี้ (Coding Mascot)"
                        : "คุโระโบตะ (Junior Robot)"
                    }
                    text="ปิ๊บๆ! สวัสดีครับน้องแพน ภาพมาสคอตเดี่ยวถูกลบพื้นหลังคมชัด ตัดแอคชั่นยืนเดี่ยวออกมา เรียบร้อยแล้วครับขยับเด้งดึ๋งได้เลย!"
                  />
                  <div className="bg-slate-100/50 p-4 border border-slate-200 rounded-2xl flex flex-wrap gap-2.5 justify-center w-full">
                    <Button3D variant={mascotIdx === 1 ? "primary" : "secondary"} size="sm" onClick={() => setMascotIdx(1)}>น้องบลู</Button3D>
                    <Button3D variant={mascotIdx === 2 ? "primary" : "secondary"} size="sm" onClick={() => setMascotIdx(2)}>พี่แชดี้</Button3D>
                    <Button3D variant={mascotIdx === 3 ? "primary" : "secondary"} size="sm" onClick={() => setMascotIdx(3)}>เจ้าคูโร่</Button3D>
                    <Button3D variant="warning" size="sm" onClick={() => setMascotAlign((a) => (a === "left" ? "right" : "left"))}>สลับด้าน ซ้าย-ขวา</Button3D>
                  </div>
                </div>
              ),
              props: [
                { prop: "mascotIndex", type: "1 | 2 | 3", dflt: "1", desc: "อิมเมจระบุตัวละครมาสคอต" },
                { prop: "text", type: "string | ReactNode", dflt: "required", desc: "ข้อความพูดยินดี/ชี้นำทางในแชท" },
                { prop: "title", type: "string", dflt: "undefined", desc: "ชื่อเหนือกล่องข้อความ" },
                { prop: "alignment", type: '"left" | "right"', dflt: '"left"', desc: "เลือกมุมหันหน้าของมาสคอตโพรไฟล์" },
              ],
            },

            // 18. DROPDOWN3D
            {
              id: "dropdown3d",
              title: "Dropdown3D (ดรอปดาวน์สไตล์ 3 มิติ)",
              desc: "กล่องตัวเลือกแบบ Dropdown โทนสนุกสนาน เด้ง Pop-in หมวดรายการย่อย และรองรับการแทรกไอคอน Lucide เวกเตอร์ประกอบข้อความ",
              preview: (
                <div className="max-w-xs mx-auto w-full min-h-60 pt-4 text-left">
                  <Dropdown3D
                    label="เลือกบทเรียนปฏิบัติการ"
                    options={dropdownOptions}
                    value={dropdownVal}
                    onChange={setDropdownVal}
                  />
                  <p className="mt-4 text-xs font-bold text-slate-400">
                    รายการที่เลือกอยู่: <span className="text-brand-blue dark:text-blue-400 font-black">{dropdownVal}</span>
                  </p>
                </div>
              ),
              props: [
                { prop: "options", type: "DropdownOption[]", dflt: "required", desc: "อาร์เรย์รายการตัวเลือกพร้อมชื่อ รหัส และไอคอน" },
                { prop: "value", type: "string", dflt: "undefined", desc: "รหัสคำตอบตัวเลือกที่ระบุอยู่ปัจจุบัน" },
                { prop: "onChange", type: "(value: string) => void", dflt: "required", desc: "ฟังก์ชันรับค่าโค้ดที่เลือกกลับมาเปลี่ยนทาง" },
                { prop: "placeholder", type: "string", dflt: '"เลือกรายการ..."', desc: "ข้อความจำลองก่อนกดเลือก" },
                { prop: "disabled", type: "boolean", dflt: "false", desc: "ปิดการทำงานปุ่มไม่ให้สามารถคลิกปุ่มเลือก" },
              ],
            },

            // 19. TABS3D
            {
              id: "tabs3d",
              title: "Tabs3D (แท็บทางเลือก Bouncy Block)",
              desc: "แท็บสำหรับนำทางหน้าย่อย ดีไซน์แบบบล็อกปุ่ม 3D กดจมลงเมื่อถูกเลือกใช้งานพร้อม Atlassian Blue ไฮไลต์ชัดเจน",
              preview: (
                <div className="w-full max-w-md mx-auto space-y-4">
                  <Tabs3D
                    items={tabItems}
                    activeId={activeTabId}
                    onChange={setActiveTabId}
                  />
                  <div className="p-6 bg-white border-2 border-b-[6px] border-slate-300 rounded-2xl text-xs font-bold text-slate-500">
                    เนื้อหาย่อยของแท็บ: <span className="text-brand-blue dark:text-blue-400 font-black uppercase font-mono">{activeTabId}</span>
                  </div>
                </div>
              ),
              props: [
                { prop: "items", type: "TabItem[]", dflt: "required", desc: "รายการแท็บย่อยพร้อมไอคอนและสถานะใช้งาน" },
                { prop: "activeId", type: "string", dflt: "required", desc: "รหัสแท็บหลักที่ถูกเลือกอยู่ในปัจจุบัน" },
                { prop: "onChange", type: "(id: string) => void", dflt: "required", desc: "ฟังก์ชันส่งคืนรหัสแท็บเมื่อกดย้าย" },
                { prop: "orientation", type: '"horizontal" | "vertical"', dflt: '"horizontal"', desc: "เลือกมุมจัดเรียงแนวตั้งหรือแนวนอน" },
              ],
            },

            // 20. STEPS3D
            {
              id: "steps3d",
              title: "Steps3D (ขั้นตอนเดินความคืบหน้า)",
              desc: "แถบบ่งบอกขั้นตอน Milestone การเรียนรู้ขลิบขอบ 3D เชื่อมต่อด้วยกระบอกบาร์ความยาวที่เติมสีสันเมื่อผ่านด่าน",
              preview: (
                <div className="w-full max-w-xl mx-auto space-y-6">
                  <Steps3D
                    steps={stepItems}
                    currentStep={currentStepIdx}
                  />
                  <div className="flex gap-2 justify-center">
                    <Button3D variant="secondary" size="sm" onClick={() => setCurrentStepIdx((v) => Math.max(v - 1, 0))}>ย้อนขั้น</Button3D>
                    <Button3D variant="secondary" size="sm" onClick={() => setCurrentStepIdx((v) => Math.min(v + 1, 2))}>ถัดไป</Button3D>
                  </div>
                </div>
              ),
              props: [
                { prop: "steps", type: "StepItem[]", dflt: "required", desc: "รายการโครงเรื่องขั้นตอนประกอบรายละเอียด" },
                { prop: "currentStep", type: "number", dflt: "required", desc: "ดัชนีระบุตำแหน่งด่านปัจจุบัน (0-indexed)" },
              ],
            },

            // 21. TIMELINE3D
            {
              id: "timeline3d",
              title: "Timeline3D (แผนผังเดินทางผจญภัย)",
              desc: "เส้นทางแผนที่แนวตั้งเชื่อมโยงด้วยแกน 3D ชัดเจน ออกแบบเลียนแบบแนวทางเกมปลดล็อกด่านที่ละขั้น ตกแต่ง Grayscale คมล็อก",
              preview: (
                <div className="w-full max-w-md mx-auto p-4 bg-white border-2 border-b-[6px] border-slate-300 rounded-3xl">
                  <Timeline3D items={timelineItems} />
                </div>
              ),
              props: [
                { prop: "items", type: "TimelineItem[]", dflt: "required", desc: "ชุดรายการด่านข้อมูล แอนิเมชันลอยตัว และกุญแจกรอบล็อก" },
              ],
            },

            // 22. PAGINATION3D
            {
              id: "pagination3d",
              title: "Pagination3D (ปุ่มเลขนำทาง 3D)",
              desc: "ปุ่มเปลี่ยนหน้าข้อมูลจำลองดีไซน์ Bouncy Tactile ยุบตัวเมื่อคลิก และล็อกปุ่มหัวท้ายเมื่อหมดช่วงตัวเลขหน้า",
              preview: (
                <div className="space-y-4 text-center">
                  <Pagination3D
                    currentPage={currentPage}
                    totalPages={5}
                    onPageChange={setCurrentPage}
                  />
                  <p className="text-xs font-bold text-slate-400">
                    กำลังแสดงผลหน้าที: <span className="text-brand-blue dark:text-blue-400 font-black font-mono">{currentPage}</span>
                  </p>
                </div>
              ),
              props: [
                { prop: "currentPage", type: "number", dflt: "required", desc: "ดัชนีหน้าตัวเลขปัจจุบัน" },
                { prop: "totalPages", type: "number", dflt: "required", desc: "จำกัดยอดรวมหน้าทั้งหมด" },
                { prop: "onPageChange", type: "(page: number) => void", dflt: "required", desc: "ฟังก์ชันรับค่าเลขหน้าปัจจุบันกลับมาเปลี่ยนชุด" },
              ],
            },

            // 23. TOAST3D
            {
              id: "toast3d",
              title: "Toast3D (การ์ดแจ้งเตือนลอยมุมจอ)",
              desc: "หน้าต่างแจ้งข่าวเด้งกระดอนขึ้นจากมุมจอ มีขอบ 3D ตามชุดสี่เฉดสี พร้อมฟังก์ชันหน่วงเวลายุบทิ้งอัตโนมัติ",
              preview: (
                <div className="space-y-4 max-w-sm mx-auto text-center">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button3D variant="primary" size="sm" onClick={() => { setToastType("info"); setToastVal(true); }}>Info</Button3D>
                    <Button3D variant="success" size="sm" onClick={() => { setToastType("success"); setToastVal(true); }}>Success</Button3D>
                    <Button3D variant="warning" size="sm" onClick={() => { setToastType("warning"); setToastVal(true); }}>Warning</Button3D>
                    <Button3D variant="danger" size="sm" onClick={() => { setToastType("error"); setToastVal(true); }}>Error</Button3D>
                  </div>
                  <Toast3D
                    isVisible={toastVal}
                    message="บันทึกและรันคำตอบโค้ดวิจัยเรียบร้อย ได้รับรางวัลโบนัสสะสมพลังงาน"
                    title={toastType.toUpperCase()}
                    type={toastType}
                    onClose={() => setToastVal(false)}
                    duration={3000}
                  />
                  <p className="text-[10px] font-bold text-slate-400">คลิกที่ปุ่มเพื่อจำลอง Toast ป๊อปขึ้นมาบริเวณมุมขวาของหน้าต่างเบราว์เซอร์!</p>
                </div>
              ),
              props: [
                { prop: "isVisible", type: "boolean", dflt: "required", desc: "สถานะการเปิด/ปิด สไลด์แจ้งเตือน" },
                { prop: "message", type: "string", dflt: "required", desc: "ข้อความอธิบายการแจ้งเตือน" },
                { prop: "title", type: "string", dflt: "undefined", desc: "หัวข้อข่าวพาดหัวหลักบนตัวการ์ด" },
                { prop: "type", type: '"info" | "success" | "warning" | "error"', dflt: '"info"', desc: "ธีมการกำหนดสีขอบและไอคอนเวกเตอร์" },
                { prop: "onClose", type: "() => void", dflt: "required", desc: "ฟังก์ชันตอบสนองเมื่อกดปิดกากบาทหน้าต่าง" },
                { prop: "duration", type: "number", dflt: "4000", desc: "ระยะเวลาหน่วงก่อนปิดเองอัตโนมัติ (ms)" },
              ],
            },

            // 24. TABLE3D
            {
              id: "table3d",
              title: "Table3D (ตารางขอบเหลี่ยม 3 มิติ)",
              desc: "ตารางบรรจุรายการและตัวเลขสถิติขอบหนา 3D ตกแต่งคู่สีสลับแบบมิติลดอาการเพ่งสายตา เหมาะสำหรับทำกระดาน Leaderboard คะแนนสะสม",
              preview: (
                <div className="w-full max-w-lg mx-auto">
                  <Table3D
                    headers={tableHeaders}
                    rows={tableRows}
                  />
                </div>
              ),
              props: [
                { prop: "headers", type: "string[]", dflt: "required", desc: "รายชื่อคีย์หัวตารางบอกหมวดรายการ" },
                { prop: "rows", type: "React.ReactNode[][]", dflt: "required", desc: "อาร์เรย์สองมิติจัดเก็บคอลัมน์และเนื้อหารายแถว" },
              ],
            },

            // 25. RATING3D
            {
              id: "rating3d",
              title: "Rating3D (ดวงดาวประเมินระดับดุ๊กดิ๊ก)",
              desc: "ตราดาวประเมินระดับแบบมีปฏิสัมพันธ์ หมุนเอียงตัวและขยายขนาดตามการ Hover จ่อเมาส์ และเติมเต็มสีทองสดใสเมื่อคลิกโหวตคะแนน",
              preview: (
                <div className="space-y-4 text-center">
                  <Rating3D
                    value={ratingVal}
                    onChange={setRatingVal}
                  />
                  <p className="text-xs font-bold text-slate-400">
                    ประเมินระดับด่านนี้: <span className="text-[#B48C00] font-black font-mono">{ratingVal} / 5 ดาว</span>
                  </p>
                </div>
              ),
              props: [
                { prop: "value", type: "number", dflt: "required", desc: "คะแนนระดับดวงดาวโชว์ปัจจุบัน" },
                { prop: "onChange", type: "(val: number) => void", dflt: "undefined", desc: "ฟังก์ชันตอบรับผลคะแนนเปลี่ยนกลับ" },
                { prop: "max", type: "number", dflt: "5", desc: "ยอดจำนวนดาวสูงสุด" },
                { prop: "disabled", type: "boolean", dflt: "false", desc: "ล็อกไอคอนไม่ให้ขยับหรือคลิกเปลี่ยนค่า" },
              ],
            },

            // 26. KBD3D
            {
              id: "kbd3d",
              title: "Kbd3D ( แป้นคีย์แคปจำลอง 3D )",
              desc: "บล็อกแผงจำลองปุ่มคีย์บอร์ดสลับมิติขอบก้นหนา ใช้สำหรับการระบุคีย์ลัดประกอบคำใบ้ เช่น การกดคีย์ลัดคีย์บอร์ด",
              preview: (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl w-full max-w-sm mx-auto text-center text-slate-600 font-bold text-xs leading-relaxed">
                  กรุณากดปุ่มลัดแป้นพิมพ์ <Kbd3D>⌘K</Kbd3D> หรือกด <Kbd3D size="sm">Enter</Kbd3D> เพื่อข้ามไปยังเฉลยโจทย์ด่านนี้ดุ๊กดิ๊ก!
                </div>
              ),
              props: [
                { prop: "children", type: "React.ReactNode", dflt: "required", desc: "ข้อความอักษรย่อของแป้น เช่น Ctrl, ⌘K" },
                { prop: "size", type: '"sm" | "md"', dflt: '"md"', desc: "ระดับสัดส่วนของบล็อกคีย์แคป" },
              ],
            },

            // 27. STAT3D
            {
              id: "stat3d",
              title: "Stat3D ( Scoreboard การ์ดสถิติรวม )",
              desc: "บอร์ดการ์ดสรุปตัวเลข XP, Daily Streaks, Crown Ranks แสดงผลตัวเลขหนาใหญ่เด่นชัดเจนพร้อมกล่องบรรจุเวกเตอร์ Lucide ทางขวา",
              preview: (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mx-auto">
                  <Stat3D
                    label="คะแนนสะสมวันนี้"
                    value="1,240 XP"
                    variant="primary"
                    icon={<Activity className="w-5 h-5 text-brand-blue" />}
                  />
                  <Stat3D
                    label="ความพยายามไฟลุก"
                    value="15 วัน"
                    variant="warning"
                    icon={<Flame className="w-5 h-5 text-game-warning animate-float" />}
                  />
                </div>
              ),
              props: [
                { prop: "value", type: "ReactNode", dflt: "required", desc: "ตัวเลขสถิติเด่นตัวหนาตรงกลาง" },
                { prop: "label", type: "string", dflt: "required", desc: "หัวข้อป้ายกำกับบอกประเภทสถิติ" },
                { prop: "variant", type: '"primary" | "success" | "danger" | "warning" | "gold" | "secondary"', dflt: '"secondary"', desc: "ชุดสี่คู่กรอบเฉดสีสถานะ" },
                { prop: "icon", type: "ReactNode", dflt: "undefined", desc: "ไอคอน Lucide เสริมขวาสุด" },
              ],
            },

            // 28. TEXTAREA3D
            {
              id: "textarea3d",
              title: "Textarea3D (กล่องป้อนข้อมูลโค้ดยาว)",
              desc: "กล่องข้อความอเนกประสงค์ขอบลึก 3 มิติ ยุบระดับ 2px และเปลี่ยนสีเมื่อรับโฟกัส พร้องรองรับแถบแจ้งบั๊กตัวอักษรสีส้มด้านล่าง",
              preview: (
                <div className="max-w-md mx-auto w-full text-left">
                  <Textarea3D
                    label="รหัสโค้ดสำหรับส่งคำตอบปฏิบัติการ"
                    placeholder="function main() { return 'Coder Studio'; }"
                    value={textareaVal}
                    onChange={(e) => setTextareaVal(e.target.value)}
                    error={textareaVal.length > 0 && !textareaVal.includes("return") ? "โค้ดจำเป็นต้องมีคำสั่ง return คืนค่ากลับออกมา!" : undefined}
                  />
                </div>
              ),
              props: [
                { prop: "label", type: "string", dflt: "undefined", desc: "ข้อความป้ายประเภทกำกับด้านบน" },
                { prop: "error", type: "string", dflt: "undefined", desc: "คำบรรยายชี้แนะข้อผิดพลาด ขึ้นไอคอนเตือน" },
                { prop: "rows", type: "number", dflt: "4", desc: "จำกัดระดับการมองเห็นส่วนสูงแถวเริ่มต้น" },
              ],
            },

            // 29. RADIO3D
            {
              id: "radio3d",
              title: "Radio3D (เลือกจุดกลมขยับป๊อปสปริง)",
              desc: "ปุ่มเลือกตัวเลือกแบบจุดกลม tactile กดแล้วจุดภายในหมุนกระดอน Pop-in ขึ้นมาอย่างน่าสนใจ",
              preview: (
                <div className="flex flex-col gap-3 max-w-xs mx-auto items-start">
                  <Radio3D
                    label="ภาษาเขียนโค้ดหลัก React.js"
                    checked={radioVal}
                    onChange={setRadioVal}
                  />
                  <Radio3D
                    label="ภาษาเขียนโค้ดรอง Vanilla JS"
                    checked={!radioVal}
                    onChange={(checked) => setRadioVal(!checked)}
                  />
                </div>
              ),
              props: [
                { prop: "checked", type: "boolean", dflt: "required", desc: "กำหนดสถานะเปิดวงกลมภายใน" },
                { prop: "onChange", type: "(checked: boolean) => void", dflt: "required", desc: "ฟังก์ชันกดยืนยันการเลือกย้ายตัวเลือก" },
                { prop: "label", type: "string", dflt: "undefined", desc: "ป้ายบอกข้อความทางขวาสุด" },
              ],
            },

            // 30. RANGE3D
            {
              id: "range3d",
              title: "Range3D (สไลด์เกจความทึบพลัง)",
              desc: "แถบสไลด์เกจกระบอกความลึกหนา 3D ตกแต่งด้วยเม็ดกระดุมลอย Drag ตัวเลขหนาบอกความยาวชัดเจน",
              preview: (
                <div className="max-w-xs mx-auto w-full">
                  <Range3D
                    label="ความสว่างของหน้าจอคลังแสดงผล"
                    min={0}
                    max={100}
                    value={rangeVal}
                    onChange={setRangeVal}
                  />
                </div>
              ),
              props: [
                { prop: "value", type: "number", dflt: "required", desc: "ตัวเลขขีดความคืบหน้าโชว์ปัจจุบัน" },
                { prop: "onChange", type: "(val: number) => void", dflt: "required", desc: "ตัวแปรฟังก์ชันรับตัวเลขใหม่กลับมาอัปเดต" },
                { prop: "min", type: "number", dflt: "0", desc: "ยอดคะแนนต่ำสุด" },
                { prop: "max", type: "number", dflt: "100", desc: "ขีดจำกัดพลังสูงสุด" },
              ],
            },

            // 31. HERO3D
            {
              id: "hero3d",
              title: "Hero3D ( แฟ้มกระดานทักทายอลังการ )",
              desc: "บอร์ดบานหน้าเพจต้อนรับดีไซน์ 3 มิติขนาดใหญ่ บรรจุลวดลาย Grid คลาสสิก พร้อมช่องรูปมาสคอตเดี่ยวลอยล่อตาขวาสุด",
              preview: (
                <div className="w-full">
                  <Hero3D
                    title="คลังแสง Coder Studio!"
                    subtitle="ทลายกำแพงการเขียนโค้ดด้วยแนวทาง 3D Tactile UI Framework ที่มีประสิทธิภาพ รันไว ไหลลื่น ไร้ Emoji กวนใจ 100%"
                    mascot={
                      <div className="w-32 h-32 rounded-3xl bg-blue-100 flex items-center justify-center border-2 border-brand-blue shadow-lg animate-float">
                        <Sparkles className="w-14 h-14 text-brand-blue" />
                      </div>
                    }
                    actions={
                      <div className="flex gap-2">
                        <Button3D variant="primary" size="sm">เริ่มเดินทางเรียนรู้</Button3D>
                        <Button3D variant="secondary" size="sm">คู่มือวิจัย</Button3D>
                      </div>
                    }
                  />
                </div>
              ),
              props: [
                { prop: "title", type: "ReactNode", dflt: "required", desc: "ข้อความหนาพาดหัวกระดานต้อนรับใหญ่" },
                { prop: "subtitle", type: "string", dflt: "undefined", desc: "พารากราฟย่อหน้ารายละเอียดคำนำตัวอักษรกลม" },
                { prop: "actions", type: "ReactNode", dflt: "undefined", desc: "กลุ่มปุ่มกดการกระทำบริเวณล่างข้อความ" },
                { prop: "mascot", type: "ReactNode", dflt: "undefined", desc: "สลักโครงสร้างรูปภาพหรือไอคอนมาสคอตลอยตัวขวา" },
              ],
            },

            // 32. LOADING3D
            {
              id: "loading3d",
              title: "Loading3D (แผงโหลดสปริงดุ๊กดิ๊ก)",
              desc: "แอนิเมชันสถานะกำลังโหลดข้อมูล ดีไซน์น่ารักแบบดิ่งกระดอนลอยเล่น ลื่นไหล สบายตาทุกการหมุนสะสม",
              preview: (
                <div className="space-y-6 text-center w-full max-w-sm mx-auto">
                  <div className="flex justify-center p-8 bg-white border border-slate-200 rounded-2xl">
                    <Loading3D type={loadType} size="md" color="brand" />
                  </div>
                  <div className="flex gap-2.5 justify-center flex-wrap">
                    <Button3D variant={loadType === "dots" ? "primary" : "secondary"} size="sm" onClick={() => setLoadType("dots")}>แบบจุดกระดอน</Button3D>
                    <Button3D variant={loadType === "spin-star" ? "primary" : "secondary"} size="sm" onClick={() => setLoadType("spin-star")}>แบบดวงดาวหมุน</Button3D>
                    <Button3D variant={loadType === "spinner" ? "primary" : "secondary"} size="sm" onClick={() => setLoadType("spinner")}>แบบลูกศรหมุน</Button3D>
                  </div>
                </div>
              ),
              props: [
                { prop: "type", type: '"dots" | "spin-star" | "spinner"', dflt: '"dots"', desc: "สไตล์การโหลดเคลื่อนไหว" },
                { prop: "color", type: '"brand" | "success" | "danger" | "warning" | "gold"', dflt: '"brand"', desc: "ชุดธีมเฉดสีสะท้อนแสง" },
                { prop: "size", type: '"sm" | "md" | "lg"', dflt: '"md"', desc: "ระดับความใหญ่ของเอฟเฟกต์หมุน" },
              ],
            },

            // 33. SIDEBAR3D
            {
              id: "sidebar3d",
              title: "Sidebar3D (แผงเมนูด้านข้างจัดสัดส่วน)",
              desc: "แถบควบคุมจัดโครงแดชบอร์ดด้านซ้ายขอบหนา 3D ตกแต่งพร้อมช่องโลโก้ และรายการควบคุมยืดสลับหน้าย่อย",
              preview: (
                <div className="w-full max-w-xs mx-auto border-2 border-slate-200 rounded-3xl overflow-hidden shadow-md">
                  <Sidebar3D
                    brandName="Coder Studio"
                    items={sidebarItems}
                    footer={
                      <div className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider">
                        ลิขสิทธิ์ v2.0.0
                      </div>
                    }
                  />
                </div>
              ),
              props: [
                { prop: "brandName", type: "string", dflt: '"Coder Studio"', desc: "ชื่อหัวข้อประทับซ้ายสุดด้านบน" },
                { prop: "items", type: "SidebarItem[]", dflt: "required", desc: "รายการแผงเมนูพร้อมสถานะและฟังก์ชันกดลิงก์" },
                { prop: "footer", type: "ReactNode", dflt: "undefined", desc: "ช่องว่างด้านล่างสุดสำหรับแทรกชื่อโปรดักต์" },
              ],
            },

            // 34. FILEINPUT3D
            {
              id: "fileinput3d",
              title: "FileInput3D ( ลากวางไฟล์ส่งงาน 3D )",
              desc: "กล่องรับข้อมูลไฟล์ปฏิบัติการแบบลากวาง (Drag-and-Drop Dropzone) ขอบขลิบประ 3 มิติ เอนเอียงตัวลดความจมเมื่อคลิกเลือกส่งไฟล์สำเร็จ",
              preview: (
                <div className="max-w-sm mx-auto w-full">
                  <FileInput3D
                    label="ส่งรายงานสรุปการตอบคำถามเขียนโค้ด"
                    onChange={(files) => {
                      if (files && files.length > 0) {
                        alert(`รับไฟล์ ${files[0].name} เข้าสู่ระบบสำเร็จ!`);
                      }
                    }}
                  />
                </div>
              ),
              props: [
                { prop: "label", type: "string", dflt: "undefined", desc: "หัวข้อป้ายระบุประเภทข้อมูลของไฟล์" },
                { prop: "multiple", type: "boolean", dflt: "false", desc: "เปิดให้ผู้เรียนส่งหลายไฟล์พร้อมกัน" },
                { prop: "onChange", type: "(files: FileList | null) => void", dflt: "undefined", desc: "ฟังก์ชันตอบรับนำไฟล์เข้าสู่ระบบเซิร์ฟเวอร์" },
              ],
            },
          ].map((comp) => {
            if (activeComponent !== comp.id) return null;

            const isPreview = getTab(comp.id) === "preview";

            return (
              <div key={comp.id} className="space-y-6 animate-fade-in text-left">
                {/* Title & Description */}
                <div>
                  <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{comp.title}</h1>
                  <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base leading-relaxed">{comp.desc}</p>
                </div>

                {/* Tabs switcher Preview vs Code */}
                <div className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <button
                        onClick={() => toggleTab(comp.id, "preview")}
                        className={`px-3 py-1.5 rounded-md text-xs font-black transition-all cursor-pointer ${
                          isPreview 
                            ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm" 
                            : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => toggleTab(comp.id, "code")}
                        className={`px-3 py-1.5 rounded-md text-xs font-black transition-all cursor-pointer ${
                          !isPreview 
                            ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm" 
                            : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        Code
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    {isPreview ? (
                      <div className="component-preview-box p-8 sm:p-12 min-h-64 flex items-center justify-center bg-slate-50/50 dark:bg-[#070b13] transition-colors duration-200">
                        {comp.preview}
                      </div>
                    ) : (
                      <div className="p-4 bg-[#0A1128]">
                        <CodeHighlight
                          code={snippets[comp.id]}
                          language="tsx"
                          filename={`${comp.id.charAt(0).toUpperCase() + comp.id.slice(1)}.tsx`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Table References */}
                <div className="space-y-3 pt-4 text-left font-sans">
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Props API Reference</h3>
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm transition-all duration-200">
                    <table className="w-full text-xs sm:text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black text-[10px]">
                        <tr>
                          <th className="px-6 py-3.5">Prop</th>
                          <th className="px-6 py-3.5">Type</th>
                          <th className="px-6 py-3.5">Default</th>
                          <th className="px-6 py-3.5">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                        {comp.props.map((p, pidx) => (
                          <tr key={pidx} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-bold text-slate-800 font-mono">{p.prop}</td>
                            <td className="px-6 py-4 text-blue-600 font-mono text-[11px] truncate max-w-40">{p.type}</td>
                            <td className="px-6 py-4 font-mono text-slate-400">{p.dflt}</td>
                            <td className="px-6 py-4 text-slate-500 font-sans">{p.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            );
          })}

        </main>
      </div>
    </div>
  );
}

// Simple local Circle Icon for catalog options to keep it clean and robust
function CircleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
