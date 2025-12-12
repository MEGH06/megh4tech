import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaLinkedin, FaGithub, FaMapMarkerAlt, FaPhone, FaPaperPlane, FaCheck, FaTimes } from 'react-icons/fa';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        service: '',
        message: ''
    });

    const [focusedField, setFocusedField] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const services = [
        'Website Revamp',
        'Smart Application Integration',
        'Chatbot Integration',
        'AI/ML Solutions',
        'Data Analysis',
        'Other'
    ];

    const maxMessageLength = 500;

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const subject = `Portfolio Inquiry: ${formData.service}`;
        const body = `Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0AService: ${formData.service}%0D%0A%0D%0AMessage:%0D%0A${formData.message}`;

        // Show success animation
        setShowSuccess(true);
        setTimeout(() => {
            window.location.href = `mailto:meghdave2006@gmail.com?subject=${subject}&body=${body}`;
            setTimeout(() => setShowSuccess(false), 2000);
        }, 1500);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Real-time validation
        if (name === 'email' && value) {
            setFieldErrors(prev => ({
                ...prev,
                email: !validateEmail(value)
            }));
        } else if (name === 'email') {
            setFieldErrors(prev => ({ ...prev, email: false }));
        }

        if (name === 'name' && value) {
            setFieldErrors(prev => ({
                ...prev,
                name: value.length < 2
            }));
        }
    };

    const getValidationIcon = (fieldName) => {
        const value = formData[fieldName];
        if (!value) return null;

        if (fieldName === 'email') {
            return validateEmail(value) ? (
                <FaCheck style={{ color: '#10b981', fontSize: '1rem' }} />
            ) : (
                <FaTimes style={{ color: '#ef4444', fontSize: '1rem' }} />
            );
        }

        if (fieldName === 'name') {
            return value.length >= 2 ? (
                <FaCheck style={{ color: '#10b981', fontSize: '1rem' }} />
            ) : (
                <FaTimes style={{ color: '#ef4444', fontSize: '1rem' }} />
            );
        }

        if (value) {
            return <FaCheck style={{ color: '#10b981', fontSize: '1rem' }} />;
        }

        return null;
    };

    return (
        <section id="contact" className="section" style={{ background: 'transparent' }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    style={{ maxWidth: '1200px', margin: '0 auto' }}
                >
                    <h2 className="section-title" style={{ textAlign: 'center' }}>Get In Touch</h2>

                    {/* Success Animation Overlay */}
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                style={{
                                    position: 'fixed',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 9999,
                                    background: 'rgba(0, 0, 0, 0.95)',
                                    padding: '3rem',
                                    borderRadius: '20px',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    textAlign: 'center'
                                }}
                            >
                                <motion.div
                                    animate={{
                                        scale: [0, 1.2, 1],
                                        rotate: [0, 360]
                                    }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <FaCheck style={{ fontSize: '4rem', color: '#10b981', marginBottom: '1rem' }} />
                                </motion.div>
                                <h3 style={{ color: 'white', fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>
                                    Message Sent!
                                </h3>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* CENTERED SEND MESSAGE FORM */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        style={{
                            maxWidth: '600px',
                            margin: '0 auto 4rem',
                            padding: '3rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '2px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '16px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                        }}
                    >
                        <h3 style={{
                            fontSize: '2rem',
                            marginBottom: '2rem',
                            textAlign: 'center',
                            color: 'white',
                            fontFamily: 'var(--font-display)',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Send Message
                        </h3>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                            {/* Name Field with Floating Label */}
                            <div style={{ position: 'relative' }}>
                                <motion.label
                                    animate={{
                                        top: focusedField === 'name' || formData.name ? '-0.75rem' : '0.875rem',
                                        fontSize: focusedField === 'name' || formData.name ? '0.75rem' : '0.9375rem',
                                        color: focusedField === 'name' ? 'white' : 'var(--text-secondary)'
                                    }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                        position: 'absolute',
                                        left: '1.25rem',
                                        background: focusedField === 'name' || formData.name ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
                                        padding: '0 0.5rem',
                                        fontWeight: '700',
                                        fontFamily: 'var(--font-display)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        pointerEvents: 'none',
                                        zIndex: 1
                                    }}
                                >
                                    Your Name
                                </motion.label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('name')}
                                    onBlur={() => setFocusedField('')}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 3rem 0.875rem 1.25rem',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        border: `2px solid ${fieldErrors.name ? '#ef4444' : focusedField === 'name' ? 'white' : 'rgba(255, 255, 255, 0.2)'}`,
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '0.9375rem',
                                        transition: 'all 0.3s',
                                        fontFamily: 'var(--font-main)'
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }}>
                                    <AnimatePresence>
                                        {getValidationIcon('name') && (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 180 }}
                                            >
                                                {getValidationIcon('name')}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Email Field with Floating Label */}
                            <div style={{ position: 'relative' }}>
                                <motion.label
                                    animate={{
                                        top: focusedField === 'email' || formData.email ? '-0.75rem' : '0.875rem',
                                        fontSize: focusedField === 'email' || formData.email ? '0.75rem' : '0.9375rem',
                                        color: focusedField === 'email' ? 'white' : 'var(--text-secondary)'
                                    }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                        position: 'absolute',
                                        left: '1.25rem',
                                        background: focusedField === 'email' || formData.email ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
                                        padding: '0 0.5rem',
                                        fontWeight: '700',
                                        fontFamily: 'var(--font-display)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        pointerEvents: 'none',
                                        zIndex: 1
                                    }}
                                >
                                    Email Address
                                </motion.label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField('')}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 3rem 0.875rem 1.25rem',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        border: `2px solid ${fieldErrors.email ? '#ef4444' : focusedField === 'email' ? 'white' : 'rgba(255, 255, 255, 0.2)'}`,
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '0.9375rem',
                                        transition: 'all 0.3s',
                                        fontFamily: 'var(--font-main)'
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }}>
                                    <AnimatePresence>
                                        {getValidationIcon('email') && (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 180 }}
                                            >
                                                {getValidationIcon('email')}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Service Field with Floating Label */}
                            <div style={{ position: 'relative' }}>
                                <motion.label
                                    animate={{
                                        top: focusedField === 'service' || formData.service ? '-0.75rem' : '0.875rem',
                                        fontSize: focusedField === 'service' || formData.service ? '0.75rem' : '0.9375rem',
                                        color: focusedField === 'service' ? 'white' : 'var(--text-secondary)'
                                    }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                        position: 'absolute',
                                        left: '1.25rem',
                                        background: focusedField === 'service' || formData.service ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
                                        padding: '0 0.5rem',
                                        fontWeight: '700',
                                        fontFamily: 'var(--font-display)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        pointerEvents: 'none',
                                        zIndex: 1
                                    }}
                                >
                                    Service Needed
                                </motion.label>
                                <select
                                    name="service"
                                    value={formData.service}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('service')}
                                    onBlur={() => setFocusedField('')}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1.25rem',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        border: `2px solid ${focusedField === 'service' ? 'white' : 'rgba(255, 255, 255, 0.2)'}`,
                                        borderRadius: '8px',
                                        color: formData.service ? 'white' : 'var(--text-secondary)',
                                        fontSize: '0.9375rem',
                                        transition: 'all 0.3s',
                                        fontFamily: 'var(--font-main)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="" style={{ background: '#000' }}>Select a service</option>
                                    {services.map((service, i) => (
                                        <option key={i} value={service} style={{ background: '#000' }}>{service}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Message Field with Floating Label and Character Counter */}
                            <div style={{ position: 'relative' }}>
                                <motion.label
                                    animate={{
                                        top: focusedField === 'message' || formData.message ? '-0.75rem' : '0.875rem',
                                        fontSize: focusedField === 'message' || formData.message ? '0.75rem' : '0.9375rem',
                                        color: focusedField === 'message' ? 'white' : 'var(--text-secondary)'
                                    }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                        position: 'absolute',
                                        left: '1.25rem',
                                        background: focusedField === 'message' || formData.message ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
                                        padding: '0 0.5rem',
                                        fontWeight: '700',
                                        fontFamily: 'var(--font-display)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        pointerEvents: 'none',
                                        zIndex: 1
                                    }}
                                >
                                    Message
                                </motion.label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('message')}
                                    onBlur={() => setFocusedField('')}
                                    required
                                    rows="5"
                                    maxLength={maxMessageLength}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1.25rem 2.5rem 1.25rem',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        border: `2px solid ${focusedField === 'message' ? 'white' : 'rgba(255, 255, 255, 0.2)'}`,
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '0.9375rem',
                                        transition: 'all 0.3s',
                                        fontFamily: 'var(--font-main)',
                                        resize: 'vertical'
                                    }}
                                />
                                {/* Character Counter */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '0.75rem',
                                    right: '1rem',
                                    fontSize: '0.75rem',
                                    color: formData.message.length > maxMessageLength * 0.9 ? '#ef4444' : 'var(--text-muted)',
                                    fontWeight: '600'
                                }}>
                                    {formData.message.length}/{maxMessageLength}
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', marginTop: '1rem' }}
                            >
                                <FaPaperPlane /> Send Message
                            </motion.button>
                        </form>
                    </motion.div>

                    {/* Contact Info & Services - Below the form */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2rem',
                        marginBottom: '3rem'
                    }}>
                        {/* Contact Info Cards */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="glass-card"
                            style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                        >
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                color: 'white'
                            }}>
                                <FaEnvelope />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>Email</h4>
                                <a href="mailto:meghdave2006@gmail.com" style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                    meghdave2006@gmail.com
                                </a>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="glass-card"
                            style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                        >
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                color: 'white'
                            }}>
                                <FaPhone />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>Phone</h4>
                                <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>+91 9222056520</p>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="glass-card"
                            style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                        >
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                color: 'white'
                            }}>
                                <FaMapMarkerAlt />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>Location</h4>
                                <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>Mumbai, India</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Services Offered */}
                    <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                        <h4 style={{
                            fontSize: '1.5rem',
                            marginBottom: '1.5rem',
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-display)',
                            fontWeight: '700',
                            textTransform: 'uppercase'
                        }}>
                            Services Offered
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                            {services.slice(0, -1).map((service, i) => (
                                <motion.span
                                    key={i}
                                    whileHover={{ scale: 1.05, y: -3 }}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '2px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '25px',
                                        fontSize: '0.875rem',
                                        color: 'white',
                                        fontWeight: '700',
                                        fontFamily: 'var(--font-display)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {service}
                                </motion.span>
                            ))}
                        </div>
                    </div>

                    {/* Social Links */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1.5rem',
                        paddingTop: '3rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <motion.a
                            href="https://www.linkedin.com/in/megh-dave-4a2227314/"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05, y: -3 }}
                            className="btn btn-primary"
                        >
                            <FaLinkedin /> LinkedIn
                        </motion.a>
                        <motion.a
                            href="https://github.com/megh06"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05, y: -3 }}
                            className="btn btn-outline"
                        >
                            <FaGithub /> GitHub
                        </motion.a>
                    </div>

                    {/* Footer */}
                    <div style={{
                        paddingTop: '3rem',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem'
                    }}>
                        <p>© {new Date().getFullYear()} Megh Dave. Built with React & Framer Motion.</p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Contact;
