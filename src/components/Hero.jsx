import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaChevronDown } from 'react-icons/fa';

const Hero = () => {
    // Typing animation state
    const fullText = "Innovating practical, scalable solutions that make technology work effortlessly in the real world.";
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showCursor, setShowCursor] = useState(true);
    const [showResume, setShowResume] = useState(false);

    // Typing effect
    useEffect(() => {
        if (currentIndex < fullText.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + fullText[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, 30); // typing speed
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, fullText]);

    // Cursor blink effect
    useEffect(() => {
        const interval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Show resume button on scroll
    useEffect(() => {
        const handleScroll = () => {
            setShowResume(window.scrollY < 100);
        };
        handleScroll(); // Set initial state
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const techStack = [
        { name: 'AI', level: 90 },
        { name: 'Machine Learning', level: 85 },
        { name: 'Deep Learning', level: 80 },
        { name: 'Data Science', level: 75 },
        { name: 'Full Stack Dev', level: 70 }
    ];

    return (
        <section
            id="home"
            className="section"
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Animated Grid Background */}
            <div
                className="dot-pattern"
                style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.2
                }}
            />

            {/* Floating Resume Button */}
            <AnimatePresence>
                {showResume && (
                    <motion.a
                        href="/Megh_resume.pdf"
                        download
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            position: 'fixed',
                            top: '2rem',
                            right: '2rem',
                            zIndex: 100,
                            padding: '0.875rem 1.5rem',
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '30px',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: '700',
                            fontFamily: 'var(--font-display)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            textDecoration: 'none'
                        }}
                    >
                        <motion.div
                            animate={{
                                y: [0, -3, 0]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <FaDownload />
                        </motion.div>
                        Resume
                    </motion.a>
                )}
            </AnimatePresence>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}
                >
                    {/* Greeting */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        style={{
                            fontSize: '1.125rem',
                            color: 'white',
                            marginBottom: '1.5rem',
                            fontWeight: '700',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-display)'
                        }}
                    >
                        AI/Ml Researcher & Developer
                    </motion.p>

                    {/* Name with Animated Gradient */}
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 1, type: "spring" }}
                        style={{
                            fontSize: 'clamp(3.5rem, 10vw, 7rem)',
                            fontWeight: '900',
                            lineHeight: 1,
                            marginBottom: '2rem',
                            fontFamily: 'var(--font-display)',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        <span className="animated-gradient" style={{
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'inline-block',
                            textShadow: '0 0 50px rgba(255, 255, 255, 0.3)'
                        }}>
                            MEGH DAVE
                        </span>
                    </motion.h1>

                    {/* Description with Typing Animation */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        style={{
                            fontSize: '1.25rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '3rem',
                            lineHeight: '1.8',
                            maxWidth: '700px',
                            margin: '0 auto 3rem',
                            minHeight: '4.5rem', // Prevent layout shift
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <span>
                            {displayedText}
                            <motion.span
                                animate={{ opacity: showCursor ? 1 : 0 }}
                                style={{
                                    borderRight: '2px solid white',
                                    marginLeft: '2px'
                                }}
                            >
                                &nbsp;
                            </motion.span>
                        </span>
                    </motion.div>

                    {/* CTA Buttons with Pulsing Glow */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            marginBottom: '4rem'
                        }}
                    >
                        <motion.a
                            href="#projects"
                            className="btn btn-primary"
                            animate={{
                                boxShadow: [
                                    '0 0 20px rgba(255, 255, 255, 0.3)',
                                    '0 0 40px rgba(255, 255, 255, 0.5)',
                                    '0 0 20px rgba(255, 255, 255, 0.3)'
                                ]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            whileHover={{
                                scale: 1.05,
                                boxShadow: '0 0 60px rgba(255, 255, 255, 0.6)'
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            View Projects
                        </motion.a>
                        <motion.a
                            href="#contact"
                            className="btn btn-outline"
                            whileHover={{
                                scale: 1.05,
                                borderColor: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Contact
                        </motion.a>
                    </motion.div>

                    {/* Tech Stack Pills with Skill Level Indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}
                    >
                        {techStack.map((tech, i) => (
                            <motion.div
                                key={tech.name}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.3 + i * 0.1, type: "spring" }}
                                whileHover={{ scale: 1.1, y: -5 }}
                                style={{
                                    position: 'relative',
                                    padding: '0.625rem 1.5rem',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: '25px',
                                    cursor: 'pointer',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Background progress bar */}
                                <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${tech.level}%` }}
                                    transition={{ delay: 1.5 + i * 0.1, duration: 1, ease: "easeOut" }}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                                        zIndex: 0
                                    }}
                                />

                                {/* Tech name */}
                                <span style={{
                                    position: 'relative',
                                    zIndex: 1,
                                    fontSize: '0.875rem',
                                    color: 'white',
                                    fontWeight: '700',
                                    fontFamily: 'var(--font-display)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {tech.name}
                                </span>

                                {/* Skill level indicator */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 1 }}
                                    style={{
                                        position: 'absolute',
                                        bottom: '-1.75rem',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: 'rgba(0, 0, 0, 0.9)',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        fontSize: '0.75rem',
                                        color: 'white',
                                        fontWeight: '600',
                                        whiteSpace: 'nowrap',
                                        pointerEvents: 'none'
                                    }}
                                >
                                    {tech.level}% Proficiency
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* Enhanced Scroll Indicator */}
            <motion.div
                animate={{
                    y: [0, 15, 0],
                    opacity: [0.6, 1, 0.6]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    bottom: '3rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                }}
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                whileHover={{ scale: 1.1 }}
            >
                <span style={{
                    fontSize: '0.75rem',
                    color: 'white',
                    fontFamily: 'var(--font-display)',
                    fontWeight: '600',
                    letterSpacing: '0.1em'
                }}>SCROLL</span>
                <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <FaChevronDown style={{ color: 'white', fontSize: '1.25rem' }} />
                </motion.div>
            </motion.div>
        </section>
    );
};

export default Hero;
