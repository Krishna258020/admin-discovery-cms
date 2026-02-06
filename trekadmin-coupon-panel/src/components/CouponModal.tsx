import React, { useState, useEffect, useRef } from 'react';
import { X, List, ListOrdered, Sparkles, RefreshCw, Eye, Check, AlertCircle, Instagram, Youtube, Facebook, Twitter, Plus, Trash2, Calendar, Clock, Users, MapPin, Copy, ExternalLink, CreditCard, Landmark, DollarSign, Percent, BarChart, Briefcase, Bold, Underline, GripVertical, PlusCircle, MinusCircle, Palette, ChevronDown, AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo2, Redo2, Minus, Type } from 'lucide-react';
import { Coupon, CouponScope, DiscountMode, Vendor, SocialPlatform, SocialProfile, DiscountModeConfig, CommissionBasis, CommissionType, CommissionSlab } from '../types';
import { generateCouponDescription } from '../services/geminiService';
import VendorSelectionModal from './VendorSelectionModal';
import ConfirmationModal from './ConfirmationModal';

const WORD_COLOR_PALETTE = [
  // Text colors
  ['#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#D9D9D9', '#F2F2F2'],
  
  // Blues
  ['#1F4E79', '#2E75B6', '#5B9BD5', '#8FAADC', '#BDD7EE', '#DDEBF7', '#F2F8FD'],
  
  // Oranges
  ['#7F6000', '#C65911', '#ED7D31', '#F4B183', '#F8CBAD', '#FCE4D6', '#FFF3E6'],
  
  // Greens
  ['#375623', '#548235', '#70AD47', '#A9D18E', '#C6E0B4', '#E2EFDA', '#F4FBF1'],
  
  // Reds
  ['#7F0000', '#C00000', '#FF0000', '#FF7C80', '#FFB3B3', '#FFD6D6', '#FFF2F2'],
  
  // Purples
  ['#403151', '#7030A0', '#9E7CC1', '#B4A7D6', '#D9D2E9', '#EEEAF4', '#F8F6FB'],
];

const FONT_FAMILIES = [
  'Arial', 'Calibri', 'Cambria', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Segoe UI', 'Garamond', 'Courier New', 'Consolas', 'Lucida Console', 'Palatino Linotype', 'Book Antiqua', 'Century Gothic', 'Franklin Gothic Medium', 'Impact'
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 48, 72];

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  scope: CouponScope;
  couponToEdit?: Coupon;
  onSave: (coupon: any) => void;
  isFromRequest?: boolean; 
  requestDetails?: { vendorId: string, vendorName: string, trekId?: string, trekName?: string };
  availableModes: DiscountModeConfig[];
  vendors: Vendor[];
}

const CouponModal: React.FC<CouponModalProps> = ({ isOpen, onClose, scope, couponToEdit, onSave, isFromRequest, requestDetails, availableModes, vendors }) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [showVendorSelector, setShowVendorSelector] = useState(false);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [richTextTerms, setRichTextTerms] = useState<string>('');
  const [termsList, setTermsList] = useState<string[]>(['']);

  // Validation State
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  
  // Refs for auto-focusing
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>>({});
  
  // Internal Confirmation State
  const [showConfirm, setShowConfirm] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    description: '',
    scope: scope,
    mode: 'PERCENTAGE',
    validFrom: '',
    validTill: undefined,
    totalUsageLimit: undefined,
    userLimit: 1, 
    autoApply: false,
    config: {
      discountValue: undefined as any,
      commissionBasis: 'BOOKING_BEFORE_DISCOUNT',
      commissionType: 'PERCENTAGE',
      payoutRules: {
          releaseOnCompletion: true,
          reverseOnCancel: true,
          lockInDays: 7
      }
    }
  });
  const [fontSizeInput, setFontSizeInput] = useState('14');
  const [noExpiry, setNoExpiry] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<Vendor[]>([]);
  const [socials, setSocials] = useState<SocialProfile[]>([]);
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>('INSTAGRAM');
  const [tempHandle, setTempHandle] = useState('');
  
  // Influencer Payment Details State
  const [bankDetails, setBankDetails] = useState({
      bankName: '',
      accountHolder: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifsc: ''
  });
  const [upiId, setUpiId] = useState('');

  // Influencer Commission State
  const [commissionSlabs, setCommissionSlabs] = useState<CommissionSlab[]>([]);

  // State management functions for terms
  const handleAddTerm = () => setTermsList([...termsList, '']);
  const handleRemoveTerm = (index: number) => {
    if (termsList.length > 1) {
      setTermsList(termsList.filter((_, i) => i !== index));
    } else {
      setTermsList(['']);
    }
  };
  const handleTermChange = (index: number, val: string) => {
    const newList = [...termsList];
    newList[index] = val;
    setTermsList(newList);
  };

  useEffect(() => {
    if (couponToEdit) {
      setFormData({
          ...couponToEdit,
          validFrom: couponToEdit.validFrom ? couponToEdit.validFrom.slice(0, 16) : '',
          validTill: couponToEdit.validTill ? couponToEdit.validTill.slice(0, 16) : undefined
      });
      setNoExpiry(!couponToEdit.validTill);
      
      if (couponToEdit.scope === 'SPECIAL' && couponToEdit.targetVendorIds) {
        const vendorsList = vendors.filter(v => couponToEdit.targetVendorIds?.includes(v.id));
        setSelectedVendors(vendorsList);
      }
      if (couponToEdit.config?.influencerSocials) {
        setSocials(couponToEdit.config.influencerSocials);
      }
      if (couponToEdit && couponToEdit.scope === 'PLATFORM') {
        setRichTextTerms(
          (couponToEdit.config?.termsAndConditions as string) || ''
        );
      } else {
        setTermsList((couponToEdit.config?.termsAndConditions as string[]) || ['']);
      }

      // Load Bank/UPI
      if (couponToEdit.scope === 'INFLUENCER') {
          setBankDetails({
              bankName: couponToEdit.config.bankName || '',
              accountHolder: couponToEdit.config.bankAccountHolder || '',
              accountNumber: couponToEdit.config.bankAccountNumber || '',
              confirmAccountNumber: couponToEdit.config.bankAccountNumber || '',
              ifsc: couponToEdit.config.bankIfsc || ''
          });
          setUpiId(couponToEdit.config.upiId || '');
          
          if(couponToEdit.config.commissionSlabs) {
              setCommissionSlabs(couponToEdit.config.commissionSlabs);
          }
      }

    } else if (isFromRequest && requestDetails) {
       setFormData({
        code: '',
        description: '',
        scope: scope,
        mode: availableModes.length > 0 ? availableModes[0].id : 'PERCENTAGE',
        validFrom: '',
        validTill: undefined,
        totalUsageLimit: undefined,
        userLimit: 1,
        autoApply: false,
        config: {
          discountValue: undefined as any,
          commissionBasis: 'BOOKING_BEFORE_DISCOUNT',
          commissionType: 'PERCENTAGE',
          payoutRules: { releaseOnCompletion: true, reverseOnCancel: true, lockInDays: 7 }
        }
      });
    } else {
      // Clean Slate
      setFormData({
        code: '',
        description: '',
        scope: scope,
        mode: availableModes.length > 0 ? availableModes[0].id : 'PERCENTAGE',
        validFrom: '',
        validTill: undefined,
        totalUsageLimit: undefined,
        userLimit: 1,
        autoApply: false,
        config: {
          discountValue: undefined as any,
          commissionBasis: 'BOOKING_BEFORE_DISCOUNT',
          commissionType: 'PERCENTAGE',
          payoutRules: { releaseOnCompletion: true, reverseOnCancel: true, lockInDays: 7 }
        }
      });
      setNoExpiry(false);
      setSelectedVendors([]);
      setSocials([]);
      setTempHandle('');
      setBankDetails({ bankName: '', accountHolder: '', accountNumber: '', confirmAccountNumber: '', ifsc: '' });
      setUpiId('');
      setCommissionSlabs([]);
      setTermsList(['']);
    }
    setErrors({});
    setCopied(false);
  }, [couponToEdit, scope, isOpen, availableModes, isFromRequest]);

  if (!isOpen) return null;

  const inputClass = (field: string) =>
    `mt-1 block w-full rounded-md border shadow-sm p-2 sm:text-sm ${
      errors[field]
        ? 'border-red-500 ring-1 ring-red-500 animate-shake'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }`;

  const validateForm = () => {
      const newErrors: Record<string, boolean> = {};
      if (!formData.code) newErrors.code = true;
      if (!formData.description) newErrors.description = true;
      if (!formData.validFrom) newErrors.validFrom = true;
      if (!noExpiry && !formData.validTill) newErrors.validTill = true;
      if (!formData.config?.discountValue) newErrors.discountValue = true;
      if (!formData.totalUsageLimit) newErrors.totalUsageLimit = true;
      
      if (scope === 'SPECIAL' && selectedVendors.length === 0) {
          alert("Please select at least one vendor for Special coupons."); 
          return false;
      }
      
      if (scope === 'INFLUENCER') {
          const hasUpi = !!upiId;
          const hasFullBank = !!(bankDetails.bankName && bankDetails.accountHolder && bankDetails.accountNumber && bankDetails.ifsc);
          
          if (!hasUpi && !hasFullBank) {
              newErrors.paymentMethod = true;
              alert("Please provide either complete Bank Details or a UPI ID for influencer commission.");
              return false;
          }
          
          if (!hasUpi && hasFullBank) {
              if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
                   newErrors.confirmAccountNumber = true;
                   setErrors(prev => ({...prev, confirmAccountNumber: true}));
                   alert("Bank Account Numbers do not match! Please check and try again.");
                   return false;
              }
          }
          
          if (formData.config?.commissionType === 'TIERED' && commissionSlabs.length === 0) {
              alert("Please add at least one slab for tiered commission.");
              return false;
          }
          if (formData.config?.commissionType !== 'TIERED' && !formData.config?.commissionValue) {
              newErrors.commissionValue = true;
          }
      }

      setErrors(newErrors);
      
      if (Object.keys(newErrors).length > 0) {
          const firstError = Object.keys(newErrors)[0];
          if (fieldRefs.current[firstError]) {
              fieldRefs.current[firstError]?.focus();
              fieldRefs.current[firstError]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return false;
      }

      return true;
  };

  const handleGenerateCode = () => {
    const prefix = scope.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData({ ...formData, code: `${prefix}_${random}` });
    setErrors(prev => ({...prev, code: false}));
  };

  const handleAiDescription = async () => {
    if (!formData.code || !formData.config?.discountValue) return;
    setLoadingAi(true);
    const desc = await generateCouponDescription(
      formData.code, 
      formData.mode || 'PERCENTAGE', 
      formData.config?.discountValue, 
      scope
    );
    setFormData({ ...formData, description: desc });
    setErrors(prev => ({...prev, description: false}));
    setLoadingAi(false);
  };

  const handleCopyCode = () => {
      if(formData.code) {
          navigator.clipboard.writeText(formData.code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  };

  const generateSocialUrl = (platform: SocialPlatform, handle: string) => {
      const cleanHandle = handle.replace('@', '');
      switch(platform) {
          case 'INSTAGRAM': return `https://instagram.com/${cleanHandle}`;
          case 'YOUTUBE': return `https://youtube.com/@${cleanHandle}`;
          case 'FACEBOOK': return `https://facebook.com/${cleanHandle}`;
          case 'TWITTER': return `https://twitter.com/${cleanHandle}`;
          default: return '#';
      }
  };

  const handleAddSocial = () => {
      if (tempHandle) {
          const url = generateSocialUrl(activePlatform, tempHandle);
          setSocials([...socials, { platform: activePlatform, handle: tempHandle, url }]);
          setTempHandle('');
      }
  };

  const handleAddSlab = () => {
      setCommissionSlabs([...commissionSlabs, { from: 0, to: null, value: 0 }]);
  };

  const handleRemoveSlab = (idx: number) => {
      setCommissionSlabs(commissionSlabs.filter((_, i) => i !== idx));
  };

  const handleUpdateSlab = (idx: number, field: keyof CommissionSlab, value: any) => {
      const updated = [...commissionSlabs];
      updated[idx] = { ...updated[idx], [field]: value };
      setCommissionSlabs(updated);
  };

  const handleSaveClick = () => {
     if (validateForm()) {
         setShowConfirm(true);
     }
  };

  const performSave = () => {
    const finalTerms = scope === 'PLATFORM' 
      ? richTextTerms 
      : termsList.filter(t => t.trim() !== '');
    
    onSave({
      ...formData,
      targetVendorIds: selectedVendors.map(v => v.id),
      config: {
        ...formData.config,
        termsAndConditions: finalTerms,
        influencerSocials: socials,
        ...(scope === 'INFLUENCER'
          ? {
              bankName: bankDetails.bankName,
              bankAccountHolder: bankDetails.accountHolder,
              bankAccountNumber: bankDetails.accountNumber,
              bankIfsc: bankDetails.ifsc,
              upiId: upiId,
              commissionSlabs:
                formData.config?.commissionType === 'TIERED'
                  ? commissionSlabs
                  : undefined
            }
          : {}),
        ...(isFromRequest
          ? {
              requestedByVendorId: requestDetails?.vendorId,
              requestedByVendorName: requestDetails?.vendorName,
              specificTrekId: requestDetails?.trekId,
              specificTrekName: requestDetails?.trekName
            }
          : {})
      }
    });

    setShowConfirm(false);
  };

  // ================= PLATFORM TERMS EDITOR =================
  const execCommand = (command: string, value: string = '') => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    setRichTextTerms(editorRef.current.innerHTML);
  };

  const applyFontFamily = (font: string) => {
    execCommand('fontName', font);
  };

  const applyFontSize = (size: string) => {
    if (!editorRef.current || !size) return;
    const px = size.endsWith('px') ? size : `${size}px`;
    editorRef.current.focus();

    // Use a temporary marker to find the inserted font tag
    document.execCommand('fontSize', false, '7');
    const fontTags = editorRef.current.querySelectorAll('font[size="7"]');
    fontTags.forEach((tag) => {
      const span = document.createElement('span');
      span.style.fontSize = px;
      span.innerHTML = tag.innerHTML;
      tag.parentNode?.replaceChild(span, tag);
    });

    setRichTextTerms(editorRef.current.innerHTML);
  };

  const adjustFontSize = (delta: number) => {
    const currentSize = parseInt(fontSizeInput);
    const newSize = Math.max(8, Math.min(100, currentSize + delta));
    setFontSizeInput(newSize.toString());
    applyFontSize(newSize.toString());
  };

  // Sync font size input with cursor position
  const syncSelectionStyles = () => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let node = selection.anchorNode;
      if (node && node.nodeType === 3) node = node.parentNode;
      if (node && node instanceof HTMLElement) {
        const computedStyle = window.getComputedStyle(node);
        const size = computedStyle.fontSize;
        if (size) {
          setFontSizeInput(size.replace('px', ''));
        }
      }
    }
    setRichTextTerms(editorRef.current.innerHTML);
  };

  const renderTermsEditor = () => {
    if (scope === 'PLATFORM') {
      return (
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Platform Terms (Manual Rich Text)
          </label>

          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
            
            {/* Toolbar */}
            <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1.5 items-center">
              
              <div className="flex bg-white border border-gray-200 rounded-lg shadow-sm p-0.5">
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); execCommand('undo'); }}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                  title="Undo"
                >
                  <Undo2 size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); execCommand('redo'); }}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                  title="Redo"
                >
                  <Redo2 size={14} />
                </button>
              </div>

              <div className="h-6 w-px bg-gray-300 mx-1"></div>

              {/* Font Family */}
              <select
                onChange={(e) => applyFontFamily(e.target.value)}
                defaultValue="Arial"
                className="text-xs px-2 py-1.5 bg-white border border-gray-200 rounded-lg w-[140px] focus:ring-1 focus:ring-blue-500 shadow-sm"
              >
                {FONT_FAMILIES.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>

              {/* Font Size Controls */}
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-sm px-1.5 py-0.5">
                <button 
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); adjustFontSize(-1); }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Minus size={12}/>
                </button>
                <input
                  type="text"
                  list="font-sizes"
                  value={fontSizeInput}
                  placeholder="Size"
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setFontSizeInput(val);
                    if (val && !isNaN(Number(val)) && Number(val) > 0) {
                        applyFontSize(val);
                    }
                  }}
                  onBlur={() => applyFontSize(fontSizeInput)}
                  className="w-10 text-xs py-0.5 bg-transparent border-none text-center outline-none font-bold text-gray-700"
                  title="Font Size"
                />
                <button 
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); adjustFontSize(1); }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Plus size={12}/>
                </button>
              </div>

              <datalist id="font-sizes">
                {FONT_SIZES.map(size => (
                  <option key={size} value={size} />
                ))}
              </datalist>

              <div className="h-6 w-px bg-gray-300 mx-1"></div>

              {/* Text Styles */}
              <div className="flex bg-white border border-gray-200 rounded-lg shadow-sm p-0.5">
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                  title="Bold"
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); execCommand('underline'); }}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                  title="Underline"
                >
                  <Underline size={14} />
                </button>
              </div>

              {/* Color Palette */}
              <div className="relative group">
                <button 
                  type="button"
                  className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 text-gray-700 transition-colors flex items-center gap-1.5"
                  title="Text Color"
                >
                  <Palette size={14} />
                  <ChevronDown size={10} />
                </button>
                <div className="absolute top-full left-0 mt-1 p-3 bg-white border border-gray-200 rounded-xl shadow-2xl hidden group-hover:block z-50 animate-pop-in">
                  <div className="space-y-1">
                    {WORD_COLOR_PALETTE.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex gap-1">
                        {row.map(color => (
                          <button
                            key={color}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); execCommand('foreColor', color); }}
                            className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition-transform shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-6 w-px bg-gray-300 mx-1"></div>

              {/* Alignment */}
              <div className="flex bg-white border border-gray-200 rounded-lg shadow-sm p-0.5">
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); execCommand('justifyLeft'); }}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-700"
                  title="Align Left"
                >
                  <AlignLeft size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); execCommand('justifyCenter'); }}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-700"
                  title="Align Center"
                >
                  <AlignCenter size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); execCommand('justifyRight'); }}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-700"
                  title="Align Right"
                >
                  <AlignRight size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); execCommand('justifyFull'); }}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-700"
                  title="Justify"
                >
                  <AlignJustify size={14} />
                </button>
              </div>

              {/* Lists */}
              <div className="flex bg-white border border-gray-200 rounded-lg shadow-sm p-0.5">
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); execCommand('insertUnorderedList'); }}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-700"
                  title="Bullet Points"
                >
                  <List size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); execCommand('insertOrderedList'); }}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-700"
                  title="Numbered List"
                >
                  <ListOrdered size={14} />
                </button>
              </div>

              <div className="h-6 w-px bg-gray-300 mx-1"></div>

              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); execCommand('removeFormat'); }}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 text-gray-700 transition-colors text-xs font-bold"
                title="Clear Formatting"
              >
                Clear
              </button>
            </div>

            {/* Editable Content */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={syncSelectionStyles}
              onMouseUp={syncSelectionStyles}
              onKeyUp={syncSelectionStyles}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
              }}
              className="p-6 min-h-[160px] max-h-[300px] overflow-y-auto outline-none text-sm leading-relaxed focus:bg-gray-50/20 transition-colors"
              style={{ wordBreak: 'break-word', fontFamily: 'Arial' }}
            />
          </div>

          <div className="text-xs text-gray-500 text-right font-medium">
            {editorRef.current?.innerText.length || 0} characters
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Point-wise Terms
            </label>
            <button 
              onClick={handleAddTerm} 
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-[10px] font-bold uppercase"
            >
                <PlusCircle size={12} /> Add Point
            </button>
        </div>
        <div className="space-y-2">
          {termsList.map((term, index) => (
            <div key={index} className="flex items-center gap-2 group animate-fade-in">
              <GripVertical size={14} className="text-gray-300 flex-shrink-0" />
              <input 
                type="text" 
                value={term}
                placeholder={`Term ${index + 1}...`}
                onChange={(e) => handleTermChange(index, e.target.value)}
                className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-gray-400 outline-none shadow-sm"
              />
              <button 
                onClick={() => handleRemoveTerm(index)} 
                className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
              >
                <MinusCircle size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSpecificFields = () => {
    switch (scope) {
      case 'PLATFORM':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className={formData.targetCondition === 'MIN_ORDER' ? 'col-span-1' : 'col-span-2'}>
              <label className="block text-sm font-medium text-gray-700">Target Condition</label>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                value={formData.targetCondition || 'NONE'}
                onChange={(e) => setFormData({...formData, targetCondition: e.target.value as any})}
              >
                <option value="NONE">All Users (Once per user)</option>
                <option value="NEW_USER">New Users Only</option>
                <option value="FIRST_BOOKING">First Booking Only</option>
                <option value="MIN_ORDER">Min Order Value</option>
              </select>
            </div>
            {formData.targetCondition === 'MIN_ORDER' && (
              <div className="animate-fade-in col-span-1">
                <label className="block text-sm font-medium text-gray-700">Minimum Order Value (₹)</label>
                <input 
                  type="number"
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 2000"
                  value={formData.config?.minOrderValue || ''}
                  onChange={(e) => setFormData({
                    ...formData, 
                    config: {
                      ...formData.config!, 
                      minOrderValue: Math.max(0, parseFloat(e.target.value) || 0)
                    }
                  })}
                />
              </div>
            )}
          </div>
        );
      case 'NORMAL':
        return (
           <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vendor Limit Freq</label>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                value={formData.config?.vendorFrequency || 'MONTHLY'}
                onChange={(e) => setFormData({...formData, config: {...formData.config!, vendorFrequency: e.target.value as any}})}
              >
                <option value="MONTHLY">Per Month</option>
                <option value="LIFETIME">Lifetime</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Max Uses Per Vendor</label>
              <input 
                type="number" 
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                value={formData.config?.vendorLimit || 5}
                onChange={(e) => setFormData({...formData, config: {...formData.config!, vendorLimit: Math.max(0, parseInt(e.target.value) || 0)}})}
              />
            </div>
           </div>
        );
      case 'SPECIAL':
        return (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Targeted Vendors <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-3 mb-2">
                 <button 
                    onClick={() => setShowVendorSelector(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors"
                 >
                     <Users size={16} />
                     Select Vendors
                 </button>
                 <span className={`text-sm ${selectedVendors.length === 0 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                    {selectedVendors.length} vendors selected
                 </span>
            </div>
            {selectedVendors.length > 0 && (
                <div className="border rounded-md p-2 max-h-32 overflow-y-auto bg-gray-50 flex flex-wrap gap-2">
                {selectedVendors.map(v => (
                    <div key={v.id} className="flex items-center bg-white border border-gray-200 rounded-md px-2 py-1 text-xs shadow-sm">
                        <span className="font-medium mr-1">{v.name}</span>
                        <button onClick={() => setSelectedVendors(selectedVendors.filter(sv => sv.id !== v.id))} className="text-red-500 hover:text-red-700"><X size={12}/></button>
                    </div>
                ))}
                </div>
            )}
            <VendorSelectionModal 
                isOpen={showVendorSelector}
                onClose={() => setShowVendorSelector(false)}
                selectedIds={selectedVendors.map(v => v.id)}
                onConfirm={(vendors) => setSelectedVendors(vendors)}
                vendors={vendors}
            />
          </div>
        );
      case 'PREMIUM':
        return (
           <div className="grid grid-cols-2 gap-4">
             {isFromRequest && (
                 <div className="col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-100 mb-2">
                     <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Request Source</p>
                     <p className="text-sm font-medium text-gray-900">{requestDetails?.vendorName} (Approved)</p>
                     {requestDetails?.trekName && (
                          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-700">
                             <MapPin size={12}/> Target Trek: {requestDetails.trekName}
                          </div>
                     )}
                 </div>
             )}
             
             {(formData.config?.specificTrekName || requestDetails?.trekName) && (
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Specific Trek (Locked)</label>
                    <input 
                        type="text" 
                        disabled 
                        value={formData.config?.specificTrekName || requestDetails?.trekName || ''}
                        className="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 text-gray-500 shadow-sm p-2 border sm:text-sm"
                    />
                </div>
             )}

             <div>
              <label className="block text-sm font-medium text-gray-700">Target Tier</label>
              <div className="flex gap-4 mt-2">
                {['GOLD', 'PLATINUM', 'BOTH'].map((tier) => (
                  <label key={tier} className="flex items-center">
                    <input 
                      type="radio" 
                      name="tier" 
                      value={tier}
                      checked={formData.config?.tierTarget === tier}
                      onChange={(e) => setFormData({...formData, config: {...formData.config!, tierTarget: e.target.value as any}})}
                      className="text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">{tier}</span>
                  </label>
                ))}
              </div>
             </div>
           </div>
        );
      case 'INFLUENCER':
        return (
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Influencer Name</label>
                  <input 
                    type="text" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    value={formData.config?.influencerName || ''}
                    onChange={(e) => setFormData({...formData, config: {...formData.config!, influencerName: e.target.value}})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile No</label>
                  <input 
                    type="tel" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    placeholder="+91 98765 43210"
                    value={formData.config?.influencerMobile || ''}
                    onChange={(e) => setFormData({...formData, config: {...formData.config!, influencerMobile: e.target.value}})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input 
                    type="email" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    placeholder="influencer@example.com"
                    value={formData.config?.influencerEmail || ''}
                    onChange={(e) => setFormData({...formData, config: {...formData.config!, influencerEmail: e.target.value}})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input 
                    type="text" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    placeholder="123 Creator St, Mumbai"
                    value={formData.config?.influencerAddress || ''}
                    onChange={(e) => setFormData({...formData, config: {...formData.config!, influencerAddress: e.target.value}})}
                  />
                </div>

                {/* COMMISSION STRUCTURE */}
                <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase size={16} className="text-indigo-600"/>
                        Commission Structure
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="col-span-1">
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Commission Calculated On</label>
                             <select 
                                className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                                value={formData.config?.commissionBasis || 'BOOKING_BEFORE_DISCOUNT'}
                                onChange={(e) => setFormData({...formData, config: {...formData.config!, commissionBasis: e.target.value as any}})}
                             >
                                 <option value="BOOKING_BEFORE_DISCOUNT">Booking Amount (Before Discount)</option>
                                 <option value="BOOKING_AFTER_DISCOUNT">Booking Amount (After Discount)</option>
                                 <option value="DISCOUNT_AMOUNT">Discount Amount Only</option>
                             </select>
                             <p className="text-[10px] text-gray-400 mt-1">Base amount used for calculation.</p>
                        </div>
                        <div className="col-span-1">
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Commission Type</label>
                             <select 
                                className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                                value={formData.config?.commissionType || 'PERCENTAGE'}
                                onChange={(e) => setFormData({...formData, config: {...formData.config!, commissionType: e.target.value as any}})}
                             >
                                 <option value="PERCENTAGE">Percentage (%)</option>
                                 <option value="FLAT">Flat Amount (₹)</option>
                                 <option value="TIERED">Tiered Slab</option>
                             </select>
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
                        {formData.config?.commissionType === 'PERCENTAGE' && (
                             <div>
                                 <label className="block text-sm font-bold text-indigo-900 mb-1">Commission %</label>
                                 <div className="relative">
                                     <input 
                                        type="number"
                                        min="0"
                                        className={`w-full rounded-md border-indigo-200 shadow-sm p-2 pl-3 pr-8 text-sm ${errors.commissionValue ? 'border-red-500' : ''}`}
                                        placeholder="e.g. 10"
                                        value={formData.config?.commissionValue || ''}
                                        onChange={(e) => setFormData({...formData, config: {...formData.config!, commissionValue: Math.max(0, parseFloat(e.target.value) || 0)}})}
                                     />
                                     <Percent size={14} className="absolute right-3 top-3 text-indigo-400"/>
                                 </div>
                                 {(formData.config?.commissionValue || 0) > 25 && (
                                     <p className="text-xs text-orange-600 mt-1 flex items-center gap-1"><AlertCircle size={10}/> High commission alert (&gt;25%)</p>
                                 )}
                             </div>
                        )}

                        {formData.config?.commissionType === 'FLAT' && (
                             <div>
                                 <label className="block text-sm font-bold text-indigo-900 mb-1">Flat Amount per Booking (₹)</label>
                                 <div className="relative">
                                     <DollarSign size={14} className="absolute left-3 top-3 text-indigo-400"/>
                                     <input 
                                        type="number"
                                        min="0"
                                        className={`w-full rounded-md border-indigo-200 shadow-sm p-2 pl-8 text-sm ${errors.commissionValue ? 'border-red-500' : ''}`}
                                        placeholder="e.g. 500"
                                        value={formData.config?.commissionValue || ''}
                                        onChange={(e) => setFormData({...formData, config: {...formData.config!, commissionValue: Math.max(0, parseFloat(e.target.value) || 0)}})}
                                     />
                                 </div>
                             </div>
                        )}

                        {formData.config?.commissionType === 'TIERED' && (
                            <div>
                                <label className="block text-sm font-bold text-indigo-900 mb-2">Commission Slabs</label>
                                <div className="space-y-2">
                                    {commissionSlabs.map((slab, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input type="number" min="0" placeholder="From" className="w-20 rounded border-gray-200 text-xs p-1" value={slab.from} onChange={e => handleUpdateSlab(idx, 'from', Math.max(0, parseInt(e.target.value) || 0))}/>
                                            <span className="text-gray-400 text-xs">-</span>
                                            <input type="number" min="0" placeholder="To" className="w-20 rounded border-gray-200 text-xs p-1" value={slab.to || ''} onChange={e => handleUpdateSlab(idx, 'to', e.target.value ? Math.max(0, parseInt(e.target.value) || 0) : null)}/>
                                            <span className="text-gray-400 text-xs">=</span>
                                            <input type="number" min="0" placeholder="%" className="w-16 rounded border-gray-200 text-xs p-1 font-bold text-indigo-600" value={slab.value} onChange={e => handleUpdateSlab(idx, 'value', Math.max(0, parseFloat(e.target.value) || 0))}/>
                                            <button onClick={() => handleRemoveSlab(idx)} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                                        </div>
                                    ))}
                                    <button onClick={handleAddSlab} className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 mt-2">
                                        <Plus size={12}/> Add Slab
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox"
                                checked={formData.config?.payoutRules?.releaseOnCompletion ?? true}
                                onChange={(e) => setFormData({...formData, config: {...formData.config!, payoutRules: {...formData.config?.payoutRules!, releaseOnCompletion: e.target.checked}}})}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <label className="text-xs text-gray-700">Release after completion</label>
                        </div>
                         <div className="flex items-center gap-2">
                            <input 
                                type="checkbox"
                                checked={formData.config?.payoutRules?.reverseOnCancel ?? true}
                                onChange={(e) => setFormData({...formData, config: {...formData.config!, payoutRules: {...formData.config?.payoutRules!, reverseOnCancel: e.target.checked}}})}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <label className="text-xs text-gray-700">Reverse on cancel</label>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Lock-in Period (Days)</label>
                            <input 
                                type="number" 
                                min="0"
                                className="mt-1 w-24 rounded-md border-gray-300 shadow-sm p-1 text-sm"
                                value={formData.config?.payoutRules?.lockInDays ?? 7}
                                onChange={(e) => setFormData({...formData, config: {...formData.config!, payoutRules: {...formData.config?.payoutRules!, lockInDays: Math.max(0, parseInt(e.target.value) || 0)}}})}
                            />
                        </div>
                    </div>
                </div>
             </div>
             
             {/* Payment Details Section */}
             <div className="border-t border-gray-200 pt-4 mt-4 bg-gray-50 p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                    <Landmark size={16} className="text-gray-600"/>
                    <label className="block text-sm font-bold text-gray-700">Payment Details (Bank / UPI)</label>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                     <div className="col-span-2">
                         <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Bank Name</label>
                         <input 
                            type="text" 
                            className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                            placeholder="HDFC Bank"
                            value={bankDetails.bankName}
                            onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                         />
                     </div>
                     <div>
                         <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Account Holder</label>
                         <input 
                            type="text" 
                            className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                            value={bankDetails.accountHolder}
                            onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                         />
                     </div>
                     <div>
                         <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">IFSC Code</label>
                                                  <input 
                            type="text" 
                            className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm uppercase"
                            value={bankDetails.ifsc}
                            onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value.toUpperCase()})}
                         />
                     </div>
                     <div>
                         <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Account Number</label>
                         <input 
                            type="password" 
                            className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                            value={bankDetails.accountNumber}
                            onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                         />
                     </div>
                     <div>
                         <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Confirm Acc No.</label>
                         <input 
                            type="text" 
                            className={`w-full rounded-md border shadow-sm p-2 text-sm ${errors.confirmAccountNumber ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                            value={bankDetails.confirmAccountNumber}
                            onChange={(e) => setBankDetails({...bankDetails, confirmAccountNumber: e.target.value})}
                         />
                         {errors.confirmAccountNumber && <p className="text-[10px] text-red-500 mt-1">Numbers must match exactly</p>}
                     </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center gap-2 mb-1">
                        <CreditCard size={14} className="text-gray-500"/>
                        <label className="text-xs font-bold text-gray-700 uppercase">UPI ID (Optional)</label>
                    </div>
                    <input 
                        type="text" 
                        placeholder="username@okicici"
                        className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                    />
                </div>
             </div>

             {/* Social Media Channels Input */}
             <div className="border-t border-gray-200 pt-4 mt-4 bg-gray-50 p-3 rounded-lg border">
                <label className="block text-sm font-bold text-gray-700 mb-2">Social Media Channels</label>
                <div className="flex flex-col md:flex-row gap-2 mb-3 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Platform</label>
                        <select 
                            value={activePlatform}
                            onChange={(e) => setActivePlatform(e.target.value as SocialPlatform)}
                            className="w-full rounded-md border-gray-300 shadow-sm p-2 text-sm border focus:ring-blue-500"
                        >
                            <option value="INSTAGRAM">Instagram</option>
                            <option value="YOUTUBE">YouTube</option>
                            <option value="FACEBOOK">Facebook</option>
                            <option value="TWITTER">Twitter</option>
                        </select>
                    </div>
                    <div className="flex-[1.5] w-full">
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Profile ID / Handle</label>
                        <input 
                            type="text"
                            placeholder="@handle"
                            value={tempHandle}
                            onChange={(e) => setTempHandle(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm p-2 text-sm border focus:ring-blue-500"
                        />
                    </div>
                    
                    <div className="flex w-auto gap-2">
                        {tempHandle && (
                            <a 
                                href={generateSocialUrl(activePlatform, tempHandle)} 
                                target="_blank" 
                                rel="noreferrer"
                                className="bg-white text-gray-600 p-2.5 rounded-md hover:bg-gray-50 border border-gray-200 transition-colors shadow-sm flex items-center justify-center"
                                title="Check Link"
                            >
                                <ExternalLink size={18}/>
                            </a>
                        )}
                        <button 
                            onClick={handleAddSocial}
                            type="button"
                            className="bg-gray-900 text-white p-2.5 rounded-md hover:bg-black transition-colors shadow-sm"
                            title="Add Account"
                        >
                            <Plus size={18}/>
                        </button>
                    </div>
                </div>
                {/* List of Added Socials */}
                <div className="space-y-2">
                    {socials.length > 0 ? socials.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-md border border-gray-200 text-sm shadow-sm animate-fade-in">
                            <div className="flex items-center gap-2">
                                <span className={`font-bold ${
                                    s.platform === 'INSTAGRAM' ? 'text-pink-600' : 
                                    s.platform === 'YOUTUBE' ? 'text-red-600' : 
                                    s.platform === 'FACEBOOK' ? 'text-blue-600' : 'text-sky-500'
                                }`}>{s.platform}</span>
                                <span className="text-gray-600 font-medium">{s.handle}</span>
                            </div>
                            <button onClick={() => setSocials(socials.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded">
                                <Trash2 size={14}/>
                            </button>
                        </div>
                    )) : (
                        <p className="text-xs text-gray-400 italic">No social accounts added yet.</p>
                    )}
                </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex overflow-hidden shadow-2xl animate-fade-in">
            
            {/* Left Side: Form */}
            <div className="w-2/3 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                {couponToEdit ? 'Edit Coupon' : isFromRequest ? 'Approve & Create Coupon' : `Create ${scope === 'NORMAL' ? 'Standard' : scope.charAt(0) + scope.slice(1).toLowerCase()} Coupon`}
                </h2>
            </div>

            <div className="space-y-6">
                {/* Core Fields */}
                <div className="grid grid-cols-2 gap-6">
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Coupon Code <span className="text-red-500">*</span></label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                        ref={el => { fieldRefs.current['code'] = el; }}
                        type="text"
                        className={`flex-1 rounded-l-md border p-2 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 sm:text-sm uppercase tracking-wider font-mono font-bold ${errors.code ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                        placeholder="SUMMER2025"
                        value={formData.code}
                        onChange={(e) => {
                             setFormData({...formData, code: e.target.value.toUpperCase()});
                             if(e.target.value) setErrors(prev => ({...prev, code: false}));
                        }}
                    />
                    <button 
                        onClick={handleGenerateCode}
                        type="button" 
                        className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                    >
                        <RefreshCw size={16} />
                    </button>
                    </div>
                    {errors.code && <p className="text-red-500 text-xs mt-1">Code is required</p>}
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Discount Mode</label>
                    <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={formData.mode}
                    onChange={(e) => setFormData({...formData, mode: e.target.value})}
                    >
                     {availableModes.map(mode => (
                         <option key={mode.id} value={mode.id}>{mode.label}</option>
                     ))}
                    </select>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                    <button 
                        onClick={handleAiDescription}
                        disabled={loadingAi}
                        className="ml-2 text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                    >
                        <Sparkles size={12} className="mr-1" />
                        {loadingAi ? 'Generating...' : 'AI Generate'}
                    </button>
                    </label>
                    <textarea
                    ref={el => { fieldRefs.current['description'] = el; }}
                    rows={2}
                    className={inputClass('description')}
                    placeholder="Enter a description for the user..."
                    value={formData.description}
                    onChange={(e) => {
                        setFormData({...formData, description: e.target.value});
                        if(e.target.value) setErrors(prev => ({...prev, description: false}));
                    }}
                    />
                     {errors.description && <p className="text-red-500 text-xs mt-1">Description is required</p>}
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Discount Value <span className="text-red-500">*</span></label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">
                        {formData.mode === 'PERCENTAGE' ? '%' : '₹'}
                        </span>
                    </div>
                    <input
                        ref={el => { fieldRefs.current['discountValue'] = el; }}
                        type="number"
                        min="0"
                        className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border rounded-md p-2 ${errors.discountValue ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                        placeholder="0.00"
                        value={formData.config?.discountValue ?? ''} // Show empty if undefined
                        onChange={(e) => {
                            setFormData({...formData, config: {...formData.config!, discountValue: Math.max(0, parseFloat(e.target.value) || 0)}});
                            if(e.target.value) setErrors(prev => ({...prev, discountValue: false}));
                        }}
                    />
                    </div>
                     {errors.discountValue && <p className="text-red-500 text-xs mt-1">Value is required</p>}
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                    {formData.mode === 'PERCENTAGE' ? 'Max Discount (₹)' : 'Min Order Value (₹)'}
                    </label>
                    <input
                        type="number"
                        min="0"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                        value={formData.mode === 'PERCENTAGE' ? (formData.config?.maxDiscount ?? '') : (formData.config?.minOrderValue ?? '')}
                        onChange={(e) => {
                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                        if (formData.mode === 'PERCENTAGE') {
                            setFormData({...formData, config: {...formData.config!, maxDiscount: val}});
                        } else {
                            setFormData({...formData, config: {...formData.config!, minOrderValue: val}});
                        }
                        }}
                    />
                </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Scope Specific Logic</h3>
                {renderSpecificFields()}
                {renderTermsEditor()}
                </div>


                <div className="border-t border-gray-200 pt-6 grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Valid From <span className="text-red-500">*</span></label>
                    <div className="mt-1 flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400"/>
                        <input 
                        ref={el => { fieldRefs.current['validFrom'] = el; }}
                        type="datetime-local"
                        className={inputClass('validFrom')}
                        value={formData.validFrom}
                        onChange={(e) => {
                            setFormData({...formData, validFrom: e.target.value});
                            if(e.target.value) setErrors(prev => ({...prev, validFrom: false}));
                        }}
                        />
                    </div>
                     {errors.validFrom && <p className="text-red-500 text-xs mt-1">Start date is required</p>}
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 flex justify-between">
                        <span>Valid Till <span className="text-red-500">*</span></span>
                        <label className="flex items-center gap-2 text-xs font-normal text-gray-500 cursor-pointer">
                            <input type="checkbox" checked={noExpiry} onChange={(e) => {
                                setNoExpiry(e.target.checked);
                                if(e.target.checked) setFormData({...formData, validTill: undefined});
                                setErrors(prev => ({...prev, validTill: false}));
                            }} className="rounded text-blue-600"/>
                            No Expiry (Infinity)
                        </label>
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                        <Calendar size={16} className={noExpiry ? 'text-gray-200' : 'text-gray-400'}/>
                        <input 
                        ref={el => { fieldRefs.current['validTill'] = el; }}
                        type="datetime-local"
                        disabled={noExpiry}
                        className={`block w-full rounded-md shadow-sm p-2 border sm:text-sm ${noExpiry ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300' : errors.validTill ? 'border-red-500 ring-1 ring-red-500 animate-shake' : 'border-gray-300'}`}
                        value={formData.validTill || ''}
                        onChange={(e) => {
                            setFormData({...formData, validTill: e.target.value});
                            if(e.target.value) setErrors(prev => ({...prev, validTill: false}));
                        }}
                        />
                    </div>
                    {errors.validTill && <p className="text-red-500 text-xs mt-1">End date is required</p>}
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Global Total Usage Limit <span className="text-red-500">*</span></label>
                    <input 
                    ref={el => { fieldRefs.current['totalUsageLimit'] = el; }}
                    type="number"
                    min="0"
                    className={inputClass('totalUsageLimit')}
                    value={formData.totalUsageLimit ?? ''}
                    onChange={(e) => {
                        setFormData({...formData, totalUsageLimit: Math.max(0, parseInt(e.target.value) || 0)});
                         if(e.target.value) setErrors(prev => ({...prev, totalUsageLimit: false}));
                    }}
                    />
                    {errors.totalUsageLimit && <p className="text-red-500 text-xs mt-1">Limit is required</p>}
                </div>
                 <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Per User Usage Limit</label>
                    <input 
                    type="number"
                    min="0"
                    disabled={true} 
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2 border text-gray-500 cursor-not-allowed"
                    value={formData.userLimit}
                    title="Strictly single use per user for Platform coupons"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Platform coupons are strictly 1 use per user.</p>
                </div>
                </div>

            </div>
            
            <div className="mt-8 flex justify-end gap-3">
                <button 
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                Cancel
                </button>
                <button 
                onClick={handleSaveClick}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-md"
                >
                {couponToEdit ? 'Update Coupon' : 'Create Coupon'}
                </button>
            </div>
            </div>

            {/* Right Side: Preview */}
            <div className="w-1/3 bg-gray-50 border-l border-gray-200 p-8 flex flex-col items-center justify-center relative">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                <X size={24} />
                </button>

                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Live Preview</h3>

                {/* The Coupon Card */}
                <div className="bg-white w-full max-w-xs rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                    <Eye className="text-white" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">
                    {formData.mode === 'PERCENTAGE' ? `${formData.config?.discountValue || 0}% OFF` : `₹${formData.config?.discountValue || 0} OFF`}
                    </h2>
                    <p className="text-blue-100 text-xs mt-1">
                    {formData.mode === 'PERCENTAGE' ? `Up to ₹${formData.config?.maxDiscount || 'Unlimited'}` : 'Flat Discount'}
                    </p>
                </div>
                <div className="p-6">
                    <div className="text-center mb-6">
                    <p className="text-gray-500 text-sm leading-relaxed min-h-[40px]">
                        {formData.description || 'Description will appear here...'}
                    </p>
                    </div>
                    
                    <div className="relative group">
                        <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                            <span className="text-xs text-gray-500 font-medium mb-1">COUPON CODE</span>
                            <span className="text-lg font-mono font-bold text-gray-800 tracking-wider">
                                {formData.code || 'CODE'}
                            </span>
                        </div>
                        {formData.code && (
                             <button 
                                onClick={handleCopyCode}
                                className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 bg-white shadow-sm border border-gray-200 rounded hover:bg-gray-50 text-gray-500 hover:text-blue-600 transition-colors"
                                title="Copy Code"
                            >
                                {copied ? <Check size={14} className="text-green-600"/> : <Copy size={14} />}
                            </button>
                        )}
                        {copied && (
                            <div className="absolute top-0 right-0 -mt-8 bg-black text-white text-xs px-2 py-1 rounded shadow-lg animate-bounce">
                                Copied!
                            </div>
                        )}
                    </div>

                    <div className="mt-6 space-y-2">
                    <div className="flex items-start text-xs text-gray-500">
                        <Check size={14} className="mr-2 text-green-500 mt-0.5" />
                        <span>Valid for {scope === 'SPECIAL' ? `${selectedVendors.length} selected vendors` : 'all eligible adventures'}</span>
                    </div>
                    {formData.totalUsageLimit && (
                        <div className="flex items-start text-xs text-gray-500">
                            <AlertCircle size={14} className="mr-2 text-orange-500 mt-0.5" />
                            <span>Limited to first {formData.totalUsageLimit} redemptions</span>
                        </div>
                    )}
                    {formData.validTill && (
                        <div className="flex items-start text-xs text-gray-500">
                            <Clock size={14} className="mr-2 text-blue-500 mt-0.5" />
                            <span>Expires: {new Date(formData.validTill).toLocaleDateString()}</span>
                        </div>
                    )}
                    </div>
                </div>
                </div>

                {/* Influencer Summary Block */}
                {scope === 'INFLUENCER' && (
                    <div className="mt-4 w-full max-w-xs bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                        <h4 className="text-xs font-bold text-indigo-700 uppercase mb-2 flex items-center gap-1">
                            <BarChart size={12}/> Commission Summary
                        </h4>
                        <div className="text-xs space-y-1 text-indigo-900">
                            <div className="flex justify-between">
                                <span className="text-indigo-500">Type:</span>
                                <span className="font-bold">{formData.config?.commissionType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-indigo-500">Rate:</span>
                                <span className="font-bold">
                                    {formData.config?.commissionType === 'TIERED' 
                                    ? `${commissionSlabs.length} Slabs Configured` 
                                    : (formData.config?.commissionType === 'FLAT' ? `₹${formData.config?.commissionValue || 0}` : `${formData.config?.commissionValue || 0}%`)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-indigo-500">Lock-in:</span>
                                <span className="font-bold">{formData.config?.payoutRules?.lockInDays} Days</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </div>
        <ConfirmationModal 
            isOpen={showConfirm}
            title={couponToEdit ? "Update Coupon?" : "Create New Coupon?"}
            message={`Are you sure you want to ${couponToEdit ? 'update' : 'create'} the coupon "${formData.code}"? It will be saved as a draft initially.`}
            type="SUCCESS"
            confirmText={couponToEdit ? "Update" : "Create"}
            onConfirm={performSave}
            onCancel={() => setShowConfirm(false)}
        />
    </>
  );
};

export default CouponModal;