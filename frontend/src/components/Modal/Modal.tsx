'use client';
import React from 'react';
import styles from './Modal.module.css';

interface ModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function Modal({
    isOpen,
    title,
    message,
    type = 'info',
    confirmText = 'Proceed',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
}: ModalProps) {
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={`${styles.modal} animate-in`}>
                <div className={styles.header}>
                    <div className={`${styles.iconWrapper} ${styles[type]}`}>
                        {type === 'danger' && '⚠️'}
                        {type === 'warning' && '🔔'}
                        {type === 'success' && '✅'}
                        {type === 'info' && 'ℹ️'}
                    </div>
                    <h2 className={styles.title}>{title}</h2>
                </div>

                <div className={styles.body}>
                    <p className={styles.message}>{message}</p>
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button
                        className={`${styles.confirmBtn} ${styles[`btn-${type}`]}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
