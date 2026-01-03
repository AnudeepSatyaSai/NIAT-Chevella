
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROGRAMS, UserPlus } from '../../constants';
import { renderSafe } from '../Shared';

interface EnrollmentForm {
    fullName: string;
    studentId: string;
    email: string;
    phone: string;
    program: string;
}

interface FormErrors {
    fullName?: string;
    studentId?: string;
    email?: string;
    phone?: string;
    program?: string;
}

const Enrollment: React.FC = () => {
    const [formData, setFormData] = useState<EnrollmentForm>({
        fullName: '',
        studentId: '',
        email: '',
        phone: '',
        program: PROGRAMS[0].name
    });
    
    const [errors, setErrors] = useState<FormErrors>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    // Mock recent requests for the side panel
    const [recentRequests, setRecentRequests] = useState([
        { id: 'S24001', name: 'Rahul Varma', program: 'CSE (AI & ML)', status: 'Pending' },
        { id: 'S24002', name: 'Priya Reddy', program: 'CSE (Data Science)', status: 'Verified' },
        { id: 'S24003', name: 'Amit Kumar', program: 'ECE (IoT)', status: 'Pending' },
    ]);

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        // Name Validation
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full Name is required';
            isValid = false;
        } else if (formData.fullName.trim().length < 3) {
            newErrors.fullName = 'Name must be at least 3 characters';
            isValid = false;
        }

        // Student ID Validation (Numeric, 5-10 digits)
        if (!formData.studentId.trim()) {
            newErrors.studentId = 'Student ID is required';
            isValid = false;
        } else if (!/^\d{5,10}$/.test(formData.studentId)) {
            newErrors.studentId = 'Student ID must be 5-10 digits';
            isValid = false;
        }

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
            isValid = false;
        }

        // Phone Validation (10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
            isValid = false;
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Phone number must be exactly 10 digits';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);

        if (validate()) {
            // Simulate API call
            setTimeout(() => {
                setSuccessMessage(`Enrollment request for ${formData.fullName} (${formData.studentId}) submitted successfully.`);
                setRecentRequests(prev => [
                    { id: formData.studentId, name: formData.fullName, program: formData.program, status: 'Pending' },
                    ...prev
                ]);
                // Reset form
                setFormData({
                    fullName: '',
                    studentId: '',
                    email: '',
                    phone: '',
                    program: PROGRAMS[0].name
                });
                setErrors({});
            }, 500);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl p-8"
            >
                <div className="flex items-center gap-4 mb-8 border-b border-gray-700 pb-4">
                    <div className="bg-cyan-500/20 p-3 rounded-lg" aria-hidden="true">
                        <UserPlus className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">New Student Enrollment</h2>
                        <p className="text-slate-400 text-sm">Register incoming students to the NIAT portal.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">Full Name <span className="text-red-400" aria-hidden="true">*</span></label>
                            <input
                                id="fullName"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`w-full bg-gray-900 border ${errors.fullName ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors`}
                                placeholder="e.g. John Doe"
                                aria-invalid={!!errors.fullName}
                                aria-describedby={errors.fullName ? "fullName-error" : undefined}
                                required
                            />
                            {errors.fullName && <p id="fullName-error" className="text-red-400 text-xs mt-1" role="alert">{renderSafe(errors.fullName)}</p>}
                        </div>

                        <div>
                            <label htmlFor="studentId" className="block text-sm font-medium text-slate-300 mb-2">Student ID <span className="text-red-400" aria-hidden="true">*</span></label>
                            <input
                                id="studentId"
                                type="text"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleChange}
                                className={`w-full bg-gray-900 border ${errors.studentId ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors`}
                                placeholder="e.g. 240105"
                                aria-invalid={!!errors.studentId}
                                aria-describedby={errors.studentId ? "studentId-error" : undefined}
                                required
                            />
                             {errors.studentId && <p id="studentId-error" className="text-red-400 text-xs mt-1" role="alert">{renderSafe(errors.studentId)}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address <span className="text-red-400" aria-hidden="true">*</span></label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full bg-gray-900 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors`}
                                placeholder="e.g. john@niat.edu"
                                aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? "email-error" : undefined}
                                required
                            />
                            {errors.email && <p id="email-error" className="text-red-400 text-xs mt-1" role="alert">{renderSafe(errors.email)}</p>}
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">Phone Number <span className="text-red-400" aria-hidden="true">*</span></label>
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full bg-gray-900 border ${errors.phone ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors`}
                                placeholder="e.g. 9876543210"
                                aria-invalid={!!errors.phone}
                                aria-describedby={errors.phone ? "phone-error" : undefined}
                                required
                            />
                            {errors.phone && <p id="phone-error" className="text-red-400 text-xs mt-1" role="alert">{renderSafe(errors.phone)}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="program" className="block text-sm font-medium text-slate-300 mb-2">Program</label>
                        <select
                            id="program"
                            name="program"
                            value={formData.program}
                            onChange={handleChange}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        >
                            {PROGRAMS.map(prog => (
                                <option key={prog.name} value={prog.name}>{renderSafe(prog.name)}</option>
                            ))}
                        </select>
                    </div>

                    <AnimatePresence>
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg text-sm"
                                role="status"
                                aria-live="polite"
                            >
                                {renderSafe(successMessage)}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit" 
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-[1.02]"
                        >
                            Submit Enrollment
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Side Panel: Recent Requests */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
            >
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 h-full">
                    <h3 className="text-lg font-bold text-white mb-6">Recent Requests</h3>
                    <div className="space-y-4">
                        {recentRequests.map((req, idx) => (
                            <div key={idx} className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-white text-sm">{renderSafe(req.name)}</p>
                                    <p className="text-xs text-cyan-400 font-mono mb-1">{renderSafe(req.id)}</p>
                                    <p className="text-xs text-slate-400">{renderSafe(req.program)}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${req.status === 'Verified' ? 'bg-lime-500/20 text-lime-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                    {renderSafe(req.status)}
                                </span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/20">
                        <h4 className="text-cyan-400 font-bold text-sm mb-2">Batch Status</h4>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                            <span>CSE (AI & ML)</span>
                            <span>58/60</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
                            <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: '96%' }}></div>
                        </div>
                        
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                            <span>ECE (IoT)</span>
                            <span>42/60</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div className="bg-lime-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Enrollment;
