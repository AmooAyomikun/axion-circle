import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddPartnerStoreModal({ isOpen, onClose, onSuccess, editStore = null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    phone: '',
    email: '',
    contactPerson: '',
    location: '',
    address: '',
    description: '',
    monthlyLimit: 5000,
    qrStatus: 'PENDING',
    active: true
  });

  // Reset form or populate on open
  useEffect(() => {
    if (isOpen) {
      if (editStore) {
        setFormData({
          name: editStore.name || '',
          category: editStore.category || '',
          phone: editStore.phone || '',
          email: editStore.email || '',
          contactPerson: editStore.contactPerson || '',
          location: editStore.location || '',
          address: editStore.address || '',
          description: editStore.description || '',
          monthlyLimit: editStore.monthlyLimit || 5000,
          qrStatus: editStore.qrStatus || 'PENDING',
          active: editStore.active !== false
        });
      } else {
        setFormData({
          name: '',
          category: '',
          phone: '',
          email: '',
          contactPerson: '',
          location: '',
          address: '',
          description: '',
          monthlyLimit: 5000,
          qrStatus: 'PENDING',
          active: true
        });
      }
    }
  }, [isOpen, editStore]);

  // Focus trap and escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // MOCK API CALL - since backend endpoints are missing
      // In production: await api.post('/admin/partner-stores', formData) or PUT /admin/partner-stores/{id}
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success(editStore && editStore.id ? 'Store updated successfully' : 'Store created successfully');
      
      if (onSuccess) {
        onSuccess({
          ...formData,
          id: (editStore && editStore.id) ? editStore.id : Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString()
        });
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save partner store');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-[100] animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-modal-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-32px)] sm:w-full max-w-[600px] bg-white rounded-2xl shadow-xl z-[101] flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-white-stroke">
          <div className="flex items-center justify-between mb-1">
            <h2 id="store-modal-title" className="text-xl font-bold text-black font-heading">
              {editStore && editStore.id ? 'Edit Partner Store' : 'Add Partner Store'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-black-icon hover:text-black transition-colors rounded-lg p-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-paragraph font-medium">Register a business where residents can redeem their CleanCredits.</p>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          <form id="partner-store-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Store Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#1F2937] font-heading">Store Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-black mb-1.5">Store Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="name here"
                    className="w-full px-4 py-2.5 bg-white border border-white-stroke rounded-xl text-black text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-black mb-1.5">Category</label>
                  <div className="relative">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-white-stroke rounded-xl text-paragraph text-sm focus:outline-none focus:border-primary transition-colors appearance-none pr-10"
                    >
                      <option value="">All Categories</option>
                      <option value="GROCERY">Grocery</option>
                      <option value="RETAIL">Retail</option>
                      <option value="SERVICE">Service</option>
                      <option value="TRANSPORT">Transport</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-black-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-black mb-1.5">Contact Phone No</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="no here"
                    className="w-full px-4 py-2.5 bg-white border border-white-stroke rounded-xl text-black text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-black mb-1.5">Contact Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    className="w-full px-4 py-2.5 bg-white border border-white-stroke rounded-xl text-black text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactPerson" className="block text-sm font-semibold text-black mb-1.5">Contact person</label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2.5 bg-white border border-white-stroke rounded-xl text-black text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-black mb-1.5">Location / area</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Lagos Island"
                    className="w-full px-4 py-2.5 bg-white border border-white-stroke rounded-xl text-black text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-black mb-1.5">Street Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-white-stroke rounded-xl text-black text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-black mb-1.5">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-white-stroke rounded-xl text-black text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>

            <hr className="border-white-stroke" />

            {/* Redemption Configuration Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#1F2937] font-heading flex justify-between items-center">
                Redemption Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="monthlyLimit" className="block text-sm font-semibold text-black mb-1.5">Monthly redemption limit (credits)</label>
                  <input
                    type="number"
                    id="monthlyLimit"
                    name="monthlyLimit"
                    min="0"
                    value={formData.monthlyLimit}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-white-stroke rounded-xl text-black text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="qrStatus" className="block text-sm font-semibold text-black mb-1.5">QR Status</label>
                  <div className="relative">
                    <select
                      id="qrStatus"
                      name="qrStatus"
                      value={formData.qrStatus}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-white-stroke rounded-xl text-paragraph text-sm focus:outline-none focus:border-primary transition-colors appearance-none pr-10"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-black-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-4 bg-white border border-white-stroke rounded-xl">
                <div>
                  <span className="block text-sm font-semibold text-black">Store is Active</span>
                  <span className="block text-xs text-paragraph mt-0.5">Inactive stores cannot accept CleanCredits redemptions.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                  <input
                    type="checkbox"
                    name="active"
                    className="sr-only peer"
                    checked={formData.active}
                    onChange={handleChange}
                  />
                  <div className="w-11 h-6 bg-white-stroke peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white-stroke flex items-center justify-end gap-3 bg-white rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-white-stroke text-sm font-semibold text-black hover:bg-white-bg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="partner-store-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Store'
            )}
          </button>
        </div>
      </div>
    </>
  );
}
