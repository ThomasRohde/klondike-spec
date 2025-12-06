import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGameStore, useSettings } from '@/state/gameStore';
import { GameSettings } from '@/game/types';
import './SettingsPanel.css';

export function SettingsPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const settings = useSettings();
    const updateSettings = useGameStore((state) => state.updateSettings);

    const handleDrawCountChange = (drawCount: 1 | 3) => {
        updateSettings({ drawCount });
    };

    const handleSoundToggle = () => {
        updateSettings({ soundEnabled: !settings.soundEnabled });
    };

    const handleCardBackChange = (cardBack: GameSettings['cardBack']) => {
        updateSettings({ cardBack });
    };

    return (
        <div className="settings-panel">
            <button
                className="settings-panel__toggle"
                onClick={() => { setIsOpen(!isOpen); }}
                title="Settings"
            >
                ⚙️
            </button>

            {isOpen && (
                <>
                    <div className="settings-panel__overlay" onClick={() => { setIsOpen(false); }} />
                    <div className="settings-panel__dropdown">
                        <h3>Settings</h3>

                        <div className="settings-panel__section">
                            <label className="settings-panel__label">Draw Mode</label>
                            <div className="settings-panel__options">
                                <button
                                    className={`settings-panel__option ${settings.drawCount === 1 ? 'settings-panel__option--active' : ''}`}
                                    onClick={() => { handleDrawCountChange(1); }}
                                >
                                    Draw 1
                                </button>
                                <button
                                    className={`settings-panel__option ${settings.drawCount === 3 ? 'settings-panel__option--active' : ''}`}
                                    onClick={() => { handleDrawCountChange(3); }}
                                >
                                    Draw 3
                                </button>
                            </div>
                        </div>

                        <div className="settings-panel__section">
                            <label className="settings-panel__label">Sound</label>
                            <button
                                className={`settings-panel__toggle-button ${settings.soundEnabled ? 'settings-panel__toggle-button--active' : ''}`}
                                onClick={handleSoundToggle}
                            >
                                {settings.soundEnabled ? '🔊 On' : '🔇 Off'}
                            </button>
                            <span className="settings-panel__hint">(Coming soon)</span>
                        </div>

                        <div className="settings-panel__section">
                            <label className="settings-panel__label">Card Back</label>
                            <div className="settings-panel__options">
                                <button
                                    className={`settings-panel__option ${settings.cardBack === 'classic' ? 'settings-panel__option--active' : ''}`}
                                    onClick={() => { handleCardBackChange('classic'); }}
                                >
                                    Classic
                                </button>
                                <button
                                    className={`settings-panel__option ${settings.cardBack === 'modern' ? 'settings-panel__option--active' : ''}`}
                                    onClick={() => { handleCardBackChange('modern'); }}
                                >
                                    Modern
                                </button>
                            </div>
                        </div>

                        <div className="settings-panel__links">
                            <Link to="/help" className="settings-panel__link" onClick={() => { setIsOpen(false); }}>
                                📖 How to Play
                            </Link>
                            <Link to="/" className="settings-panel__link" onClick={() => { setIsOpen(false); }}>
                                🏠 Main Menu
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
