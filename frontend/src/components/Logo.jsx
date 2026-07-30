export default function Logo({ className = "w-14 h-14 object-contain" }) {
  return (
    <img
      src="/logo.svg"
      alt="CleanReport Official Logo"
      width="56"
      height="56"
      className={className}
    />
  );
}
