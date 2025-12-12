import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLinkedin, FaTimes, FaBars, FaFileDownload } from 'react-icons/fa';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'HOME', href: '#home' },
        { name: 'ABOUT', href: '#about' },
        { name: 'EXPERIENCE', href: '#experience' },
        { name: 'PROJECTS', href: '#projects' },
        { name: 'RESEARCH', href: '#research' },
        { name: 'READS', href: '#reads' },
        { name: 'CONTACT', href: '#contact' }
    ];

    const handleNavClick = (e, href) => {
        e.preventDefault();
        setIsOpen(false);
        setTimeout(() => {
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 300);
    };

    return (
        <>
            {/* Menu Button - Only visible when scrolled */}
            <AnimatePresence>
                {visible && (
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setIsOpen(true)}
                        style={{
                            position: 'fixed',
                            top: '2rem',
                            left: '2rem',
                            zIndex: 999,
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '8px',
                            padding: '1rem 1.5rem',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            fontFamily: 'var(--font-display)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.3s',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                            e.currentTarget.style.borderColor = 'white';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        }}
                    >
                        Menu <FaBars />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Full Screen Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100vh',
                            background: 'rgba(0, 0, 0, 0.98)',
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            padding: '4rem',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Close Button */}
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '2rem',
                                right: '2rem',
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontFamily: 'var(--font-display)',
                                fontWeight: '600',
                                transition: 'color 0.3s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            onMouseOut={(e) => e.currentTarget.style.color = 'white'}
                        >
                            Close <FaTimes />
                        </motion.button>

                        {/* Navigation Items */}
                        <nav style={{ maxWidth: '600px', overflowY: 'auto', maxHeight: '70vh' }}>
                            {navItems.slice(0, 2).map((item, index) => (
                                <motion.a
                                    key={item.name}
                                    href={item.href}
                                    onClick={(e) => handleNavClick(e, item.href)}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + index * 0.1 }}
                                    whileTap={{
                                        scale: 0.95,
                                        x: 20,
                                        transition: { duration: 0.1 }
                                    }}
                                    style={{
                                        display: 'block',
                                        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                                        fontWeight: '900',
                                        color: 'white',
                                        marginBottom: '1.5rem',
                                        textDecoration: 'none',
                                        fontFamily: 'var(--font-display)',
                                        transition: 'all 0.3s',
                                        padding: '0.5rem 0',
                                        position: 'relative'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.paddingLeft = '2rem';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.paddingLeft = '0';
                                    }}
                                >
                                    {item.name}
                                </motion.a>
                            ))}

                            {/* Resume Link - Distinctive Style */}
                            <motion.a
                                href="/Megh_resume.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                whileTap={{
                                    scale: 0.95,
                                    x: 20,
                                    transition: { duration: 0.1 }
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                                    fontWeight: '900',
                                    color: 'white',
                                    marginBottom: '1.5rem',
                                    textDecoration: 'none',
                                    fontFamily: 'var(--font-display)',
                                    transition: 'all 0.3s',
                                    padding: '1rem 2rem',
                                    position: 'relative',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '2px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    marginLeft: '-2rem',
                                    width: 'calc(100% + 2rem)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.borderColor = 'white';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                }}
                            >
                                RESUME <FaFileDownload style={{ fontSize: '1.5rem' }} />
                            </motion.a>

                            {navItems.slice(2).map((item, index) => (
                                <motion.a
                                    key={item.name}
                                    href={item.href}
                                    onClick={(e) => handleNavClick(e, item.href)}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    whileTap={{
                                        scale: 0.95,
                                        x: 20,
                                        transition: { duration: 0.1 }
                                    }}
                                    style={{
                                        display: 'block',
                                        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                                        fontWeight: '900',
                                        color: 'white',
                                        marginBottom: '1.5rem',
                                        textDecoration: 'none',
                                        fontFamily: 'var(--font-display)',
                                        transition: 'all 0.3s',
                                        padding: '0.5rem 0',
                                        position: 'relative'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.paddingLeft = '2rem';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.paddingLeft = '0';
                                    }}
                                >
                                    {item.name}
                                </motion.a>
                            ))}
                        </nav>

                        {/* Social Links */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            style={{
                                position: 'absolute',
                                bottom: '3rem',
                                left: '4rem',
                                display: 'flex',
                                gap: '2rem'
                            }}
                        >
                            <motion.a
                                href="https://github.com/megh06"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.2, rotate: 5 }}
                                whileTap={{ scale: 0.9, rotate: -5 }}
                                style={{
                                    color: 'white',
                                    fontSize: '1.5rem',
                                    transition: 'color 0.3s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'white'}
                            >
                                <FaGithub />
                            </motion.a>
                            <motion.a
                                href="https://www.linkedin.com/in/megh-dave-4a2227314/"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.2, rotate: -5 }}
                                whileTap={{ scale: 0.9, rotate: 5 }}
                                style={{
                                    color: 'white',
                                    fontSize: '1.5rem',
                                    transition: 'color 0.3s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'white'}
                            >
                                <FaLinkedin />
                            </motion.a>
                        </motion.div>

                        {/* Decorative Element */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 0.1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            style={{
                                position: 'absolute',
                                bottom: '3rem',
                                right: '3rem',
                                width: '200px',
                                height: '200px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                                filter: 'blur(40px)',
                                pointerEvents: 'none'
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
