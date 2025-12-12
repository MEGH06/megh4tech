import React from 'react';
import { motion } from 'framer-motion';
import { FaMedium, FaExternalLinkAlt, FaClock } from 'react-icons/fa';

const Reads = () => {
    const articles = [
        {
            title: 'Explained Simply: What Are PINNs and Why They Matter',
            description: 'A simple explanation of PINNs and their importance in the field of artificial intelligence.',
            link: 'https://medium.com/@meghdave2006/explained-simply-what-are-pinns-and-why-they-matter-b9ad1f9a1c5c',
            date: '2025',
            readTime: '9 min read',
            image: '/pinn_medium.jpg'
        }
    ];

    return (
        <section id="reads" className="section" style={{ background: 'transparent' }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="section-title">Reads & Articles</h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '3rem'
                    }}>
                        {articles.map((article, index) => (
                            <motion.a
                                key={index}
                                href={article.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="glass-card"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    textDecoration: 'none',
                                    height: '100%',
                                    padding: 0,
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Article Image */}
                                {article.image && (
                                    <div style={{
                                        height: '200px',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        <img
                                            src={article.image}
                                            alt={article.title}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                objectPosition: 'center'
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Article Content */}
                                <div style={{ padding: '2rem' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <FaMedium style={{ color: 'white', fontSize: '1.25rem' }} />
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                {article.date}
                                            </span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.375rem',
                                            color: 'var(--text-muted)',
                                            fontSize: '0.8125rem'
                                        }}>
                                            <FaClock style={{ fontSize: '0.75rem' }} />
                                            {article.readTime}
                                        </div>
                                    </div>

                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        color: 'var(--text-primary)',
                                        marginBottom: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        {article.title}
                                    </h3>

                                    <p style={{
                                        color: 'var(--text-secondary)',
                                        lineHeight: '1.7',
                                        marginBottom: '1.5rem',
                                        flex: 1
                                    }}>
                                        {article.description}
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: '500'
                                    }}>
                                        Read on Medium <FaExternalLinkAlt style={{ fontSize: '0.75rem' }} />
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <a
                            href="https://medium.com/@meghdave2006"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline"
                        >
                            View All Articles
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Reads;
