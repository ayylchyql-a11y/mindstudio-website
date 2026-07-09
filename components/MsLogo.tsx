export default function MsLogo({ label }: { label?: string }) {
  return (
    <svg
      className="ms-logo"
      viewBox="0 0 1024 1024"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <rect width="1024" height="1024" fill="#050505" />
      <rect x="64" y="64" width="896" height="896" rx="220" fill="none" stroke="#F7F4EC" strokeWidth="44" />
      <path
        d="M278 310V708 M746 310V708 M278 310L746 708 M746 310L278 708"
        fill="none"
        stroke="#F7F4EC"
        strokeWidth="40"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g fill="#050505" stroke="#F7F4EC" strokeWidth="36">
        <circle cx="278" cy="310" r="64" />
        <circle cx="746" cy="310" r="64" />
        <circle cx="278" cy="708" r="64" />
        <circle cx="746" cy="708" r="64" />
      </g>
      <circle cx="512" cy="512" r="62" fill="#050505" stroke="#2F6FFF" strokeWidth="32" />
    </svg>
  );
}
