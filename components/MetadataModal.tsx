
import React, { useState } from 'react';
import { DiagramMetadata } from '../types';

interface MetadataModalProps {
    isOpen: boolean;
    onClose: () => void;
    metadata: DiagramMetadata;
    onSave: (metadata: DiagramMetadata) => void;
}

const MetadataModal: React.FC<MetadataModalProps> = ({ isOpen, onClose, metadata, onSave }) => {
    const [formData, setFormData] = useState<DiagramMetadata>({ ...metadata });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName || !formData.group || !formData.topic) {
            alert('Please fill in all fields');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Diagram Details</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">First Name</label>
                            <input
                                autoFocus
                                type="text"
                                required
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#137fec] focus:ring-4 focus:ring-[#137fec]/10 transition-all font-medium"
                                value={formData.firstName}
                                onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                placeholder="John"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Last Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#137fec] focus:ring-4 focus:ring-[#137fec]/10 transition-all font-medium"
                                value={formData.lastName}
                                onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Group</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#137fec] focus:ring-4 focus:ring-[#137fec]/10 transition-all font-medium"
                            value={formData.group}
                            onChange={e => setFormData(prev => ({ ...prev, group: e.target.value }))}
                            placeholder="e.g. 6A, 7B, 8C, 9D"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Topic</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#137fec] focus:ring-4 focus:ring-[#137fec]/10 transition-all font-medium"
                            value={formData.topic}
                            onChange={e => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                            placeholder="e.g. System Architecture"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 text-sm font-bold text-white bg-[#137fec] hover:bg-[#137fec]/90 rounded-xl transition-colors shadow-lg shadow-[#137fec]/20"
                        >
                            Save Details
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MetadataModal;
