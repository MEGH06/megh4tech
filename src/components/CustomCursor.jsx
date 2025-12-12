import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const [rotation, setRotation] = useState(0);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Smooth spring animation for cursor position
    const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    // Track previous position for rotation calculation
    const prevPos = useRef({ x: 0, y: 0 });
    const velocity = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const moveCursor = (e) => {
            const { clientX, clientY } = e;

            // Calculate velocity for rotation
            velocity.current = {
                x: clientX - prevPos.current.x,
                y: clientY - prevPos.current.y
            };

            // Calculate rotation based on movement direction
            if (Math.abs(velocity.current.x) > 1 || Math.abs(velocity.current.y) > 1) {
                const angle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI);
                setRotation(angle);
            }

            prevPos.current = { x: clientX, y: clientY };
            cursorX.set(clientX - 20);
            cursorY.set(clientY - 20);
        };

        const handleMouseEnter = () => setIsHovering(true);
        const handleMouseLeave = () => setIsHovering(false);

        // Add hover listeners to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .glass-card, .btn, [role="button"]');

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', handleMouseEnter);
            el.addEventListener('mouseleave', handleMouseLeave);
        });

        window.addEventListener('mousemove', moveCursor);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            interactiveElements.forEach(el => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, [cursorX, cursorY]);

    return (
        <>
            {/* Main Cursor */}
            <motion.div
                ref={cursorRef}
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    x: cursorXSpring,
                    y: cursorYSpring,
                    width: '40px',
                    height: '40px',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    mixBlendMode: 'difference',
                }}
                animate={{
                    rotate: rotation,
                    scale: isHovering ? 1.5 : 1,
                }}
                transition={{
                    rotate: { type: 'spring', stiffness: 100, damping: 15 },
                    scale: { duration: 0.3 }
                }}
            >
                {/* Steering Wheel Image */}
                <img
                    src="/steering-wheel-cursor.svg"
                    alt="steering wheel"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'invert(1) brightness(1.5) drop-shadow(0 0 12px rgba(255, 255, 255, 0.9))',
                    }}
                />
            </motion.div>

            {/* Trail Effect */}
            <motion.div
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    x: cursorXSpring,
                    y: cursorYSpring,
                    width: '40px',
                    height: '40px',
                    pointerEvents: 'none',
                    zIndex: 9998,
                }}
                animate={{
                    rotate: rotation - 45,
                    scale: isHovering ? 2 : 1.2,
                    opacity: isHovering ? 0.3 : 0.15,
                }}
                transition={{
                    rotate: { type: 'spring', stiffness: 80, damping: 20 },
                    scale: { duration: 0.4 },
                    opacity: { duration: 0.3 }
                }}
            >
                <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)',
                    filter: 'blur(8px)',
                }} />
            </motion.div>

            {/* Outer Ring Effect */}
            <motion.div
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    x: cursorXSpring,
                    y: cursorYSpring,
                    width: '40px',
                    height: '40px',
                    pointerEvents: 'none',
                    zIndex: 9997,
                }}
                animate={{
                    scale: isHovering ? 2.5 : 0.8,
                    opacity: isHovering ? 0.6 : 0,
                }}
                transition={{
                    duration: 0.4
                }}
            >
                <div style={{
                    width: '100%',
                    height: '100%',
                    border: '2px solid white',
                    borderRadius: '50%',
                    opacity: 0.5,
                }} />
            </motion.div>
        </>
    );
};

export default CustomCursor;
