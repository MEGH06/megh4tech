import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

// Enhanced counting animation component
const CountingNumber = ({ value, duration = 2500 }) => {
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.5 });
    const [displayValue, setDisplayValue] = useState(0);

    // Extract number and suffix
    const numericValue = parseFloat(value.toString().replace(/[^0-9.]/g, '')) || 0;
    const suffix = value.toString().replace(/[0-9.]/g, '');

    useEffect(() => {
        if (isInView) {
            let startTime = null;
            let animationFrame;

            const animate = (currentTime) => {
                if (!startTime) startTime = currentTime;
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Smooth easing
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = easeOutQuart * numericValue;

                // Handle decimals properly
                setDisplayValue(numericValue % 1 !== 0 ? current.toFixed(2) : Math.floor(current));

                if (progress < 1) {
                    animationFrame = requestAnimationFrame(animate);
                }
            };

            animationFrame = requestAnimationFrame(animate);
            return () => cancelAnimationFrame(animationFrame);
        }
    }, [isInView, numericValue, duration]);

    return (
        <span ref={containerRef}>
            {displayValue}{suffix}
        </span>
    );
};

const About = () => {
    const [activeTab, setActiveTab] = useState('Overview');

    const skills = [
        {
            category: 'Languages',
            items: [
                'Python',
                'JavaScript',
                'C++',
                'C'
            ]
        },
        {
            category: 'Soft Skills',
            items: [
                'Problem Solving',
                'Leadership',
                'Team Work',
                'Communication'
            ]
        },
        {
            category: 'AI/ML',
            items: [
                'Deep Learning',
                'NLP',
                'Computer Vision',
                'Generative AI',
                'TensorFlow'
            ]
        },
        {
            category: 'Web Dev',
            items: [
                'React',
                'Node.js',
                'Express',
                'Tailwind CSS',
                'Flask'
            ]
        },
        {
            category: 'DevOps',
            items: [
                'CI/CD',
                'Git',
                'GitHub',
                'Docker',
                'Kubernetes',

            ]
        },
        {
            category: 'Database',
            items: [
                'MongoDB',
                'MySQL',
                'PostgreSQL',
                'Pinecone',
                'ChromaDB'
            ]
        }

    ];

    const tabs = [
        { id: 'Overview', label: 'Overview' },
        { id: 'education', label: 'Education' },
        { id: 'achievements', label: 'Achievements' }
    ];

    const scrollRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [activeCardIndex, setActiveCardIndex] = useState(0);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || isHovered) return;

        let animationFrameId;
        const scrollSpeed = 0.5; // Smooth slow scroll

        const animate = () => {
            if (scrollContainer) {
                if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 1) {
                    scrollContainer.scrollLeft = 0;
                } else {
                    scrollContainer.scrollLeft += scrollSpeed;
                }

                // Calculate active card index
                const cardWidth = 300 + 24; // card width + gap
                const centerPosition = scrollContainer.scrollLeft + scrollContainer.clientWidth / 2;
                const activeIndex = Math.round(centerPosition / cardWidth);
                setActiveCardIndex(activeIndex % skills.length);

                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isHovered, skills.length]);

    const scrollToCard = (index) => {
        const scrollContainer = scrollRef.current;
        if (scrollContainer) {
            // Pause auto-scroll by setting hover state
            setIsHovered(true);

            // Calculate the scroll position to center the card
            const cardWidth = 300 + 24; // card width + gap (1.5rem = 24px)
            const containerWidth = scrollContainer.clientWidth;
            const targetScroll = (index * cardWidth) - (containerWidth / 2) + (150); // 150 is half card width

            scrollContainer.scrollTo({
                left: Math.max(0, targetScroll),
                behavior: 'smooth'
            });

            // Update active card immediately
            setActiveCardIndex(index);

            // Resume auto-scroll after 3 seconds
            setTimeout(() => {
                setIsHovered(false);
            }, 3000);
        }
    };

    return (
        <section id="about" className="section" style={{ background: 'transparent', paddingTop: '5rem', paddingBottom: '5rem' }}>
            <style>{`
                .skills-scroll-container::-webkit-scrollbar { display: none; }
                .skills-scroll-container { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    <h2 className="section-title" style={{ marginBottom: '3rem' }}>About Me</h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: '2rem',
                        marginBottom: '5rem',
                        alignItems: 'start'
                    }}
                        className="about-grid"
                    >
                        {/* Tabbed Content */}
                        <div className="glass-card" style={{ padding: '2.5rem' }}>
                            {/* Tab Navigation */}
                            <div style={{
                                display: 'flex',
                                gap: '0.75rem',
                                marginBottom: '2.5rem',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                paddingBottom: '1rem',
                                flexWrap: 'wrap'
                            }}>
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        style={{
                                            padding: '0.875rem 1.75rem',
                                            background: activeTab === tab.id
                                                ? 'rgba(255, 255, 255, 0.15)'
                                                : 'transparent',
                                            border: activeTab === tab.id
                                                ? '1px solid rgba(255, 255, 255, 0.3)'
                                                : '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '10px',
                                            color: activeTab === tab.id
                                                ? 'white'
                                                : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            fontSize: '0.9375rem',
                                            fontWeight: activeTab === tab.id ? '600' : '500',
                                            transition: 'all 0.3s ease',
                                            fontFamily: 'var(--font-body)',
                                            flex: '1 1 auto',
                                            minWidth: 'fit-content'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (activeTab !== tab.id) {
                                                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeTab !== tab.id) {
                                                e.target.style.background = 'transparent';
                                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                            }
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                                transition={{
                                    duration: 0.6,
                                    ease: [0.4, 0, 0.2, 1]
                                }}
                                style={{
                                    minHeight: '200px'
                                }}
                            >
                                {activeTab === 'Overview' && (
                                    <div>
                                        <motion.p
                                            style={{
                                                color: 'var(--text-secondary)',
                                                lineHeight: '1.8',
                                                marginBottom: '1rem'
                                            }}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.1 }}
                                        >
                                            I'm currently pursuing a B.Tech in Computer Science and Engineering (Data Science) at D.J. Sanghvi College of Engineering. I like building practical machine learning solutions and understanding how intelligent systems can be used to solve real problems.
                                        </motion.p>
                                        <motion.p
                                            style={{
                                                color: 'var(--text-secondary)',
                                                lineHeight: '1.8',
                                                marginBottom: '1rem'
                                            }}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.2 }}
                                        >
                                            I have worked on medical image preprocessing, document automation, data analytics, and projects in fintech, law, and agriculture.
                                        </motion.p>
                                        <motion.p
                                            style={{
                                                color: 'var(--text-secondary)',
                                                lineHeight: '1.8'
                                            }}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.3 }}
                                        >
                                            I also enjoy learning through research reading papers, exploring different approaches, and trying out methods to understand what works best. I prefer working end-to-end, from understanding the problem to creating a working and useful solution.
                                        </motion.p>
                                    </div>
                                )}

                                {activeTab === 'education' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        {/* Education items remain the same */}
                                        <motion.div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'start',
                                                gap: '1rem'
                                            }}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: 0.1 }}
                                            whileHover={{
                                                scale: 1.02,
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            <motion.div
                                                style={{
                                                    padding: '0.75rem',
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    flexShrink: 0
                                                }}
                                                whileHover={{
                                                    background: 'rgba(255, 255, 255, 0.15)',
                                                    rotate: [0, -10, 10, 0],
                                                    transition: { duration: 0.5 }
                                                }}
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'white' }}>
                                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                                </svg>
                                            </motion.div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{
                                                    color: 'white',
                                                    fontSize: '1rem',
                                                    fontWeight: '600',
                                                    marginBottom: '0.375rem'
                                                }}>
                                                    B.Tech in CSE (Data Science)
                                                </h4>
                                                <p style={{
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.875rem',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    Dwarkadas J. Sanghvi College of Engineering
                                                </p>
                                                <p style={{
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.8125rem',
                                                    marginBottom: '0.75rem'
                                                }}>
                                                    2023 - 2027
                                                </p>
                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: '0.375rem 0.875rem',
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '6px'
                                                }}>
                                                    <span style={{
                                                        color: 'white',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        CGPA: 8.93
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* HSC */}
                                        <motion.div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'start',
                                                gap: '1rem'
                                            }}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: 0.25 }}
                                            whileHover={{
                                                scale: 1.02,
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            <motion.div
                                                style={{
                                                    padding: '0.75rem',
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    flexShrink: 0
                                                }}
                                                whileHover={{
                                                    background: 'rgba(255, 255, 255, 0.15)',
                                                    rotate: [0, -10, 10, 0],
                                                    transition: { duration: 0.5 }
                                                }}
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'white' }}>
                                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                                </svg>
                                            </motion.div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{
                                                    color: 'white',
                                                    fontSize: '1rem',
                                                    fontWeight: '600',
                                                    marginBottom: '0.375rem'
                                                }}>
                                                    Higher Secondary Certificate (HSC)
                                                </h4>
                                                <p style={{
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.875rem',
                                                    marginBottom: '0.75rem'
                                                }}>
                                                    Dixit Rd Jr College
                                                </p>
                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: '0.375rem 0.875rem',
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '6px'
                                                }}>
                                                    <span style={{
                                                        color: 'white',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        78.00%
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* SSC */}
                                        <motion.div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'start',
                                                gap: '1rem'
                                            }}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: 0.4 }}
                                            whileHover={{
                                                scale: 1.02,
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            <motion.div
                                                style={{
                                                    padding: '0.75rem',
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    flexShrink: 0
                                                }}
                                                whileHover={{
                                                    background: 'rgba(255, 255, 255, 0.15)',
                                                    rotate: [0, -10, 10, 0],
                                                    transition: { duration: 0.5 }
                                                }}
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'white' }}>
                                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                                </svg>
                                            </motion.div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{
                                                    color: 'white',
                                                    fontSize: '1rem',
                                                    fontWeight: '600',
                                                    marginBottom: '0.375rem'
                                                }}>
                                                    Secondary School Certificate (SSC)
                                                </h4>
                                                <p style={{
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.875rem',
                                                    marginBottom: '0.75rem'
                                                }}>
                                                    Dominic Savio High School
                                                </p>
                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: '0.375rem 0.875rem',
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '6px'
                                                }}>
                                                    <span style={{
                                                        color: 'white',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        82.20%
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}

                                {activeTab === 'achievements' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <motion.div
                                            style={{
                                                padding: '1rem',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                display: 'flex',
                                                alignItems: 'start',
                                                gap: '1rem'
                                            }}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: 0.1 }}
                                            whileHover={{
                                                scale: 1.02,
                                                background: 'rgba(255, 255, 255, 0.08)',
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            <motion.div
                                                style={{
                                                    padding: '0.5rem',
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '6px',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    flexShrink: 0
                                                }}
                                                whileHover={{
                                                    rotate: [0, -15, 15, 0],
                                                    scale: 1.1,
                                                    transition: { duration: 0.5 }
                                                }}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                    <circle cx="12" cy="8" r="7" />
                                                    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
                                                </svg>
                                            </motion.div>
                                            <div>
                                                <h4 style={{
                                                    color: 'white',
                                                    fontSize: '1rem',
                                                    fontWeight: '600',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    2nd Runner-Up
                                                </h4>
                                                <p style={{
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    Co-Code Hackathon (Hybrid Mode) at DJ Sanghvi College
                                                </p>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            style={{
                                                padding: '1rem',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                display: 'flex',
                                                alignItems: 'start',
                                                gap: '1rem'
                                            }}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: 0.25 }}
                                            whileHover={{
                                                scale: 1.02,
                                                background: 'rgba(255, 255, 255, 0.08)',
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            <motion.div
                                                style={{
                                                    padding: '0.5rem',
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '6px',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    flexShrink: 0
                                                }}
                                                whileHover={{
                                                    rotate: [0, -15, 15, 0],
                                                    scale: 1.1,
                                                    transition: { duration: 0.5 }
                                                }}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                    <circle cx="12" cy="8" r="7" />
                                                    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
                                                </svg>
                                            </motion.div>
                                            <div>
                                                <h4 style={{
                                                    color: 'white',
                                                    fontSize: '1rem',
                                                    fontWeight: '600',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    2nd Runner-Up
                                                </h4>
                                                <p style={{
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    DJS Sanshodhan 2025
                                                </p>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Stats */}
                        <div className="glass-card" style={{
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            minHeight: '100%'
                        }}>
                            <motion.div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '0',
                                    height: '100%'
                                }}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                {[
                                    { label: 'Projects', value: '5+', delay: 0 },
                                    { label: 'CGPA', value: '8.93', delay: 0.1 },
                                    { label: 'Experience', value: '1+ yrs', delay: 0.2 },
                                    { label: 'Students Mentored', value: '40+', delay: 0.3 }
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        style={{
                                            textAlign: 'center',
                                            padding: '1.75rem 1rem',
                                            borderRight: i % 2 === 0 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                            borderBottom: i < 2 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: stat.delay,
                                            ease: "easeOut"
                                        }}
                                        whileHover={{
                                            scale: 1.05,
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            transition: {
                                                duration: 0.2
                                            }
                                        }}
                                        viewport={{ once: true }}
                                    >
                                        <motion.div
                                            style={{
                                                fontSize: '3rem',
                                                fontWeight: '800',
                                                background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                                fontFamily: 'var(--font-display)',
                                                marginBottom: '0.75rem',
                                                lineHeight: '1',
                                                letterSpacing: '-0.02em'
                                            }}
                                            whileHover={{
                                                scale: 1.1,
                                                transition: { duration: 0.3 }
                                            }}
                                        >
                                            {stat.value.includes('yrs') ? (
                                                <>
                                                    <CountingNumber value="1" duration={1500} />
                                                    <span>+ yrs</span>
                                                </>
                                            ) : (
                                                <CountingNumber value={stat.value} duration={2000} />
                                            )}
                                        </motion.div>
                                        <motion.div
                                            style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--text-secondary)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                fontWeight: '600',
                                                lineHeight: '1.4',
                                                maxWidth: '120px'
                                            }}
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            transition={{ delay: stat.delay + 0.2, duration: 0.5 }}
                                            viewport={{ once: true }}
                                        >
                                            {stat.label}
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>

                    {/* Skills Grid */}
                    <div>
                        <motion.h3
                            style={{
                                fontSize: '2rem',
                                marginBottom: '3rem',
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-display)',
                                textAlign: 'center',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                                My Skills
                            </span>
                        </motion.h3>
                        <div
                            ref={scrollRef}
                            className="skills-scroll-container no-scrollbar"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            style={{
                                display: 'flex',
                                gap: '1.5rem',
                                overflowX: 'auto',
                                paddingBottom: '1.5rem',
                                scrollSnapType: 'x mandatory',
                                padding: '2rem 0.5rem',
                                marginBottom: '2rem'
                            }}>
                            {skills.map((skillGroup, i) => {
                                const isCenter = activeCardIndex === i;

                                return (
                                    <motion.div
                                        key={i}
                                        className="glass-card"
                                        animate={{
                                            scale: isCenter ? 1.08 : 1,
                                            background: isCenter
                                                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)'
                                                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
                                            borderColor: isCenter
                                                ? 'rgba(255, 255, 255, 0.4)'
                                                : 'rgba(255, 255, 255, 0.15)',
                                            boxShadow: isCenter
                                                ? '0 20px 60px rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                                                : '0 8px 32px rgba(0, 0, 0, 0.3)'
                                        }}
                                        transition={{ duration: 0.4, ease: 'easeOut' }}
                                        style={{
                                            padding: '2.5rem',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            minWidth: '300px',
                                            scrollSnapAlign: 'center',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            cursor: 'pointer'
                                        }}
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        whileHover={{
                                            y: -12,
                                            scale: 1.1,
                                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
                                            borderColor: 'rgba(255, 255, 255, 0.4)',
                                            boxShadow: '0 20px 60px rgba(255, 255, 255, 0.2)',
                                            transition: { duration: 0.3 }
                                        }}
                                        onClick={() => scrollToCard(i)}
                                    >
                                        {/* Category Icon and Title */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.75rem',
                                            marginBottom: '1.5rem',
                                            width: '100%'
                                        }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {skillGroup.category === 'Languages' && (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                        <path d="M4 7h16M4 12h16M4 17h16" />
                                                        <path d="M7 3v18M17 3v18" />
                                                    </svg>
                                                )}
                                                {skillGroup.category === 'Soft Skills' && (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                        <circle cx="9" cy="7" r="4" />
                                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                                    </svg>
                                                )}
                                                {skillGroup.category === 'AI/ML' && (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="3" />
                                                        <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2" />
                                                    </svg>
                                                )}
                                                {skillGroup.category === 'Web Dev' && (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                                    </svg>
                                                )}
                                                {skillGroup.category === 'DevOps' && (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                                                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                                                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                                                    </svg>
                                                )}
                                                {skillGroup.category === 'Database' && (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                                                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                                                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                                                        <path d="M3 12v7c0 1.66 4 3 9 3s9-1.34 9-3v-7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <h4 style={{
                                                fontSize: '1.25rem',
                                                fontWeight: '700',
                                                color: 'white',
                                                fontFamily: 'var(--font-display)',
                                                letterSpacing: '0.05em'
                                            }}>
                                                {skillGroup.category}
                                            </h4>
                                        </div>

                                        {/* Skills list */}
                                        <ul style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.875rem',
                                            width: '100%',
                                            alignItems: 'flex-start',
                                            paddingLeft: '1rem'
                                        }}>
                                            {skillGroup.items.map((skill, j) => (
                                                <motion.li
                                                    key={j}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-start',
                                                        gap: '0.625rem',
                                                        fontSize: '1rem',
                                                        color: 'var(--text-secondary)',
                                                        fontWeight: '400',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3, delay: i * 0.1 + j * 0.05 }}
                                                    viewport={{ once: true }}
                                                    whileHover={{
                                                        x: 5,
                                                        color: 'white',
                                                        transition: { duration: 0.2 }
                                                    }}
                                                >
                                                    <span style={{
                                                        width: '5px',
                                                        height: '5px',
                                                        background: 'var(--accent-white)',
                                                        borderRadius: '50%',
                                                        opacity: 0.6,
                                                        flexShrink: 0
                                                    }} />
                                                    {skill}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Pagination Dots */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            paddingTop: '1rem'
                        }}>
                            {skills.map((_, i) => (
                                <motion.button
                                    key={i}
                                    onClick={() => scrollToCard(i)}
                                    animate={{
                                        scale: activeCardIndex === i ? 1.2 : 1,
                                        backgroundColor: activeCardIndex === i
                                            ? 'rgba(255, 255, 255, 0.8)'
                                            : 'rgba(255, 255, 255, 0.3)',
                                        width: activeCardIndex === i ? '32px' : '8px'
                                    }}
                                    whileHover={{
                                        scale: 1.3,
                                        backgroundColor: 'rgba(255, 255, 255, 0.6)'
                                    }}
                                    style={{
                                        height: '8px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    aria-label={`Go to ${skills[i].category}`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default About;
