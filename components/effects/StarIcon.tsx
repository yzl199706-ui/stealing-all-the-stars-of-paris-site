type Props = { className?: string };

export function StarIcon({ className = "" }: Props) {
  return <svg className={className} viewBox="0 0 100 100" aria-hidden="true"><path d="M50 1C56 35 65 44 99 50 65 56 56 65 50 99 44 65 35 56 1 50 35 44 44 35 50 1Z" fill="currentColor" /></svg>;
}
