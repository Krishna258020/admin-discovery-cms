import {
    ChevronDown,
    Clock,
    Edit2,
    Image as ImageIcon,
    Plus,
    Save,
    Search,
    Smartphone,
    Trash2,
    Upload,
    X
} from 'lucide-react';
import React, { useState } from 'react';
import { MOCK_CONTENT } from '../../constants/discovery.constants';
import { DiscoveryContent, Status } from '../../types/discovery.types';

interface Props {
  category: 'WhatsNew' | 'TopTreks' | 'TrekShorts';
  title: string;
}

export const ContentManagerEnhanced: React.FC<Props> = ({ category, title }) => {
  const [contents, setContents] = useState<DiscoveryContent[]>(
    MOCK_CONTENT.filter(c => c.category === category)
  );
  const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<Partial<DiscoveryContent>>({
    category,
    status: Status.DRAFT,
    visibility: true,
    priorityOrder: 1,
    imageDimensions: {
      coverWidth: 400,
      coverHeight: 300,
      bannerWidth: 800,
      bannerHeight: 400,
      thumbnailWidth: 160,
      thumbnailHeight: 160
    },
    cardStyle: {
      backgroundColor: '#FFEB3B',
      textColor: '#000000',
      accentColor: '#2196F3',
      borderRadius: 16
    },
    featured: false,
    tags: []
  });

  const handleCreate = () => {
    setFormData({
      category,
      status: Status.DRAFT,
      visibility: true,
      priorityOrder: contents.length + 1,
      imageDimensions: {
        coverWidth: 400,
        coverHeight: 300,
        bannerWidth: 800,
        bannerHeight: 400,
        thumbnailWidth: 160,
        thumbnailHeight: 160
      },
      cardStyle: {
        backgroundColor: '#FFEB3B',
        textColor: '#000000',
        accentColor: '#2196F3',
        borderRadius: 16
      },
      featured: false,
      tags: []
    });
    setView('FORM');
  };

  const handleEdit = (content: DiscoveryContent) => {
    setFormData(content);
    setView('FORM');
  };

  const handleSave = () => {
    if (!formData.title || !formData.coverImage) {
      alert('Please fill in required fields');
      return;
    }

    if (formData.id) {
      setContents(prev => prev.map(c => c.id === formData.id ? formData as DiscoveryContent : c));
    } else {
      const newContent: DiscoveryContent = {
        ...formData,
        id: `dc_${Date.now()}`,
      } as DiscoveryContent;
      setContents(prev => [...prev, newContent]);
    }
    setView('LIST');
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      setContents(prev => prev.filter(c => c.id !== id));
    }
  };

  if (view === 'FORM') {
    return (
      <div className="bg-white animate-in slide-in-from-right-4 duration-200">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {formData.id ? 'Edit' : 'Create'} {title} Content
            </h2>
            <p className="text-xs text-slate-500 mt-1">Content will be displayed in mobile app</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowPreview(!showPreview)} 
              className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              <Smartphone size={16} />
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            <button 
              onClick={() => setView('LIST')} 
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Save size={16} />
              Save Content
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Form Section */}
          <div className={`${showPreview ? 'col-span-7' : 'col-span-12'} space-y-6`}>
            
            {/* Basic Information */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <ImageIcon size={16} />
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Title *</label>
                  <input 
                    value={formData.title || ''}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Variety of Treks"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Short Caption</label>
                  <input 
                    value={formData.shortCaption || ''}
                    onChange={e => setFormData({...formData, shortCaption: e.target.value})}
                    placeholder="Brief description for card"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Long Description</label>
                  <textarea 
                    value={formData.longDescription || ''}
                    onChange={e => setFormData({...formData, longDescription: e.target.value})}
                    placeholder="Full description shown when user clicks"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg h-32"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">CTA Text</label>
                    <input 
                      value={formData.ctaText || ''}
                      onChange={e => setFormData({...formData, ctaText: e.target.value})}
                      placeholder="Know more"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">CTA Link</label>
                    <input 
                      value={formData.ctaLink || ''}
                      onChange={e => setFormData({...formData, ctaLink: e.target.value})}
                      placeholder="/trek/variety"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Image Configuration */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Upload size={16} />
                Image Configuration (Mobile App)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Cover Image URL *</label>
                  <input 
                    value={formData.coverImage || ''}
                    onChange={e => setFormData({...formData, coverImage: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input 
                      type="number"
                      value={formData.imageDimensions?.coverWidth || 400}
                      onChange={e => setFormData({
                        ...formData, 
                        imageDimensions: {...formData.imageDimensions!, coverWidth: parseInt(e.target.value)}
                      })}
                      placeholder="Width (px)"
                      className="px-3 py-1.5 border border-slate-200 rounded text-sm"
                    />
                    <input 
                      type="number"
                      value={formData.imageDimensions?.coverHeight || 300}
                      onChange={e => setFormData({
                        ...formData, 
                        imageDimensions: {...formData.imageDimensions!, coverHeight: parseInt(e.target.value)}
                      })}
                      placeholder="Height (px)"
                      className="px-3 py-1.5 border border-slate-200 rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Banner Image URL</label>
                  <input 
                    value={formData.bannerImage || ''}
                    onChange={e => setFormData({...formData, bannerImage: e.target.value})}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input 
                      type="number"
                      value={formData.imageDimensions?.bannerWidth || 800}
                      onChange={e => setFormData({
                        ...formData, 
                        imageDimensions: {...formData.imageDimensions!, bannerWidth: parseInt(e.target.value)}
                      })}
                      placeholder="Width (px)"
                      className="px-3 py-1.5 border border-slate-200 rounded text-sm"
                    />
                    <input 
                      type="number"
                      value={formData.imageDimensions?.bannerHeight || 400}
                      onChange={e => setFormData({
                        ...formData, 
                        imageDimensions: {...formData.imageDimensions!, bannerHeight: parseInt(e.target.value)}
                      })}
                      placeholder="Height (px)"
                      className="px-3 py-1.5 border border-slate-200 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card Styling */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Card Styling (Mobile App)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Background Color</label>
                  <div className="flex gap-2">
                    <input 
                      type="color"
                      value={formData.cardStyle?.backgroundColor || '#FFEB3B'}
                      onChange={e => setFormData({
                        ...formData, 
                        cardStyle: {...formData.cardStyle!, backgroundColor: e.target.value}
                      })}
                      className="w-12 h-10 border border-slate-200 rounded cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={formData.cardStyle?.backgroundColor || '#FFEB3B'}
                      onChange={e => setFormData({
                        ...formData, 
                        cardStyle: {...formData.cardStyle!, backgroundColor: e.target.value}
                      })}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Text Color</label>
                  <div className="flex gap-2">
                    <input 
                      type="color"
                      value={formData.cardStyle?.textColor || '#000000'}
                      onChange={e => setFormData({
                        ...formData, 
                        cardStyle: {...formData.cardStyle!, textColor: e.target.value}
                      })}
                      className="w-12 h-10 border border-slate-200 rounded cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={formData.cardStyle?.textColor || '#000000'}
                      onChange={e => setFormData({
                        ...formData, 
                        cardStyle: {...formData.cardStyle!, textColor: e.target.value}
                      })}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Accent Color</label>
                  <div className="flex gap-2">
                    <input 
                      type="color"
                      value={formData.cardStyle?.accentColor || '#2196F3'}
                      onChange={e => setFormData({
                        ...formData, 
                        cardStyle: {...formData.cardStyle!, accentColor: e.target.value}
                      })}
                      className="w-12 h-10 border border-slate-200 rounded cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={formData.cardStyle?.accentColor || '#2196F3'}
                      onChange={e => setFormData({
                        ...formData, 
                        cardStyle: {...formData.cardStyle!, accentColor: e.target.value}
                      })}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Border Radius (px)</label>
                  <input 
                    type="number"
                    value={formData.cardStyle?.borderRadius || 16}
                    onChange={e => setFormData({
                      ...formData, 
                      cardStyle: {...formData.cardStyle!, borderRadius: parseInt(e.target.value)}
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Publishing Settings */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Publishing Settings</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as Status})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value={Status.DRAFT}>Draft</option>
                    <option value={Status.PUBLISHED}>Published</option>
                    <option value={Status.SCHEDULED}>Scheduled</option>
                    <option value={Status.ARCHIVED}>Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Priority Order</label>
                  <input 
                    type="number"
                    value={formData.priorityOrder || 1}
                    onChange={e => setFormData({...formData, priorityOrder: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Publish Start</label>
                  <input 
                    type="date"
                    value={formData.publishStart || ''}
                    onChange={e => setFormData({...formData, publishStart: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Publish End</label>
                  <input 
                    type="date"
                    value={formData.publishEnd || ''}
                    onChange={e => setFormData({...formData, publishEnd: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.visibility}
                    onChange={e => setFormData({...formData, visibility: e.target.checked})}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span className="text-sm text-slate-700">Visible in App</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.featured}
                    onChange={e => setFormData({...formData, featured: e.target.checked})}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span className="text-sm text-slate-700">Featured Content</span>
                </label>
              </div>
            </div>
          </div>

          {/* Mobile Preview Section */}
          {showPreview && (
            <div className="col-span-5">
              <div className="sticky top-6">
                <div className="bg-slate-900 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white text-sm font-bold flex items-center gap-2">
                      <Smartphone size={16} />
                      Mobile Preview
                    </h3>
                    <button 
                      onClick={() => setShowPreview(false)}
                      className="text-white/60 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  {/* Mobile Frame */}
                  <div className="bg-white rounded-3xl p-4 shadow-2xl" style={{width: '375px', height: '667px', overflow: 'auto'}}>
                    {/* Mobile Card Preview */}
                    <div 
                      className="rounded-2xl overflow-hidden shadow-lg mb-4"
                      style={{
                        backgroundColor: formData.cardStyle?.backgroundColor,
                        borderRadius: `${formData.cardStyle?.borderRadius}px`
                      }}
                    >
                      <div className="flex items-center p-4">
                        {formData.coverImage && (
                          <img 
                            src={formData.coverImage} 
                            alt="Preview"
                            className="rounded-full object-cover mr-4"
                            style={{
                              width: '80px',
                              height: '80px'
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <h3 
                            className="font-bold text-lg mb-1"
                            style={{color: formData.cardStyle?.textColor}}
                          >
                            {formData.title || 'Title'}
                          </h3>
                          <p 
                            className="text-sm mb-2"
                            style={{color: formData.cardStyle?.textColor, opacity: 0.8}}
                          >
                            {formData.shortCaption || 'Short caption'}
                          </p>
                          <button 
                            className="text-sm font-bold"
                            style={{color: formData.cardStyle?.accentColor}}
                          >
                            {formData.ctaText || 'Know more'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Detail View Preview */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                      <h4 className="text-xs font-bold text-slate-500 mb-2">Detail View</h4>
                      {formData.bannerImage && (
                        <img 
                          src={formData.bannerImage} 
                          alt="Banner"
                          className="w-full rounded-lg mb-3"
                          style={{
                            height: '200px',
                            objectFit: 'cover'
                          }}
                        />
                      )}
                      <h3 className="font-bold text-lg mb-2" style={{color: formData.cardStyle?.accentColor}}>
                        {formData.title || 'Title'}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {formData.longDescription || 'Long description will appear here when user clicks on the card...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            placeholder="Search content..."
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
            Latest First <ChevronDown size={14} />
          </button>
          <button 
            onClick={handleCreate} 
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-sm font-medium text-sm transition-colors"
          >
            <Plus size={16} /> Create Content
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {contents.map(item => (
          <div key={item.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-orange-200 hover:shadow-md transition-all">
            <div className="h-48 bg-slate-100 relative">
              <img src={item.coverImage} className="w-full h-full object-cover" alt="" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-white/90 backdrop-blur-sm shadow-sm
                  ${item.status === Status.PUBLISHED || item.status === Status.ACTIVE ? 'text-green-700' : 'text-slate-500'}
                `}>
                  {item.status}
                </span>
                {item.featured && (
                  <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-orange-500 text-white shadow-sm">
                    Featured
                  </span>
                )}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-900 mb-1 truncate">{item.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{item.shortCaption}</p>
              
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock size={12} /> Order: {item.priorityOrder}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-orange-600 transition-colors"
                  >
                    <Edit2 size={16}/>
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
