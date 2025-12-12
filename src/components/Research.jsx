import React from 'react';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaFlask } from 'react-icons/fa';

const Research = () => {
    const researchProjects = [
        {
            title: 'Accurate calculation of Transpiration using PINN-LSTM model',
            description: 'Exploring the intersection of deep learning and physics by developing neural networks that incorporate physical laws and constraints. This research focuses on solving partial differential equations and modeling complex physical systems using data-driven approaches.',
            status: 'Ongoing',
            tags: ['LSTM', 'PINNs', 'PDEs', 'GANs'],
            link: '#',
            gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)'
        },
        {
            title: 'Explainable ConvNeXt Ensemble for Cervical Cancer Detection',
            description: 'Developing an ensemble-based cervical cancer detection system using ConvNeXt with SHAP and attention-driven explainability. This research focuses on improving the accuracy and interpretability of deep learning models for early and accurate detection of cervical cancer.',
            status: 'Ongoing',
            tags: ['ConvNeXt', 'XAI', 'ConvNext', 'Ensemble Learning'],
            link: '#',
            gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)'
        }
    ];

    return (
        <section id="research" className="section" style={{ background: 'transparent' }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="section-title">Ongoing Research</h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '2rem',
                        marginBottom: '3rem'
                    }}>
                        {researchProjects.map((project, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.15 }}
                                viewport={{ once: true }}
                                className="glass-card"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Status Badge */}
                                <div style={{
                                    position: 'absolute',
                                    top: '1.5rem',
                                    right: '1.5rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    border: '1px solid rgba(139, 92, 246, 0.5)',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    color: 'rgba(196, 181, 253, 1)',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    <FaFlask style={{ fontSize: '0.875rem' }} />
                                    {project.status}
                                </div>



                                <div style={{ padding: '2rem' }}>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        color: 'var(--text-primary)',
                                        marginBottom: '1rem',
                                        fontFamily: 'var(--font-display)',
                                        fontWeight: '700',
                                        paddingRight: '6rem'
                                    }}>
                                        {project.title}
                                    </h3>

                                    <p style={{
                                        color: 'var(--text-secondary)',
                                        lineHeight: '1.7',
                                        marginBottom: '1.5rem',
                                        fontSize: '0.9375rem',
                                        minHeight: '100px'
                                    }}>
                                        {project.description}
                                    </p>

                                    {/* Tags */}
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem',
                                        marginBottom: '1.5rem'
                                    }}>
                                        {project.tags.map((tag, i) => (
                                            <motion.span
                                                key={i}
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                style={{
                                                    padding: '0.375rem 0.875rem',
                                                    background: 'rgba(139, 92, 246, 0.1)',
                                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                                    borderRadius: '6px',
                                                    fontSize: '0.8125rem',
                                                    color: 'rgba(196, 181, 253, 0.9)',
                                                    fontWeight: '600',
                                                    cursor: 'default'
                                                }}
                                            >
                                                {tag}
                                            </motion.span>
                                        ))}
                                    </div>

                                    {/* Learn More Link */}
                                    {project.link !== '#' && (
                                        <motion.a
                                            href={project.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: 'white',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                padding: '0.75rem 1.5rem',
                                                background: 'rgba(139, 92, 246, 0.2)',
                                                border: '1px solid rgba(139, 92, 246, 0.4)',
                                                borderRadius: '8px',
                                                textDecoration: 'none',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)';
                                                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                                                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                                            }}
                                        >
                                            Learn More <FaExternalLinkAlt style={{ fontSize: '0.75rem' }} />
                                        </motion.a>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Research;
