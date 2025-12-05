import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Code, TrendingUp, Users, Zap, ArrowRight } from 'lucide-react';

export default function LandingPage() {
    const [handle, setHandle] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (handle.trim()) {
            navigate(`/user/${encodeURIComponent(handle.trim())}`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0a0a] text-white selection:bg-amber-500/30">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <div className="z-10 max-w-5xl w-full px-6 flex flex-col items-center text-center">

                {/* Hero Badge */}
                <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xl hover:bg-white/10 transition-colors cursor-default">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-gray-300 tracking-wide uppercase">Codeforces Analytics</span>
                    </div>
                </div>

                {/* Hero Title */}
                <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-500">
                            Leet
                        </span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-600 relative">
                            Forces
                            <Code className="absolute -top-8 -right-12 text-amber-500/20 rotate-12" size={80} />
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
                        Visualize your competitive programming journey with a <span className="text-white font-medium">premium</span>, LeetCode-inspired dashboard.
                    </p>
                </div>

                {/* Search Section */}
                <div className="w-full max-w-xl mx-auto mb-20 relative group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500 group-hover:duration-200 animate-tilt"></div>
                    <form onSubmit={handleSubmit} className="relative flex flex-col md:flex-row items-center bg-[#111] rounded-2xl shadow-2xl border border-white/10 p-2 transition-transform duration-200 group-hover:scale-[1.01]">
                        <div className="flex items-center w-full md:w-auto flex-1">
                            <Search className="ml-4 text-gray-500 group-focus-within:text-amber-400 transition-colors hidden md:block" size={24} />
                            <Search className="ml-2 text-gray-500 group-focus-within:text-amber-400 transition-colors md:hidden" size={20} />
                            <input
                                type="text"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                placeholder="Enter Codeforces Handle..."
                                className="flex-1 bg-transparent border-none outline-none px-3 md:px-4 py-3 md:py-4 text-base md:text-lg text-white placeholder-gray-600 font-medium w-full"
                                autoFocus
                                spellCheck={false}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!handle.trim()}
                            className="w-full md:w-auto mt-2 md:mt-0 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
                        >
                            Visualize
                            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    {/* Quick Links / Suggestions could go here */}
                    {/* Quick Links / Suggestions */}
                    <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-400 relative z-20">
                        <span className="font-medium">Try:</span>
                        <button onClick={() => setHandle('tourist')} className="hover:text-amber-400 text-gray-300 transition-colors border-b border-dotted border-gray-500 hover:border-amber-400 pb-0.5">tourist</button>
                        <button onClick={() => setHandle('Benq')} className="hover:text-amber-400 text-gray-300 transition-colors border-b border-dotted border-gray-500 hover:border-amber-400 pb-0.5">Benq</button>
                        <button onClick={() => setHandle('Petr')} className="hover:text-amber-400 text-gray-300 transition-colors border-b border-dotted border-gray-500 hover:border-amber-400 pb-0.5">Petr</button>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <FeatureCard
                        icon={<TrendingUp className="text-green-400" size={24} />}
                        title="Rating Analytics"
                        description="Deep dive into your contest performance with interactive, responsive charts."
                        delay="0.5s"
                    />
                    <FeatureCard
                        icon={<Zap className="text-amber-400" size={24} />}
                        title="Activity Heatmap"
                        description="Visualize your daily consistency with a beautiful, GitHub-style submission graph."
                        delay="0.6s"
                    />
                    <FeatureCard
                        icon={<Users className="text-blue-400" size={24} />}
                        title="Compare Profiles"
                        description="Head-to-head comparison with friends or top competitive programmers."
                        delay="0.7s"
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="mt-20 mb-8 text-sm text-gray-600 font-medium tracking-wide animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                BUILT BY SIDDARTHA KARRI
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description, delay }) {
    return (
        <div
            className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all duration-300 hover:-translate-y-2 group"
        >
            <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300 border border-white/5">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-amber-400 transition-colors">{title}</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
                {description}
            </p>
        </div>
    );
}
