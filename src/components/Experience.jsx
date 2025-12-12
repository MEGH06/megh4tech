import React from 'react';
import { motion } from 'framer-motion';
import { FaBriefcase, FaChalkboardTeacher, FaCalendarAlt } from 'react-icons/fa';

const Experience = () => {
    const experiences = [
        {
            title: 'Research Intern',
            company: 'IIT Bombay',
            period: '2025 - Present',
            description: 'Working on Physics-Informed Neural Network (PINN)–based models for accurate estimation of transpiration across different plant species. The focus is on embedding biological process constraints into the model to achieve precise, plant-specific transpiration calculations under varying environmental conditions, rather than prioritizing broad generalization.',
            skills: ['Deep Learning', 'Reinforcement Learning'],
            icon: FaBriefcase
        },
        {
            title: 'ML Mentor',
            company: 'DJS Compute',
            period: '2025 - Present',
            description: 'Mentoring juniors in Machine Learning and AI by guiding them through core concepts, practical projects, and best practices. This includes helping them understand algorithms, build hands-on applications, improve their research or coding skills, and develop confidence in real-world problem-solving.',
            skills: ['ML', 'Deep Learning', 'AI'],
            icon: FaChalkboardTeacher
        },
    ];

    return (
        <section id="experience" className="section" style={{ background: 'transparent' }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="section-title">Experience</h2>

                    <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
                        {/* Vertical Timeline Line */}
                        <div style={{
                            position: 'absolute',
                            left: '1.375rem',
                            top: '2rem',
                            bottom: '2rem',
                            width: '2px',
                            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)',
                            zIndex: 0
                        }} />

                        {experiences.map((exp, index) => {
                            const Icon = exp.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{
                                        scale: 1.02,
                                        x: 10,
                                        transition: { duration: 0.3 }
                                    }}
                                    className="glass-card"
                                    style={{
                                        marginBottom: index === experiences.length - 1 ? '0' : '2rem',
                                        position: 'relative',
                                        paddingLeft: '3rem',
                                        borderLeft: '3px solid transparent',
                                        borderImage: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.8) 100%)',
                                        borderImageSlice: 1,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {/* Timeline Dot with Icon */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '0.75rem',
                                        top: '2rem',
                                        width: '24px',
                                        height: '24px',
                                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.8) 100%)',
                                        borderRadius: '50%',
                                        boxShadow: '0 0 0 4px rgba(255, 255, 255, 0.1), 0 0 20px rgba(59, 130, 246, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 1
                                    }}>
                                        <Icon style={{
                                            fontSize: '0.75rem',
                                            color: 'white'
                                        }} />
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '1rem',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem'
                                    }}>
                                        <div>
                                            <h3 style={{
                                                fontSize: '1.25rem',
                                                color: 'var(--text-primary)',
                                                marginBottom: '0.25rem',
                                                fontWeight: '700',
                                                fontFamily: 'var(--font-display)',
                                                textTransform: 'uppercase'
                                            }}>
                                                {exp.title}
                                            </h3>
                                            <p style={{
                                                color: 'rgba(255, 255, 255, 0.9)',
                                                fontSize: '1rem',
                                                fontWeight: '600'
                                            }}>
                                                {exp.company}
                                            </p>
                                        </div>
                                        {/* Period Badge with Calendar Icon */}
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: 'rgba(255, 255, 255, 0.9)',
                                            fontSize: '0.875rem',
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(59, 130, 246, 0.15)',
                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            fontFamily: 'var(--font-display)'
                                        }}>
                                            <FaCalendarAlt style={{ fontSize: '0.875rem' }} />
                                            {exp.period}
                                        </span>
                                    </div>

                                    <p style={{
                                        color: 'var(--text-secondary)',
                                        lineHeight: '1.7',
                                        marginBottom: '1.5rem'
                                    }}>
                                        {exp.description}
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem'
                                    }}>
                                        {exp.skills.map((skill, i) => (
                                            <motion.span
                                                key={i}
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                style={{
                                                    padding: '0.375rem 0.875rem',
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '6px',
                                                    fontSize: '0.8125rem',
                                                    color: 'rgba(255, 255, 255, 0.8)',
                                                    fontWeight: '600',
                                                    cursor: 'default',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {skill}
                                            </motion.span>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Experience;
