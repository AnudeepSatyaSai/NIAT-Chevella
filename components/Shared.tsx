
import React from 'react';

// --- Utility to safely render React nodes and prevent [object Object] ---
export const renderSafe = (val: any): React.ReactNode => {
    if (val === null || val === undefined) return null;
    
    // Primitive types are safe
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        // Prevent manual "[object Object]" strings from leaking through if they were coerced elsewhere
        if (typeof val === 'string' && val === '[object Object]') return null;
        return val;
    }
    
    // React elements are safe
    if (React.isValidElement(val)) {
        return val;
    }
    
    // Arrays need recursive cleaning
    if (Array.isArray(val)) {
        return val.map((item, index) => (
            <React.Fragment key={index}>{renderSafe(item)}</React.Fragment>
        ));
    }
    
    // If it's a plain object (like a Date or an error), stringify it if useful, or return null to avoid [object Object]
    if (typeof val === 'object') {
        if (val instanceof Date) return val.toDateString();
        // Fallback: don't render mystery objects
        return null;
    }
    
    // Functions and symbols should not be rendered as children
    return null;
};

// --- Skeleton Loader ---
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-white/5 rounded-xl border border-white/10 ${className || ''}`}></div>
);

// --- Status Badge ---
export const Badge: React.FC<{ children?: React.ReactNode, color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple' | 'cyan' | 'lime' }> = ({ children, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        green: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
        yellow: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        red: 'bg-red-500/20 text-red-300 border-red-500/30',
        gray: 'bg-white/10 text-slate-400 border-white/10',
        purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        lime: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
    };
    
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${colorClasses[color] || colorClasses.blue}`}>
            {renderSafe(children)}
        </span>
    );
};

// --- Statistics Card ---
export interface StatCardProps {
    title: string | React.ReactNode;
    value: string | number | React.ReactNode;
    icon: any;
    color: string;
    change?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, change }) => {
    const getColorClasses = (c: string) => {
        switch(c) {
            case 'cyan': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
            case 'lime': return 'text-lime-400 bg-lime-400/10 border-lime-400/20';
            case 'yellow': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'purple': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        }
    };

    return (
        <div className="overflow-hidden rounded-[2rem] bg-black/40 backdrop-blur-xl border border-white/10 p-8 shadow-2xl transition-all hover:border-cyan-500/30 group">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">
                        {renderSafe(title)}
                    </div>
                    <div className="flex items-baseline gap-x-2">
                        <span className="text-4xl font-black tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
                            {renderSafe(value)}
                        </span>
                    </div>
                </div>
                <div className={`rounded-xl p-3 border transition-transform group-hover:scale-110 ${getColorClasses(color)}`}>
                    {Icon && typeof Icon === 'function' ? (
                        <Icon className="h-6 w-6" aria-hidden="true" />
                    ) : (Icon && React.isValidElement(Icon) ? Icon : null)}
                </div>
            </div>
            {change && (
                <div className="mt-6 pt-4 border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{renderSafe(change)}</span>
                </div>
            )}
        </div>
    );
};

// --- Page Header ---
export const PageHeader: React.FC<{ title: string, subtitle?: string, action?: React.ReactNode }> = ({ title, subtitle, action }) => (
    <div className="md:flex md:items-end md:justify-between mb-12">
        <div className="min-w-0 flex-1">
            <h2 className="text-4xl font-black leading-none text-white sm:truncate sm:text-6xl sm:tracking-tighter italic uppercase">
                {renderSafe(title)}
            </h2>
            {subtitle && <p className="mt-4 text-sm font-medium text-slate-400 tracking-wide max-w-2xl">{renderSafe(subtitle)}</p>}
        </div>
        {action && (
            <div className="mt-6 flex md:ml-4 md:mt-0">
                {action}
            </div>
        )}
    </div>
);
