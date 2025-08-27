
import newLogo from '../brand_assets/DGlogo.png'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { ThemeToggle } from './ThemeToggle'
import { useDemo } from '../contexts/DemoContext'
import { PageWrapper } from './PageWrapper'
import {
	Users,
	Trophy,
	Coins,
	CalendarCheck,
	ShieldCheck,
	Sparkles,
	Star,
	CheckCircle,
	ChevronRight,
} from 'lucide-react'

function Logo({ className = 'h-8 w-8' }: { className?: string }) {
    return <img src={newLogo} alt="The Daily Grind logo" className={className} />
}

const fadeUp = {
	hidden: { opacity: 0, y: 16 },
	show: { opacity: 1, y: 0 },
}

const features = [
	{ icon: Users, title: 'Multi‑user households', text: 'Parent, teen, kid roles with fine‑grained permissions and parent approval for redemptions.' },
	{ icon: Coins, title: 'Points → Rewards', text: 'XP, streaks, and cash-outs that keep momentum. Parents approve kids\' redemptions.' },
	{ icon: Trophy, title: 'Leaderboards', text: 'Weekly and all‑time standings drive friendly competition.' },
	{ icon: CalendarCheck, title: 'Schedules & Routines', text: 'Recurring tasks, reminders, and auto‑rotations.' },
	{ icon: ShieldCheck, title: 'Progress & Safety', text: 'Audit logs, parent approvals, and role-based controls.' },
	{ icon: Sparkles, title: 'Customization', text: 'Themes, avatars, and profile perks as you level up.' },
]

const demoLeaders = [
	{ name: 'Alex', points: 1240, level: 12 },
	{ name: 'Janice', points: 1190, level: 11 },
	{ name: 'Jordan', points: 980, level: 10 },
	{ name: 'Avery', points: 760, level: 8 },
]

export default function LandingPage() {
	const { enterDemoMode } = useDemo()
	
	return (
		<PageWrapper showBackground={true}>
			<header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/40">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
					<div className="flex items-center gap-2 sm:gap-3">
						<div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-secondary text-foreground shadow-inner">
							<Logo className="h-4 w-4 sm:h-6 sm:w-6" />
						</div>
						<div className="text-sm sm:text-lg font-brand font-bold tracking-tight">THE DAILY GRIND</div>
						<Badge className="ml-1 sm:ml-2 bg-amber-400 text-slate-900 text-xs">Beta</Badge>
					</div>
					<nav className="hidden items-center gap-4 lg:gap-6 md:flex">
						<a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
						<button 
							onClick={enterDemoMode}
							className="text-sm text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer"
						>
							Demo
						</button>
						<a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a>
						<a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</a>
					</nav>
					<div className="flex items-center gap-2 sm:gap-3">
						<ThemeToggle />
						<Button asChild variant="ghost" className="hidden lg:inline-flex" size="sm">
							<a href="#signin">Sign in</a>
						</Button>
						<Button asChild className="bg-emerald-500 text-slate-900 hover:bg-emerald-400 text-xs sm:text-sm" size="sm">
							<a href="#signin">Get the app</a>
						</Button>
					</div>
				</div>
			</header>

			<section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12 sm:pb-16 pt-16 sm:pt-20 md:pb-24 md:pt-28 lg:pt-32">
				<motion.div
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, amount: 0.4 }}
					variants={fadeUp}
					className="mx-auto max-w-3xl text-center"
				>
					<div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-1 text-xs text-muted-foreground ring-1 ring-border">
						<Star className="h-3.5 w-3.5" />
						Turn chores into XP and real rewards
					</div>
					<h1 className="mt-4 sm:mt-6 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight">
						Household management that feels like a game
					</h1>
					<p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground font-body">
						The Daily Grind blends real life goals and routines with  levels, and leaderboards. Designed for families and or anyone who wants to gamify their life.
					</p>
					<div className="mt-6 sm:mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
						<Button 
							onClick={enterDemoMode}
							className="bg-amber-400 text-slate-900 hover:bg-amber-300 w-full sm:w-auto"
						>
							Try the demo <ChevronRight className="ml-1 h-4 w-4" />
						</Button>
						<Button variant="outline" className="border-border bg-card/40 w-full sm:w-auto">
							Watch overview
						</Button>
					</div>
					<div className="mt-4 sm:mt-6 text-xs text-muted-foreground">
						Trusted by busy parents and motivated kids in 1,000+ homes
					</div>
					
					{/* Demo Troubleshooting */}
					<div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
						<div className="text-xs text-amber-800 dark:text-amber-200">
							<strong>Demo not working?</strong> If you encounter issues, try refreshing the page or clearing your browser data. 
							The demo creates temporary data that doesn't persist between sessions.
						</div>
					</div>
				</motion.div>
			</section>

			<section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20">
				<div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
					{features.map((f, i) => (
						<motion.div key={f.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
							<Card className="h-full border-border bg-card/40 backdrop-blur-sm">
								<CardHeader className="flex flex-row items-center gap-3 pb-2">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
										<f.icon className="h-5 w-5" />
									</div>
									<h3 className="text-lg font-heading font-semibold">{f.title}</h3>
								</CardHeader>
								<CardContent className="pt-0 text-muted-foreground font-body">{f.text}</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</section>

			<section id="demo" className="mx-auto max-w-7xl px-6 pb-20">
				<div className="grid items-start gap-6 lg:grid-cols-2">
					<Card className="border-border bg-card/40 backdrop-blur-sm">
						<CardHeader>
							<div className="flex items-center justify-between">
								<h3 className="text-xl font-semibold">Live Leaderboard (demo)</h3>
								<Badge className="bg-emerald-500 text-slate-900">Weekly</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-3">
							{demoLeaders.map((u, idx) => (
								<div key={u.name} className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
									<div className="flex items-center gap-3">
										<div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted font-semibold">{idx + 1}</div>
										<div>
											<div className="font-medium">{u.name}</div>
											<div className="text-xs text-muted-foreground">Level {u.level}</div>
										</div>
									</div>
									<div className="flex items-center gap-2"><Coins className="h-4 w-4" /><span className="font-semibold">{u.points}</span></div>
								</div>
							))}
						</CardContent>
						<CardFooter className="justify-between">
							<div className="text-xs text-muted-foreground">Earn XP from chores, streaks, and goals.</div>
							<Button variant="outline" className="border-border">Open full dashboard</Button>
						</CardFooter>
					</Card>

					<Card className="border-border bg-card/40 backdrop-blur-sm">
						<CardHeader>
							<h3 className="text-xl font-semibold">Get early access</h3>
							<p className="text-sm text-muted-foreground">Join the beta and receive setup templates for families and shared houses.</p>
						</CardHeader>
						<CardContent>
							<form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
								<Input type="email" placeholder="you@example.com" className="bg-background/60" />
								<Button className="bg-amber-400 text-slate-900 hover:bg-amber-300">Request invite</Button>
							</form>
							<div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
								<CheckCircle className="h-4 w-4" /> No spam. Unsubscribe anytime.
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			<section className="mx-auto max-w-7xl px-6 pb-20">
				<div className="grid gap-6 md:grid-cols-3">
					{[
						{ step: '1', title: 'Create your home', text: 'Invite family members and set roles. Import or pick starter chores.' },
						{ step: '2', title: 'Assign XP & rewards', text: 'Choose values, add streaks, and set cash-out rules.' },
						{ step: '3', title: 'Play to progress', text: 'Complete tasks, climb the board, unlock perks, repeat.' },
					].map((s) => (
						<Card key={s.step} className="border-border bg-card/40 backdrop-blur-sm">
							<CardHeader className="pb-2">
								<div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-slate-900 font-bold">{s.step}</div>
								<h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
							</CardHeader>
							<CardContent className="pt-0 text-muted-foreground">{s.text}</CardContent>
						</Card>
					))}
				</div>
			</section>

			<section id="pricing" className="mx-auto max-w-7xl px-6 pb-24">
				<div className="mb-8 text-center">
					<h2 className="text-3xl font-bold">Simple pricing</h2>
					<p className="mt-1 text-muted-foreground">Start free. Upgrade for advanced automation and more users.</p>
				</div>
				<div className="grid gap-6 md:grid-cols-2">
					<Card className="border-border bg-card/40 backdrop-blur-sm">
						<CardHeader>
							<div className="flex items-center justify-between">
								<h3 className="text-xl font-semibold">Free</h3>
								<Badge className="bg-muted">Best for starters</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-2 text-muted-foreground">
							<div className="text-3xl font-extrabold">$0</div>
							<ul className="mt-2 list-inside list-disc space-y-1 text-sm">
								<li>Up to 4 members</li>
								<li>Daily chores and streaks</li>
								<li>Basic leaderboard</li>
							</ul>
						</CardContent>
						<CardFooter>
							<Button className="w-full bg-emerald-500 text-slate-900 hover:bg-emerald-400">Get started</Button>
						</CardFooter>
					</Card>

					<Card className="border-amber-500/40 bg-card/40 backdrop-blur-sm">
						<CardHeader>
							<div className="flex items-center justify-between">
								<h3 className="text-xl font-semibold">Pro</h3>
								<Badge className="bg-amber-400 text-slate-900">Popular</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-2 text-muted-foreground">
							<div className="text-3xl font-extrabold">$6 <span className="text-base font-normal text-muted-foreground">/ month / home</span></div>
							<ul className="mt-2 list-inside list-disc space-y-1 text-sm">
								<li>Up to 10 members</li>
								<li>Cash‑out rules + allowance caps</li>
								<li>Task rotations, approvals, audit log</li>
								<li>Advanced analytics + exports</li>
							</ul>
						</CardContent>
						<CardFooter>
							<Button className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300">Upgrade</Button>
						</CardFooter>
					</Card>
				</div>
			</section>

			<section id="faq" className="mx-auto max-w-5xl px-6 pb-24">
				<h2 className="mb-6 text-center text-3xl font-bold">FAQ</h2>
				<div className="divide-y divide-border">
					{[
						{ q: 'How do points convert to money?', a: 'You set a conversion rate per home. Example: 10 points = $1. Parents approve kids\' cash‑outs.' },
						{ q: 'Can I use it with roommates?', a: 'Yes. Roles and rewards are fully customizable for families or shared houses.' },
						{ q: 'Is there parental control?', a: 'Parents approve redemptions, edit XP values, and review audit logs. Teens and kids require approval.' },
						{ q: 'Will there be iOS and Android apps?', a: 'Yes. Web first, native apps follow shortly after beta.' },
					].map((item) => (
						<details key={item.q} className="group py-4">
							<summary className="cursor-pointer list-none py-2 text-lg font-medium outline-none">
								<span className="text-foreground group-open:text-amber-300">{item.q}</span>
							</summary>
							<p className="mt-1 text-muted-foreground">{item.a}</p>
						</details>
					))}
				</div>
			</section>

			<footer className="border-t border-border bg-background/60">
				<div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
					<div className="flex items-center gap-3 text-muted-foreground">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground">
							<Logo className="h-5 w-5" />
						</div>
						<span className="text-sm">© {new Date().getFullYear()} The Daily Grind</span>
					</div>
					<div className="flex items-center gap-6 text-sm text-muted-foreground">
						<a href="#" className="hover:text-foreground">Privacy</a>
						<a href="#" className="hover:text-foreground">Terms</a>
						<a href="#" className="hover:text-foreground">Contact</a>
					</div>
				</div>
			</footer>
		</PageWrapper>
	)
}


