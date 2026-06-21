import logo from '@/assets/cyberbull-logo.png'

export function Logo({ className = '' }: { className?: string }) {
  return <img src={logo} alt="CyberBull logo" className={className} />
}
