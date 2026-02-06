
import React, { useState } from 'react';
import { X, CheckCircle, Palette, Type, Layout, ShieldCheck, AlertCircle, Search, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ArrowUpRight, ArrowUpLeft, ArrowDownRight, ArrowDownLeft, Eye, RotateCcw } from 'lucide-react';
import { Badge, BadgeStyling, Tier, GradientDirection, UsageLimit } from '../types';
import BadgePreview from './BadgePreview';
import { FONTS, CONTAINER_ANIMATIONS, TEXT_ANIMATIONS, FONT_WEIGHTS, LETTER_SPACINGS, PATTERNS } from '../constants';

interface BadgeModalProps {
  onClose: () => void;
  onSave: (badge: any) => void;
  initialData?: Badge;
}

const TRAJECTORIES: { icon: any, value: GradientDirection }[] = [
  { icon: ArrowRight, value: 'to right' },
  { icon: ArrowLeft, value: 'to left' },
  { icon: ArrowDown, value: 'to bottom' },
  { icon: ArrowUp, value: 'to top' },
  { icon: ArrowDownRight, value: 'to bottom right' },
  { icon: ArrowUpRight, value: 'to top right' },
  { icon: ArrowDownLeft, value: 'to bottom left' },
  { icon: ArrowUpLeft, value: 'to top left' }
];

const BadgeModal: React.FC<BadgeModalProps> = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    tier: initialData?.tier || 'GOLD',
    expiryDate: initialData?.expiryDate || '2026-02-27',
    goldLimits: initialData?.goldLimits || { maxLifetime: 2, maxPerMonth: 1 },
    platinumLimits: initialData?.platinumLimits || { maxLifetime: 5, maxPerMonth: 2 },
    styling: initialData?.styling || {
      bgType: 'gradient',
      bgColor1: '#3b82f6',
      bgColor1Opacity: 1,
      bgColor2: '#1d4ed8',
      bgColor2Opacity: 1,
      gradientDirection: 'to right',
      bgOpacity: 1,
      textColor: '#ffffff',
      fontFamily: 'Inter',
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 'tracking-normal',
      bgPattern: 'none',
      patternOpacity: 0.2,
      containerAnimation: 'none',
      textAnimation: 'none'
    } as BadgeStyling
  });

  const [isConfirming, setIsConfirming] = useState(false);

  const updateStyling = (updates: Partial<BadgeStyling>) => setFormData(p => ({ ...p, styling: { ...p.styling, ...updates } }));
  const updateLimit = (tier: 'gold' | 'platinum', key: keyof UsageLimit, val: number) => setFormData(p => ({ ...p, [`${tier}Limits`]: { ...p[`${tier}Limits`], [key]: val } }));

  const handlePreSave = () => {
    if (!formData.name) return alert("Module Title required.");
    setIsConfirming(true);
  };

  const confirmSubmit = () => {
    onSave(formData);
  };

  const handleCancelAction = () => {
    if (window.confirm("ARE YOU SURE? All unsaved matrix changes will be aborted.")) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[940px] rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col max-h-[92vh] border border-white/40">

        {/* Header */}
        <div className="px-10 py-6 flex justify-between items-center border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <Palette size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-baseline gap-2 uppercase">ARCHITECT</h2>
              <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em] opacity-80">CTA CONFIGURATION ENGINE</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        {isConfirming ? (
          /* Confirmation Overlay */
          <div className="flex-1 p-12 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner ring-8 ring-blue-50/50">
              <ShieldCheck size={40} />
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Review Node Architecture</h3>
              <p className="text-sm font-medium text-slate-400 max-w-sm">Validate the final parameters of the "{formData.name}" module before live deployment.</p>
            </div>
            <div className="w-full max-w-lg bg-slate-50/50 rounded-[32px] p-8 border border-slate-100 grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IDENTIFIER</p>
                <p className="font-black text-slate-800">{formData.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TIER ALLOCATION</p>
                <p className="font-black text-slate-800">{formData.tier}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TERMINATION</p>
                <p className="font-black text-slate-800">{formData.expiryDate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KINETICS</p>
                <p className="font-black text-slate-800 uppercase text-[10px]">{formData.styling.containerAnimation} | {formData.styling.textAnimation}</p>
              </div>
            </div>
            <div className="flex gap-4 w-full max-w-sm">
              <button onClick={() => setIsConfirming(false)} className="flex-1 py-4 rounded-2xl bg-white border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">REVISE MATRIX</button>
              <button onClick={confirmSubmit} className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all">FINALIZE & DEPLOY</button>
            </div>
          </div>
        ) : (
          /* Editing Form */
          <>
            <div className="flex-1 overflow-y-auto px-10 pb-8 pt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left Col: Visual Nodes */}
                <div className="space-y-8">
                  <div className="flex items-center gap-2 text-indigo-600"><Layout size={16} /><h3 className="text-xs font-black uppercase tracking-widest">VISUAL DESIGN NODES</h3></div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">IDENTIFIER / TITLE</label>
                    <input type="text" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent font-black text-slate-800 text-base outline-none focus:bg-white focus:border-indigo-400 transition-all shadow-sm" placeholder="ENTER UNIQUE BADGE TITLE" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-[36px] border border-slate-100 space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">STYLING ENGINE</h4>
                      <div className="bg-slate-200 p-1 rounded-xl flex gap-1">
                        <button onClick={() => updateStyling({ bgType: 'solid' })} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${formData.styling.bgType === 'solid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>SOLID</button>
                        <button onClick={() => updateStyling({ bgType: 'gradient' })} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${formData.styling.bgType === 'gradient' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>GRADIENT</button>
                      </div>
                    </div>

                    {/* Color Section - Always show primary and text, conditionally end color */}
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">START COLOR NODE</label>
                        <div className="flex gap-3 items-center">
                          <input type="color" className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0" value={formData.styling.bgColor1} onChange={e => updateStyling({ bgColor1: e.target.value })} />
                          <div className="flex-1 bg-white px-3 py-2 rounded-xl border text-[10px] font-mono font-bold text-slate-500 uppercase">{formData.styling.bgColor1}</div>
                        </div>
                        <input type="range" min="0" max="1" step="0.05" className="w-full h-1.5 accent-indigo-600 bg-slate-200 rounded-full appearance-none" value={formData.styling.bgColor1Opacity} onChange={e => updateStyling({ bgColor1Opacity: parseFloat(e.target.value) })} />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TEXT COLOR NODE</label>
                        <div className="flex gap-3 items-center">
                          <input type="color" className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0" value={formData.styling.textColor} onChange={e => updateStyling({ textColor: e.target.value })} />
                          <div className="flex-1 bg-white px-3 py-2 rounded-xl border text-[10px] font-mono font-bold text-slate-500 uppercase">{formData.styling.textColor}</div>
                        </div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mt-1">BACKGROUND OPACITY</label>
                        <input type="range" min="0" max="1" step="0.05" className="w-full h-1.5 accent-indigo-600 bg-slate-200 rounded-full appearance-none" value={formData.styling.bgOpacity} onChange={e => updateStyling({ bgOpacity: parseFloat(e.target.value) })} />
                      </div>

                      {formData.styling.bgType === 'gradient' && (
                        <div className="space-y-4 col-span-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">END COLOR NODE (GRADIENT ONLY)</label>
                          <div className="flex gap-3 items-center w-1/2">
                            <input type="color" className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0" value={formData.styling.bgColor2 || '#000000'} onChange={e => updateStyling({ bgColor2: e.target.value })} />
                            <div className="flex-1 bg-white px-3 py-2 rounded-xl border text-[10px] font-mono font-bold text-slate-500 uppercase">{formData.styling.bgColor2 || '#000000'}</div>
                          </div>
                          <input type="range" min="0" max="1" step="0.05" className="w-full h-1.5 accent-indigo-600 bg-slate-200 rounded-full appearance-none" value={formData.styling.bgColor2Opacity} onChange={e => updateStyling({ bgColor2Opacity: parseFloat(e.target.value) })} />
                        </div>
                      )}
                    </div>
                    {formData.styling.bgType === 'gradient' && (
                      <div className="space-y-3 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                        {TRAJECTORIES.map((t, idx) => (<button key={idx} onClick={() => updateStyling({ gradientDirection: t.value })} className={`w-9 h-9 flex items-center justify-center rounded-xl border-2 transition-all ${formData.styling.gradientDirection === t.value ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}><t.icon size={16} /></button>))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6 pb-2">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CONTAINER KINETICS</label>
                      <select className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700 text-[11px] uppercase tracking-wider focus:bg-white outline-none" value={formData.styling.containerAnimation} onChange={e => updateStyling({ containerAnimation: e.target.value })}>
                        {CONTAINER_ANIMATIONS.map(a => <option key={a} value={a}>{a.replace('animate-', '').replace('none', 'No Movement')}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TEXT KINETICS</label>
                      <select className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700 text-[11px] uppercase tracking-wider focus:bg-white outline-none" value={formData.styling.textAnimation} onChange={e => updateStyling({ textAnimation: e.target.value })}>
                        {TEXT_ANIMATIONS.map(a => <option key={a} value={a}>{a.replace('animate-', '').replace('none', 'Static')}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Advanced Typography Section */}
                  <div className="bg-indigo-50/30 p-6 rounded-[32px] border border-indigo-100/50 space-y-6">
                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                      <Type size={14} />
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">TYPOGRAPHY ENGINE</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">FONT SCALE</label>
                          <span className="text-[11px] font-black text-indigo-600">{formData.styling.fontSize}px</span>
                        </div>
                        <input type="range" min="10" max="28" step="1" className="w-full h-1.5 accent-indigo-600 bg-slate-200 rounded-full appearance-none" value={formData.styling.fontSize} onChange={e => updateStyling({ fontSize: parseInt(e.target.value) })} />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">WEIGHT</label>
                        <select className="w-full px-4 py-2 rounded-xl bg-white border border-slate-100 font-bold text-slate-700 text-[10px] outline-none" value={formData.styling.fontWeight} onChange={e => updateStyling({ fontWeight: e.target.value })}>
                          {FONT_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">LETTER SPACING</label>
                        <select className="w-full px-4 py-2 rounded-xl bg-white border border-slate-100 font-bold text-slate-700 text-[10px] outline-none" value={formData.styling.letterSpacing} onChange={e => updateStyling({ letterSpacing: e.target.value })}>
                          {LETTER_SPACINGS.map(ls => <option key={ls.value} value={ls.value}>{ls.label}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">FONT FACE</label>
                        <select className="w-full px-4 py-2 rounded-xl bg-white border border-slate-100 font-bold text-slate-700 text-[10px] outline-none" value={formData.styling.fontFamily} onChange={e => updateStyling({ fontFamily: e.target.value })}>
                          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Surface Pattern Section */}
                  <div className="bg-slate-50/80 p-6 rounded-[32px] border border-slate-200/50 space-y-4">
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                      <ShieldCheck size={14} />
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">SURFACE PATTERN</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">OVERLAY STYLE</label>
                        <div className="flex flex-wrap gap-2">
                          {PATTERNS.map(p => (
                            <button key={p.id} onClick={() => updateStyling({ bgPattern: p.id as any })} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${formData.styling.bgPattern === p.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'}`}>{p.label}</button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PATTERN INTENSITY</label>
                          <span className="text-[10px] font-black text-slate-400">{Math.round((formData.styling.patternOpacity || 0) * 100)}%</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.05" className="w-full h-1.5 accent-indigo-600 bg-slate-200 rounded-full appearance-none" value={formData.styling.patternOpacity || 0.2} onChange={e => updateStyling({ patternOpacity: parseFloat(e.target.value) })} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col: Parameters */}
                <div className="space-y-8">
                  <div className="flex items-center gap-2 text-indigo-600"><ShieldCheck size={16} /><h3 className="text-xs font-black uppercase tracking-widest">GOVERNANCE & LIMITS</h3></div>

                  <div className="flex gap-3">
                    {(['GOLD', 'PLATINUM', 'BOTH'] as Tier[]).map(t => (
                      <button key={t} onClick={() => setFormData({ ...formData, tier: t })} className={`flex-1 py-4 rounded-2xl text-[10px] font-black border-2 tracking-[0.2em] transition-all uppercase ${formData.tier === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-100'}`}>{t}</button>
                    ))}
                  </div>

                  <div className="bg-slate-50 p-6 rounded-[36px] border border-slate-100 space-y-6">
                    {(formData.tier === 'GOLD' || formData.tier === 'BOTH') && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-200"></div><span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">GOLD MEMBERSHIP</span></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase">LIFETIME CAP</p><input type="number" className="w-full bg-white px-4 py-2.5 rounded-xl font-black text-slate-800 text-base shadow-sm outline-none border-2 border-transparent focus:border-amber-400" value={formData.goldLimits.maxLifetime} onChange={e => updateLimit('gold', 'maxLifetime', parseInt(e.target.value))} /></div>
                          <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase">MONTHLY LIMIT</p><input type="number" className="w-full bg-white px-4 py-2.5 rounded-xl font-black text-slate-800 text-base shadow-sm outline-none border-2 border-transparent focus:border-amber-400" value={formData.goldLimits.maxPerMonth} onChange={e => updateLimit('gold', 'maxPerMonth', parseInt(e.target.value))} /></div>
                        </div>
                      </div>
                    )}
                    {(formData.tier === 'PLATINUM' || formData.tier === 'BOTH') && (
                      <div className="space-y-3 pt-2 border-t border-slate-200/50">
                        <div className="flex items-center gap-2 pt-2"><div className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-200"></div><span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">PLATINUM MEMBERSHIP</span></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase">LIFETIME CAP</p><input type="number" className="w-full bg-white px-4 py-2.5 rounded-xl font-black text-slate-800 text-base shadow-sm outline-none border-2 border-transparent focus:border-indigo-400" value={formData.platinumLimits.maxLifetime} onChange={e => updateLimit('platinum', 'maxLifetime', parseInt(e.target.value))} /></div>
                          <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase">MONTHLY LIMIT</p><input type="number" className="w-full bg-white px-4 py-2.5 rounded-xl font-black text-slate-800 text-base shadow-sm outline-none border-2 border-transparent focus:border-indigo-400" value={formData.platinumLimits.maxPerMonth} onChange={e => updateLimit('platinum', 'maxPerMonth', parseInt(e.target.value))} /></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TERMINATION DATE</label><input type="date" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 font-black text-slate-800 text-xs outline-none focus:bg-white focus:border-indigo-400 transition-all shadow-sm" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} /></div>
                    <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">INTERNAL REGISTRY MEMO</label><textarea className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600 outline-none h-14 resize-none focus:bg-white focus:border-indigo-400 transition-all shadow-sm" placeholder="OPTIONAL MEMO..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                  </div>

                  <div className="pt-2">
                    <div className="w-full h-32 rounded-[32px] border-4 border-slate-50 border-dashed flex items-center justify-center bg-white shadow-inner p-6">
                      <div className="scale-[1.4] origin-center">
                        <BadgePreview name={formData.name} styling={formData.styling} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-12 py-8 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center">
              <button onClick={handleCancelAction} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-800 flex items-center gap-3 transition-all"><X size={16} /> ABORT MATRIX</button>
              <div className="flex gap-4">
                <button onClick={handleCancelAction} className="px-8 py-4 rounded-2xl bg-white border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 hover:border-slate-200 transition-all">CANCEL</button>
                <button onClick={handlePreSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-14 py-4 rounded-2xl font-black transition-all shadow-2xl shadow-indigo-200 uppercase tracking-[0.2em] text-[11px] flex items-center gap-3 active:scale-95">
                  {initialData ? 'UPDATE PARAMETERS' : 'CREATE BADGE'} <ShieldCheck size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BadgeModal;
