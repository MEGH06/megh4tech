import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaStar, FaCodeBranch, FaFilter } from 'react-icons/fa';

const Projects = () => {
    const [activeFilter, setActiveFilter] = useState('All');

    const projects = [
        {
            title: 'CyberSecure',
            description: 'Full intrusion-detection pipeline analyzing 1M+ network logs with 99%+ recall. Features CSV/PCAP ingestion, real-time Wireshark capture, anomaly detection dashboards, Merkle-tree blockchain for immutable logging, and GenAI-driven threat summaries.',
            tags: ['Next.js', 'Merkle-tree', 'Scikit-learn', 'Groq'],
            category: 'Full Stack',
            github: 'https://github.com/KashishM05/redact_cybersecure.git',
            demo: 'https://redact-cybersecure-tau.vercel.app/',
            featured: true,
            image: '/cybersecure.jpg',
            gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)'
        },
        {
            title: 'JigyasaAI',
            description: 'Multimodal RAG chatbot for PDF documents. Upload PDFs and ask questions to retrieve both relevant images and text-based answers, combining visual and textual information for a complete interactive experience.',
            tags: ['Python', 'CLIP Models', 'Cloudinary', 'ChromaDB', 'APIs', 'Streamlit'],
            category: 'AI/ML',
            github: 'https://github.com/MEGH06/JigyasaAI',
            demo: 'https://jigyasaai.streamlit.app/',
            featured: true,
            image: '/jigyasaa.jpg',
            gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.3) 100%)'
        },
        {
            title: 'OOPSIDidntStudy',
            description: 'Last-minute study platform with PanicNotes for auto-generating consolidated notes from multiple file types, CramBot for answering queries from notes, and Quizzard for creating tailored quizzes.',
            tags: ['Python', 'NLP', 'APIs', 'React', 'FastAPI', 'Vercel', 'Streamlit'],
            category: 'Full Stack',
            github: 'https://github.com/ketan-2905/ed_app.git',
            demo: 'https://co-code-frontend-web.vercel.app/',
            featured: false,
            gradient: 'linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(249, 115, 22, 0.3) 100%)'
        },
        {
            title: 'LawTune',
            description: 'Finetuning the Gemma-2B model for legal tasks across 22 Indian languages using Unsloth and free Google Colab resources, while exploring different fine-tuning strategies and finding the right balance between LoRA and QLoRA',
            tags: ['PyTorch', 'TensorFlow', 'Llora'],
            category: 'AI',
            github: 'https://github.com/MEGH06/LawTune',
            demo: '#',
            featured: false,
            gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.3) 0%, rgba(225, 29, 72, 0.3) 100%)'
        },
        {
            title: 'Potato Leaf Detection Model',
            description: 'Neural network implementation for image classification with 99%+ accuracy on Plant datasets.',
            tags: ['PyTorch', 'TensorFlow', 'CNN'],
            category: 'ML',
            github: 'https://github.com/MEGH06/Potato-leaf-detection',
            demo: '#',
            featured: false,
            gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.3) 0%, rgba(225, 29, 72, 0.3) 100%)'
        }
    ];

    const categories = ['All', 'Full Stack', 'AI/ML','ML','AI'];
    const filteredProjects = activeFilter === 'All'
        ? projects
        : projects.filter(p => p.category === activeFilter);

    return (
        <section id="projects" className="section" style={{ background: 'transparent' }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="section-title">Projects</h2>

                    {/* Category Filter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        style={{
                            display: 'flex',
                            gap: '0.75rem',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            marginBottom: '3rem'
                        }}
                    >
                        {categories.map((category) => (
                            <motion.button
                                key={category}
                                onClick={() => setActiveFilter(category)}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '0.625rem 1.5rem',
                                    background: activeFilter === category
                                        ? 'rgba(255, 255, 255, 0.15)'
                                        : 'rgba(255, 255, 255, 0.05)',
                                    border: activeFilter === category
                                        ? '2px solid rgba(255, 255, 255, 0.4)'
                                        : '2px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '25px',
                                    color: activeFilter === category ? 'white' : 'var(--text-secondary)',
                                    fontSize: '0.875rem',
                                    fontWeight: '700',
                                    fontFamily: 'var(--font-display)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <FaFilter style={{ fontSize: '0.75rem' }} />
                                {category}
                            </motion.button>
                        ))}
                    </motion.div>

                    {/* Featured Projects - Large Cards */}
                    <div style={{ marginBottom: '3rem' }}>
                        <h3 style={{
                            fontSize: '1.5rem',
                            color: 'white',
                            fontFamily: 'var(--font-display)',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '2rem',
                            textAlign: 'center'
                        }}>
                            Featured Projects
                        </h3>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                            gap: '2rem',
                            marginBottom: '3rem'
                        }}>
                            {filteredProjects.filter(p => p.featured).map((project, index) => (
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
                                        overflow: 'hidden',
                                        padding: 0
                                    }}
                                >
                                    {/* Project Thumbnail/Image */}
                                    <div style={{
                                        height: '240px',
                                        background: project.gradient,
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {project.image ? (
                                            <img
                                                src={project.image}
                                                alt={project.title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    objectPosition: 'center'
                                                }}
                                            />
                                        ) : (
                                            <>
                                                {/* Animated Grid Pattern */}
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                                                                    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                                                    backgroundSize: '20px 20px',
                                                    opacity: 0.3
                                                }} />

                                                {/* Project Icon */}
                                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" style={{ opacity: 0.8 }}>
                                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                                                </svg>
                                            </>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '2rem' }}>
                                        {/* Badge for Featured */}
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.75rem',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            color: 'white',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            marginBottom: '1rem'
                                        }}>
                                            ⭐ Featured
                                        </div>

                                        <h3 style={{
                                            fontSize: '1.75rem',
                                            color: 'var(--text-primary)',
                                            marginBottom: '1rem',
                                            fontFamily: 'var(--font-display)',
                                            fontWeight: '700'
                                        }}>
                                            {project.title}
                                        </h3>

                                        <p style={{
                                            color: 'var(--text-secondary)',
                                            lineHeight: '1.7',
                                            marginBottom: '1.5rem',
                                            minHeight: '80px',
                                            fontSize: '0.9375rem'
                                        }}>
                                            {project.description}
                                        </p>

                                        {/* Tags with Icons */}
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
                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                                        borderRadius: '6px',
                                                        fontSize: '0.8125rem',
                                                        color: 'rgba(255, 255, 255, 0.9)',
                                                        fontWeight: '600',
                                                        cursor: 'default'
                                                    }}
                                                >
                                                    {tag}
                                                </motion.span>
                                            ))}
                                        </div>

                                        {/* Links */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                            paddingTop: '1rem'
                                        }}>

                                            <div style={{
                                                display: 'flex',
                                                gap: '1rem'
                                            }}>
                                                <motion.a
                                                    href={project.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        color: 'var(--text-secondary)',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '600',
                                                        padding: '0.5rem 1rem',
                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '6px',
                                                        transition: 'all 0.3s'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.color = 'white';
                                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                                    }}
                                                >
                                                    <FaGithub /> Code
                                                </motion.a>
                                                <motion.a
                                                    href={project.demo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        color: 'black',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '700',
                                                        padding: '0.5rem 1rem',
                                                        background: 'white',
                                                        borderRadius: '6px',
                                                        transition: 'all 0.3s'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(255, 255, 255, 0.2)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    <FaExternalLinkAlt /> Live
                                                </motion.a>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Other Projects - Compact Grid */}
                    {filteredProjects.filter(p => !p.featured).length > 0 && (
                        <>
                            <h3 style={{
                                fontSize: '1.5rem',
                                color: 'white',
                                fontFamily: 'var(--font-display)',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '2rem',
                                textAlign: 'center'
                            }}>
                                More Projects
                            </h3>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {filteredProjects.filter(p => !p.featured).map((project, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="glass-card"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <h3 style={{
                                            fontSize: '1.25rem',
                                            color: 'var(--text-primary)',
                                            marginBottom: '0.75rem',
                                            fontFamily: 'var(--font-display)',
                                            fontWeight: '600'
                                        }}>
                                            {project.title}
                                        </h3>

                                        <p style={{
                                            color: 'var(--text-secondary)',
                                            lineHeight: '1.7',
                                            marginBottom: '1.5rem',
                                            flex: 1,
                                            fontSize: '0.9375rem'
                                        }}>
                                            {project.description}
                                        </p>

                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '0.5rem',
                                            marginBottom: '1.5rem'
                                        }}>
                                            {project.tags.slice(0, 3).map((tag, i) => (
                                                <span
                                                    key={i}
                                                    style={{
                                                        padding: '0.25rem 0.75rem',
                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        color: 'rgba(255, 255, 255, 0.8)'
                                                    }}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            gap: '1rem',
                                            marginTop: 'auto'
                                        }}>
                                            <a
                                                href={project.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.875rem',
                                                    transition: 'color 0.3s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                                                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                            >
                                                <FaGithub /> Code
                                            </a>
                                            <a
                                                href={project.demo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.875rem',
                                                    transition: 'color 0.3s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                                                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                            >
                                                <FaExternalLinkAlt /> Demo
                                            </a>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </section>
    );
};

export default Projects;
